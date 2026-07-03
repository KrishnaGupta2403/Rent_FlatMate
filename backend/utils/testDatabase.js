require('dotenv').config();
const { pool } = require('../config/database');

async function testConnection() {
  // Extract database metadata safely (never print passwords or keys)
  let host = process.env.DB_HOST || 'Unknown';
  let database = process.env.DB_NAME || 'Unknown';

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      host = url.hostname;
      database = url.pathname.replace('/', '');
    } catch (e) {
      // fallback if URL is not standard
    }
  }

  console.log(`Database Host: ${host}`);
  console.log(`Database Name: ${database}`);
  console.log(`SSL Enabled: true`);

  try {
    const client = await pool.connect();
    console.log('\n✓ Database Connected\nConnection Successful');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Database Connection Failed');
    
    // Map error messages to friendly/meaningful ones
    const errMsg = err.message || '';
    const errCode = err.code || '';
    
    if (errCode === '28P01' || errMsg.includes('password authentication failed') || errMsg.includes('Authentication failed')) {
      console.error('Error Detail: Authentication failed / Invalid credentials.');
    } else if (errCode === '3D000' || errMsg.includes('database does not exist')) {
      console.error(`Error Detail: Database "${database}" does not exist on the server.`);
    } else if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) {
      console.error('Error Detail: Incorrect host / DNS lookup failed. Database host is unreachable.');
    } else if (errMsg.includes('ECONNREFUSED') || errMsg.includes('connect ECONNREFUSED')) {
      console.error('Error Detail: Connection refused. Check if database is running and port is correct.');
    } else if (errMsg.includes('ETIMEDOUT') || errMsg.includes('timeout')) {
      console.error('Error Detail: Connection timeout. Network path might be blocked or check security group/IP allowlists.');
    } else if (errMsg.includes('ssl') || errMsg.includes('SSL') || errMsg.includes('handshake')) {
      console.error('Error Detail: SSL handshake failed.');
    } else {
      console.error(`Error Detail: Database unreachable. (${err.message})`);
    }
    process.exit(1);
  }
}

testConnection();
