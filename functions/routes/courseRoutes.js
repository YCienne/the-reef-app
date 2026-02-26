const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const coursesSnapshot = await db.collection('courses').get();
        const courses = [];
        coursesSnapshot.forEach(doc => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get single course
router.get('/:id', async (req, res) => {
    try {
        const doc = await db.collection('courses').doc(req.params.id).get();
        if (doc.exists) {
            res.json({ id: doc.id, ...doc.data() });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create course
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const courseData = req.body;
        // Add timestamp
        courseData.createdAt = new Date().toISOString();

        const docRef = await db.collection('courses').add(courseData);
        res.status(201).json({ id: docRef.id, ...courseData });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(400).json({ message: 'Invalid course data', error: error.message });
    }
});

// Update course
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const courseId = req.params.id;
        const courseData = req.body;

        // Prevent modifying the ID or Original Creation Date if passed
        delete courseData.id;
        courseData.updatedAt = new Date().toISOString();

        await db.collection('courses').doc(courseId).update(courseData);

        res.json({ id: courseId, message: 'Course updated successfully', ...courseData });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
});

// Delete course
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const courseId = req.params.id;
        await db.collection('courses').doc(courseId).delete();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
});

module.exports = router;
