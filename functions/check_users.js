const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function checkUsers() {
    const snapshot = await db.collection('users').get();
    console.log('Total users:', snapshot.size);
    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
}

checkUsers();
