const dotenv = require('dotenv');
// Load environment variables before requiring the app
dotenv.config();

const { app } = require('./index');

const PORT = process.env.LOCAL_BACKEND_PORT || 5000;

app.listen(PORT, () => {
    console.log(`[LOCAL DEV] Backend server running on http://localhost:${PORT}`);
    console.log(`[LOCAL DEV] API root available at http://localhost:${PORT}/api`);
});
