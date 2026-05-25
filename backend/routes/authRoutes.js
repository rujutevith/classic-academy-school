const express = require('express');
const { 
    register, 
    login, 
    getProfile, 
    forgotPassword, 
    resetPassword, 
    changePassword,
    getAllUsers,
    updateUserStatus
} = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Debug middleware for auth routes - MORE DETAILED
router.use((req, res, next) => {
    console.log('\n🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹');
    console.log(`[Auth Route Middleware]`);
    console.log(`  Method: ${req.method}`);
    console.log(`  URL: ${req.url}`);
    console.log(`  Content-Type: ${req.headers['content-type']}`);
    console.log(`  Body exists: ${!!req.body}`);
    console.log(`  Body keys: ${req.body ? Object.keys(req.body).join(', ') : 'none'}`);
    console.log(`  Body:`, req.body);
    console.log('🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹\n');
    next();
});

// Test routes
router.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Auth routes are mounted and working!',
        timestamp: new Date().toISOString()
    });
});

router.post('/test-body', (req, res) => {
    console.log('[Auth Test Body] Received:', req.body);
    res.json({ 
        success: true,
        message: 'Auth body parser is working!', 
        receivedBody: req.body,
        bodyKeys: Object.keys(req.body)
    });
});

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/change-password', authenticateToken, changePassword);

// Admin only routes
router.get('/users', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/status', authenticateToken, authorizeRoles('admin'), updateUserStatus);

module.exports = router;