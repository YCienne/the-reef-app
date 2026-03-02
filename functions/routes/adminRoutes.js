const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get Platform Metrics
router.get('/metrics', async (req, res) => {
    console.log('[ADMIN] /metrics endpoint called');
    try {
        const [usersSnapshot, coursesSnapshot, enrollmentsSnapshot] = await Promise.all([
            db.collection('users').get(),
            db.collection('courses').get(),
            db.collectionGroup('enrollments').get()
        ]);

        let totalUsers = 0;
        let totalAdmins = 0;
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            totalUsers++;
            if (data.role === 'admin') totalAdmins++;
        });

        const result = {
            totalUsers,
            totalStudents: totalUsers - totalAdmins,
            totalAdmins,
            totalCourses: coursesSnapshot.size,
            totalEnrollments: enrollmentsSnapshot.size
        };
        console.log('[ADMIN] /metrics result:', result);
        res.json(result);
    } catch (error) {
        console.error('[ADMIN] /metrics ERROR:', error.message);
        res.status(500).json({ message: 'Server Error fetching metrics' });
    }
});

// Get Enrollment Counts Per Course
router.get('/enrollments-per-course', async (req, res) => {
    console.log('[ADMIN] /enrollments-per-course endpoint called');
    try {
        const [enrollmentsSnapshot, coursesSnapshot] = await Promise.all([
            db.collectionGroup('enrollments').get(),
            db.collection('courses').get()
        ]);

        const courseEnrollmentCounts = {};
        enrollmentsSnapshot.forEach(doc => {
            const { courseId } = doc.data();
            if (courseId) {
                courseEnrollmentCounts[courseId] = (courseEnrollmentCounts[courseId] || 0) + 1;
            }
        });

        const result = [];
        coursesSnapshot.forEach(doc => {
            const data = doc.data();
            result.push({
                courseId: doc.id,
                title: data.title,
                category: data.category,
                enrollmentCount: courseEnrollmentCounts[doc.id] || 0
            });
        });

        result.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        console.log('[ADMIN] /enrollments-per-course result:', result.length, 'courses');
        res.json(result);
    } catch (error) {
        console.error('[ADMIN] /enrollments-per-course ERROR:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Recent Activity Feed
router.get('/recent-activity', async (req, res) => {
    console.log('[ADMIN] /recent-activity endpoint called');
    try {
        const limit = parseInt(req.query.limit) || 20;

        let enrollmentsSnapshot;
        try {
            enrollmentsSnapshot = await db.collectionGroup('enrollments')
                .orderBy('enrolledAt', 'desc')
                .limit(limit)
                .get();
        } catch (indexError) {
            console.warn('[ADMIN] /recent-activity orderBy query failed (likely missing index), falling back to unordered query:', indexError.message);
            enrollmentsSnapshot = await db.collectionGroup('enrollments')
                .limit(limit)
                .get();
        }

        const activities = [];
        const userCache = {};
        const courseCache = {};

        for (const doc of enrollmentsSnapshot.docs) {
            const data = doc.data();
            const userId = doc.ref.parent.parent.id;

            if (!userCache[userId]) {
                const userDoc = await db.collection('users').doc(userId).get();
                userCache[userId] = userDoc.exists ? userDoc.data().name : 'Unknown User';
            }

            if (data.courseId && !courseCache[data.courseId]) {
                const courseDoc = await db.collection('courses').doc(data.courseId).get();
                courseCache[data.courseId] = courseDoc.exists ? courseDoc.data().title : 'Unknown Course';
            }

            activities.push({
                type: 'enrollment',
                userName: userCache[userId],
                userId,
                courseTitle: courseCache[data.courseId] || 'Unknown Course',
                courseId: data.courseId,
                timestamp: data.enrolledAt,
                completedLessonsCount: data.completedLessons ? data.completedLessons.length : 0
            });
        }

        console.log('[ADMIN] /recent-activity result:', activities.length, 'activities');
        res.json(activities);
    } catch (error) {
        console.error('[ADMIN] /recent-activity ERROR:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Learner Progress (all students with their enrollments)
router.get('/learner-progress', async (req, res) => {
    console.log('[ADMIN] /learner-progress endpoint called');
    try {
        const usersSnapshot = await db.collection('users').where('role', '==', 'student').get();

        const learners = [];

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;

            const enrollmentsSnapshot = await db.collection('users').doc(userId)
                .collection('enrollments').get();

            const enrollments = [];
            enrollmentsSnapshot.forEach(enrollDoc => {
                const e = enrollDoc.data();
                enrollments.push({
                    courseId: e.courseId,
                    completedLessonsCount: e.completedLessons ? e.completedLessons.length : 0,
                    enrolledAt: e.enrolledAt,
                    lastAccessed: e.lastAccessed
                });
            });

            learners.push({
                userId,
                name: userData.name || 'Unnamed',
                email: userData.email,
                createdAt: userData.createdAt,
                totalEnrollments: enrollments.length,
                enrollments
            });
        }

        learners.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        console.log('[ADMIN] /learner-progress result:', learners.length, 'learners');
        res.json(learners);
    } catch (error) {
        console.error('[ADMIN] /learner-progress ERROR:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
