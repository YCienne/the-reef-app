const admin = require('firebase-admin');
const serviceAccount = require('./futuremindVB.json');

const emailToPromote = process.argv[2];

if (!emailToPromote) {
    console.error('Please provide an email address as an argument.');
    console.log('Usage: node promote_admin.js email@example.com');
    process.exit(1);
}

// Initialize Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function promote() {
    try {
        console.log(`Searching for user with email: ${emailToPromote}...`);

        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(emailToPromote);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.error(`Error: No user found in Firebase Auth with email: ${emailToPromote}`);
            } else {
                console.error('Error fetching user from Auth:', error);
            }
            return;
        }

        const uid = userRecord.uid;
        console.log(`Found user in Auth. UID: ${uid}`);

        const userRef = db.collection('users').doc(uid);
        await userRef.set({
            email: emailToPromote,
            role: 'admin',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log(`Successfully promoted ${emailToPromote} to admin in Firestore!`);
    } catch (error) {
        console.error('Error during promotion process:', error);
    } finally {
        process.exit();
    }
}

promote();
