const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const salaryRoutes = require('./routes/salaryRoutes');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();

// ==================== CORS CONFIGURATION ====================
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// ==================== RAW BODY PARSER (for debugging) ====================
app.use((req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        if (data) {
            req.rawBody = data;
            console.log('\n📦 Raw request body received');
        }
        next();
    });
    if (req.headers['content-length'] === '0' || !req.readable) {
        next();
    }
});

// ==================== BODY PARSER MIDDLEWARE ====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== LOGGING MIDDLEWARE ====================
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Parsed Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// ==================== TEST ENDPOINTS ====================

app.get('/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

app.post('/test-body', (req, res) => {
    console.log('✅ Test body received:', req.body);
    res.json({ 
        success: true,
        message: 'Body parser is working!', 
        receivedBody: req.body 
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Classic Academy EIMS API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/public-test', (req, res) => {
    res.json({ 
        success: true,
        message: 'Public endpoint is working!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test-auth', authenticateToken, (req, res) => {
    res.json({ 
        success: true,
        message: 'Authentication successful!', 
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role,
            email: req.user.email
        }
    });
});

// ==================== API ROUTES ====================
console.log('\n📌 Mounting routes...');
app.use('/api/auth', authRoutes);
console.log('  ✅ /api/auth mounted');
app.use('/api/employees', employeeRoutes);
console.log('  ✅ /api/employees mounted');
app.use('/api/departments', departmentRoutes);
console.log('  ✅ /api/departments mounted');
app.use('/api/attendance', attendanceRoutes);
console.log('  ✅ /api/attendance mounted');
app.use('/api/salaries', salaryRoutes);
console.log('  ✅ /api/salaries mounted');

// ==================== 404 HANDLER - FIXED (no wildcard *) ====================
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        success: false,
        message: 'Route not found',
        path: req.url,
        method: req.method
    });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
    console.error('💥 Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in .env file');
    process.exit(1);
}

// Start server
app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 Classic Academy EIMS Backend');
    console.log('=================================');
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔐 JWT Secret: ✅ Configured`);
    console.log('=================================\n');
    
    console.log('✅ Available Endpoints:');
    console.log(`  GET  http://localhost:${PORT}/test`);
    console.log(`  POST http://localhost:${PORT}/test-body`);
    console.log(`  POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  GET  http://localhost:${PORT}/api/employees`);
    console.log(`  GET  http://localhost:${PORT}/api/departments`);
    console.log('=================================\n');
});

module.exports = app;