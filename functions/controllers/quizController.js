const admin = require('firebase-admin');
const db = admin.firestore();

// Get quiz by courseId and moduleId
const getQuiz = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;

        console.log(`Fetching quiz for Course: ${courseId}, Module: ${moduleId}`);

        const quizzesRef = db.collection('quizzes');
        const snapshot = await quizzesRef
            .where('courseId', '==', courseId)
            .where('moduleId', '==', moduleId) // Note: moduleId might need to be parsed to number depending on storage
            .limit(1)
            .get();

        if (snapshot.empty) {
            // Fallback for development/demo purposes if no quiz exists
            // This allows the UI to show a demo quiz without manual database seeding every time.
            // correctIndex/explanation are intentionally omitted from the response below.
            return res.json({
                success: true,
                data: {
                    id: 'demo-quiz',
                    courseId,
                    moduleId,
                    title: `Module ${moduleId} Assessment`,
                    questions: [
                        {
                            id: 1,
                            text: "What is the primary benefit of Neural Networks in this context?",
                            options: ["They are cheaper", "They can learn from data", "They use less power", "They are easier to code"]
                        },
                        {
                            id: 2,
                            text: "Which Python library is commonly used for Neural Networks?",
                            options: ["React", "TensorFlow", "Pandas", "Express"]
                        },
                        {
                            id: 3,
                            text: "Who is the 'Godfather of AI'?",
                            options: ["Geoffrey Hinton", "Elon Musk", "Alan Turing", "Sam Altman"]
                        }
                    ]
                }
            });
        }

        const quizDoc = snapshot.docs[0];
        const quizData = quizDoc.data();

        // Strip correctIndex/explanation so answers can't be read from the
        // network response before (or after) attempting the quiz.
        const sanitizedQuestions = (quizData.questions || []).map(
            ({ correctIndex, explanation, ...q }) => q
        );

        res.json({
            success: true,
            data: { id: quizDoc.id, ...quizData, questions: sanitizedQuestions }
        });

    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quiz',
            error: error.message
        });
    }
};

// Submit quiz answers and calculate score
const submitQuiz = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { answers } = req.body; // Expect object { qId: selectedIndex, ... }

        // Fetch the quiz to get correct answers
        const quizzesRef = db.collection('quizzes');
        const snapshot = await quizzesRef
            .where('courseId', '==', courseId)
            .where('moduleId', '==', moduleId)
            .limit(1)
            .get();

        // If standard quiz fetching failed, use the demo logic for consistent behavior
        let questions = [];
        if (snapshot.empty) {
            questions = [
                { id: 1, correctIndex: 1 },
                { id: 2, correctIndex: 1 },
                { id: 3, correctIndex: 0 }
            ];
        } else {
            questions = snapshot.docs[0].data().questions;
        }

        let score = 0;
        let total = questions.length;
        const results = [];

        questions.forEach((q, index) => {
            const userAns = answers[index]; // Assuming array based or use q.id map
            const isCorrect = userAns === q.correctIndex;
            if (isCorrect) score++;
            results.push({
                questionId: q.id,
                correct: isCorrect,
                // correctIndex intentionally omitted - don't reveal the answer key
                userIndex: userAns
            });
        });

        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= 70;

        // Optional: Save attempt to Firestore 'quiz_attempts'
        // await db.collection('quiz_attempts').add({ ... })

        res.json({
            success: true,
            data: {
                score,
                total,
                percentage,
                passed,
                results
            }
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit quiz'
        });
    }
};

// Create or Update quiz
const upsertQuiz = async (req, res) => {
    try {
        const { courseId, moduleId } = req.params;
        const { questions, title } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ success: false, message: 'Questions array is required' });
        }

        console.log(`Upserting quiz for Course: ${courseId}, Module: ${moduleId}`);

        const quizzesRef = db.collection('quizzes');
        const snapshot = await quizzesRef
            .where('courseId', '==', courseId)
            .where('moduleId', '==', moduleId)
            .limit(1)
            .get();

        const quizData = {
            courseId,
            moduleId,
            title: title || `Module ${moduleId} Assessment`,
            questions,
            updatedAt: new Date().toISOString()
        };

        if (snapshot.empty) {
            // Create new
            quizData.createdAt = new Date().toISOString();
            const docRef = await quizzesRef.add(quizData);
            res.json({ success: true, message: 'Quiz created', id: docRef.id });
        } else {
            // Update existing
            const docId = snapshot.docs[0].id;
            await quizzesRef.doc(docId).update(quizData);
            res.json({ success: true, message: 'Quiz updated', id: docId });
        }
    } catch (error) {
        console.error('Error upserting quiz:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save quiz',
            error: error.message
        });
    }
};

module.exports = {
    getQuiz,
    submitQuiz,
    upsertQuiz
};
