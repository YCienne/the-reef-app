const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require('firebase-admin');
const db = admin.firestore();

// Initialize Gemini
// Note: Ensure GEMINI_API_KEY is defined in functions config or .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');

router.post('/', async (req, res) => {
    try {
        const { message, history } = req.body;

        // 1. Fetch available courses to give context to the AI
        let courseContext = '';
        try {
            const coursesSnapshot = await db.collection('courses').get();
            const courses = [];
            coursesSnapshot.forEach(doc => {
                courses.push(doc.data());
            });

            courseContext = courses.map(c =>
                `- ${c.title} ($${c.price}): ${c.description} (Level: ${c.level}, Category: ${c.category})`
            ).join('\n');
        } catch (dbError) {
            console.warn('Chat: Could not fetch courses from DB, using fallback.', dbError.message);
            courseContext = 'No specific course data available right now. Please ask the user generally about their interests in AI and Robotics.';
        }

        // 2. Construct the system prompt
        const systemPrompt = `
You are "Coral", a helpful and enthusiastic AI sales assistant for "The Reef", an e-learning platform focused on AI and Robotics in Africa.
Your goal is to help users find the perfect course for them based on their interests and current skill level.

Here are the courses we currently offer:
${courseContext}

Rules:
1. Be friendly, encouraging, and professional.
2. Ask probing questions to understand the user's background (e.g., "Do you have any coding experience?" or "Are you interested in building hardware robots or software AI?").
3. Recommend specific courses from the list above that match their needs. Mention the price and why it's a good fit.
4. If they ask about something we don't offer, politely steer them towards our related offerings (AI, Robotics, IoT).
5. Keep responses concise (under 3-4 sentences) unless explaining a course detail.
6. Do not make up courses that are not in the list.

Current conversation:
${history ? history.map(h => `${h.role === 'user' ? 'User' : 'Coral'}: ${h.text}`).join('\n') : ''}
User: ${message}
Coral:
`;

        // 3. Call Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
            reply: "I'm having a little trouble connecting to my brain right now. Please check if the GEMINI_API_KEY is set in the backend .env file!"
        });
    }
});

module.exports = router;
