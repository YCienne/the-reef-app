const admin = require('firebase-admin');
const db = admin.firestore();

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Fast profile lookup for roles
            const userDoc = await db.collection('users').doc(decodedToken.uid).get();
            let role = 'student';
            if (userDoc.exists) {
                role = userDoc.data().role || 'student';
            }

            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                role: role
            };

            return next();
        } catch (error) {
            console.error('Not authorized, token failed', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, adminOnly };
