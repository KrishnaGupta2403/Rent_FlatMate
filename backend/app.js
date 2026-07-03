const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/auth/auth.routes');
const usersRoutes = require('./src/users/users.routes');
const ownerRoutes = require('./src/owner/owner.routes');
const listingRoutes = require('./src/listing/listing.routes');
const tenantRoutes = require('./src/tenant/tenant.routes');
const searchRoutes = require('./src/search/search.routes');
const aiRoutes = require('./src/ai/compatibility.routes');
const interestRoutes = require('./src/interest/interest.routes');
const chatRoutes = require('./src/chat/chat.routes');
const notificationRoutes = require('./src/notifications/notification.routes');
const adminRoutes = require('./src/admin/admin.routes');
const path = require('path');

// Import middlewares for testing role guard directly
const authMiddleware = require('./middleware/auth.middleware');
const roleGuard = require('./middleware/role.middleware');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Static files for local image uploads fallback
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai/compatibility', aiRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Role Guard Test Endpoints (for verifying auth and roles)
app.get('/api/test/tenant', authMiddleware, roleGuard(['TENANT']), (req, res) => {
  res.status(200).json({ message: 'Welcome Tenant!', user: req.user });
});

app.get('/api/test/owner', authMiddleware, roleGuard(['OWNER']), (req, res) => {
  res.status(200).json({ message: 'Welcome Owner!', user: req.user });
});

app.get('/api/test/admin', authMiddleware, roleGuard(['ADMIN']), (req, res) => {
  res.status(200).json({ message: 'Welcome Admin!', user: req.user });
});

app.get('/api/test/authenticated', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Welcome Authenticated User!', user: req.user });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Rent Flatmate Auth & Users API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid or malformed JSON body in request. Please ensure valid JSON format.' });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
