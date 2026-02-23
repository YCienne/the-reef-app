const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Middleware to ensure user is authenticated could be applied here
// const { protect } = require('../middleware/authMiddleware');

// Enroll User in a Course
router.post('/enroll', async (req, res) => {
    try {
        const { userId, courseId } = req.body;

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
router.post('/progress', async (req, res) => {
    try {
        const { userId, courseId, lessonId } = req.body;

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

module.exports = router;
