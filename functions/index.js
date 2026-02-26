const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Initialize Firebase Admin with optional config for local dev
const adminConfig = process.env.FIREBASE_CONFIG
    ? JSON.parse(process.env.FIREBASE_CONFIG)
    : {
        storageBucket: process.env.STORAGE_BUCKET || "doit-89cb3.appspot.com"
    };

admin.initializeApp(adminConfig);

const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request Logger to debug 404s
app.use((req, res, next) => {
    console.log(`[DEBUG] Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

const paystackRoutes = require('./routes/paystackRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const courseRoutes = require('./routes/courseRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');

const apiRouter = express.Router();

apiRouter.use('/paystack', paystackRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/courses', courseRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/quiz', quizRoutes);
apiRouter.use('/admin', adminRoutes);

apiRouter.get('/', (req, res) => {
    res.send('The Reef API is running on Firebase Cloud Functions!');
});

// Support both /api/... (direct) and /... (when Hosting strips /api)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Export the Express app as a 2nd Gen Cloud Function called 'api'
exports.api = onRequest({
    timeoutSeconds: 300,
    memory: "512MiB",
    secrets: ["GEMINI_API_KEY", "PAYSTACK_SECRET_KEY", "PAYSTACK_PUBLIC_KEY", "FRONTEND_URL"]
}, app);

module.exports = { app };
