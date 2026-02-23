const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Get quiz for a specific module
router.get('/:courseId/:moduleId', quizController.getQuiz);

// Submit quiz for a specific module
router.post('/:courseId/:moduleId/submit', quizController.submitQuiz);

module.exports = router;
