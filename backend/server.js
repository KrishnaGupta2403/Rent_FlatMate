require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/database');
const { initSocket } = require('./src/socket/socket');
const { startCron } = require('./src/jobs/emailQueue');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check DB Connection once on startup
    const client = await pool.connect();
    console.log('✓ Database Connected successfully');
    client.release();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });

    // Initialize Socket.IO
    initSocket(server);
    console.log('✓ Socket.IO server initialized');

    // Start Email Retry Worker
    startCron(30000);
  } catch (error) {
    console.error('✗ Server failed to start due to database error:', error.message);
    process.exit(1);
  }
}

startServer();
