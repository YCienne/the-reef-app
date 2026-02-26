const admin = require('firebase-admin');
const serviceAccount = require('./futuremindVB.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function listAllAuthUsers(nextPageToken) {
    try {
        const listUsersResult = await admin.auth().listUsers(100, nextPageToken);
        listUsersResult.users.forEach((userRecord) => {
            console.log(`- UID: ${userRecord.uid}, Email: ${userRecord.email}, Name: ${userRecord.displayName}`);
        });
        if (listUsersResult.pageToken) {
            listAllAuthUsers(listUsersResult.pageToken);
        }
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        if (!nextPageToken) {
            // Give some time for logs
            setTimeout(() => process.exit(), 2000);
        }
    }
}

listAllAuthUsers();
