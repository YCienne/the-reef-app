const admin = require('firebase-admin');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            return next();
        } catch (error) {
            console.error('Not authorized, token failed', error);
            // Fallthrough to mock for now if strict auth is not ready
        }
    }

    // Mock auth fallback (Migrated from legacy backend)
    // TODO: Remove this fallback once Frontend sends valid tokens for all requests
    req.user = {
        uid: 'mock_user_id',
        name: 'Test User',
        email: 'test@example.com'
    };
    next();
};

module.exports = { protect };
