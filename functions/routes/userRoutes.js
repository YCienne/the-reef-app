const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Middleware to ensure user is authenticated could be applied here
const { protect } = require('../middleware/authMiddleware');

// Enroll User in a Course
router.post('/enroll', protect, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.uid;

        if (!userId || !courseId) {
            return res.status(400).json({ message: 'Missing userId or courseId' });
        }

        const enrollmentRef = db.collection('users').doc(userId).collection('enrollments').doc(courseId);
        const enrollmentDoc = await enrollmentRef.get();

        if (enrollmentDoc.exists) {
            return res.status(200).json({ message: 'Already enrolled', ...enrollmentDoc.data() });
        }

        const newEnrollment = {
            courseId,
            enrolledAt: new Date().toISOString(),
            progress: 0,
            completedLessons: [],
            lastAccessed: new Date().toISOString()
        };

        await enrollmentRef.set(newEnrollment);
        res.status(201).json(newEnrollment);
    } catch (error) {
        console.error('Error enrolling user:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get User Dashboard (Enrolled Courses with Progress)
router.get('/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const enrollmentsSnapshot = await db.collection('users').doc(userId).collection('enrollments').get();

        if (enrollmentsSnapshot.empty) {
            return res.json([]);
        }

        const dashboardData = [];

        // Fetch course details for each enrollment
        // Note: In a production app with many courses, map/promise.all is fine but watch for limits.
        const enrollments = [];
        enrollmentsSnapshot.forEach(doc => enrollments.push(doc.data()));

        await Promise.all(enrollments.map(async (enrollment) => {
            try {
                const courseDoc = await db.collection('courses').doc(enrollment.courseId).get();
                if (courseDoc.exists) {
                    const courseData = courseDoc.data();
                    // Calculate basic progress stats
                    // Assuming courseData has 'modules' array with lessons

                    let totalLessons = 0;
                    if (courseData.modules) {
                        courseData.modules.forEach(m => {
                            if (m.lessons) totalLessons += m.lessons.length;
                        });
                    }

                    // Recalculate progress percentage just in case
                    const completedCount = enrollment.completedLessons ? enrollment.completedLessons.length : 0;
                    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                    dashboardData.push({
                        ...courseData, // Course Title, Image, Description
                        courseId: enrollment.courseId, // Ensure ID is explicit
                        enrollment: {
                            ...enrollment,
                            progress: progressPercent
                        },
                        totalLessons
                    });
                }
            } catch (err) {
                console.error(`Error fetching course ${enrollment.courseId}:`, err);
            }
        }));

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Progress (Mark Lesson Complete)
router.post('/progress', protect, async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.user.uid;

        if (!userId || !courseId || !lessonId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const enrollmentRef = db.collection('users').doc(userId).collection('enrollments').doc(courseId);
        const enrollmentDoc = await enrollmentRef.get();

        if (!enrollmentDoc.exists) {
            return res.status(404).json({ message: 'User not enrolled in this course' });
        }

        const enrollmentData = enrollmentDoc.data();
        let completedLessons = enrollmentData.completedLessons || [];

        // Add lesson if not already completed
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
        }

        await enrollmentRef.update({
            completedLessons,
            lastAccessed: new Date().toISOString(),
            // Progress percentage will be recalculated on read or can be updated here if we fetch course metadata
        });

        res.json({ message: 'Progress updated', completedLessons });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get User Profile/Role
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(userDoc.data());
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Secure User Registration Route
router.post('/register', async (req, res) => {
    try {
        const { uid, email, name, inviteCode } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ message: 'Missing uid or email' });
        }

        // Determine role securely on the backend
        const adminSecret = process.env.ADMIN_SECRET;
        console.log(`[DEBUG] Backend Register - Received inviteCode: "${inviteCode}"`);
        console.log(`[DEBUG] Backend Register - Env ADMIN_SECRET: "${adminSecret}"`);

        const isAdmin = inviteCode === adminSecret;
        console.log(`[DEBUG] Backend Register - isAdmin evaluated to: ${isAdmin}`);
        const role = isAdmin ? 'admin' : 'student';

        console.log(`[DEBUG] Backend Register - Attempting to create user doc for uid: ${uid}`);
        // Use Admin SDK to bypass client security rules and create the document
        await db.collection('users').doc(uid).set({
            name: name || '',
            email: email,
            role: role,
            createdAt: new Date().toISOString()
        });

        res.status(201).json({
            message: 'User registered successfully',
            role: role
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server Error during registration' });
    }
});

module.exports = router;
