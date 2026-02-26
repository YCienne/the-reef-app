const admin = require('firebase-admin');
const serviceAccount = require('./futuremindVB.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUser() {
    const uid = 'VRZelkT6C7PkcRaIMnpZaYi9VSY2';
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            console.log('User document data:', userDoc.data());
        } else {
            console.log('User document does not exist!');
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        process.exit();
    }
}

checkUser();
