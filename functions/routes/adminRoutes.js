const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Get Platform Metrics
router.get('/metrics', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const coursesSnapshot = await db.collection('courses').get();

        let totalUsers = 0;
        let totalAdmins = 0;
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            totalUsers++;
            if (data.role === 'admin') totalAdmins++;
        });

        // Try to estimate total enrollments (this would be better structured in the DB if extremely large, but this works for now)
        let totalEnrollments = 0;
        coursesSnapshot.forEach(doc => {
            // Note: Since enrollments are subcollections on users in this architecture, 
            // a true "total enrollment" count requires querying each user's subcollection 
            // or maintaining a counter document. For simplicity in the MVP dashboard, 
            // we will count total users and courses. We could refine this later.
        });

        res.json({
            totalUsers: totalUsers,
            totalStudents: totalUsers - totalAdmins,
            totalAdmins: totalAdmins,
            totalCourses: coursesSnapshot.size
        });
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        res.status(500).json({ message: 'Server Error fetching metrics' });
    }
});

module.exports = router;
