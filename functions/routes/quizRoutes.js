const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Get quiz for a specific module
router.get('/:courseId/:moduleId', quizController.getQuiz);

// Submit quiz for a specific module
router.post('/:courseId/:moduleId/submit', quizController.submitQuiz);

// Create or update quiz (Admin only)
router.put('/:courseId/:moduleId', protect, adminOnly, quizController.upsertQuiz);

module.exports = router;
