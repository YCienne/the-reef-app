const admin = require('firebase-admin');
const serviceAccount = require('./futuremindVB.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function findSamuel() {
    try {
        const usersSnapshot = await db.collection('users').get();
        if (usersSnapshot.empty) {
            console.log('No users found.');
            return;
        }
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- UID: ${doc.id}, Email: ${data.email}, Name: ${data.name}, Role: ${data.role}`);
        });
    } catch (error) {
        console.error('Error finding Samuel:', error);
    } finally {
        process.exit();
    }
}

findSamuel();
