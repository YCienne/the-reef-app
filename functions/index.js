const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

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

app.use('/api/paystack', paystackRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', require('./routes/quizRoutes'));

app.get('/', (req, res) => {
    res.send('The Reef API is running on Firebase Cloud Functions!');
});

// Export the Express app as a 2nd Gen Cloud Function called 'api'
exports.api = onRequest({
    timeoutSeconds: 300,
    memory: "512MiB",
    secrets: ["GEMINI_API_KEY", "PAYSTACK_SECRET_KEY", "PAYSTACK_PUBLIC_KEY", "FRONTEND_URL"]
}, app);
