const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

// Register new user
const register = async (req, res) => {
    try {
        console.log('📝 Register attempt:', req.body);
        const { username, email, password, role, employee_id } = req.body;
        
        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Username or email already exists' 
            });
        }
        
        const password_hash = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash, role, employee_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, password_hash, role || 'employee', employee_id || null, true]
        );
        
        res.status(201).json({ 
            success: true,
            message: 'User created successfully', 
            userId: result.insertId 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating user', 
            error: error.message 
        });
    }
};

// Login user - SIMPLIFIED WITH DEBUGGING
const login = async (req, res) => {
    console.log('\n🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪');
    console.log('LOGIN FUNCTION STARTED');
    console.log('🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪\n');
    
    // Log everything about the request
    console.log('1️⃣ Request method:', req.method);
    console.log('2️⃣ Request URL:', req.url);
    console.log('3️⃣ Content-Type header:', req.headers['content-type']);
    console.log('4️⃣ req.body exists?', !!req.body);
    console.log('5️⃣ req.body type:', typeof req.body);
    console.log('6️⃣ req.body value:', JSON.stringify(req.body, null, 2));
    
    // Try to get data from different sources
    let username = null;
    let password = null;
    
    // Try from req.body
    if (req.body && typeof req.body === 'object') {
        username = req.body.username;
        password = req.body.password;
        console.log('7️⃣ From req.body - username:', username, 'password:', !!password);
    }
    
    // If not found, try to parse raw body
    if (!username && req.rawBody) {
        try {
            const parsed = JSON.parse(req.rawBody);
            username = parsed.username;
            password = parsed.password;
            console.log('8️⃣ From rawBody - username:', username, 'password:', !!password);
        } catch (e) {
            console.log('8️⃣ Failed to parse rawBody:', e.message);
        }
    }
    
    console.log('\n9️⃣ Final extracted values:');
    console.log('   Username:', username);
    console.log('   Password provided:', !!password);
    
    // Validate
    if (!username || !password) {
        console.log('\n❌ Missing credentials!');
        return res.status(400).json({
            success: false,
            message: 'Username and password are required',
            received: {
                hasBody: !!req.body,
                hasRawBody: !!req.rawBody,
                contentType: req.headers['content-type'],
                username: username || 'missing',
                password: password ? 'provided' : 'missing'
            }
        });
    }
    
    try {
        console.log('\n🔍 Querying database for user:', username);
        
        const [users] = await db.execute(
            `SELECT u.*, e.first_name, e.last_name 
             FROM users u
             LEFT JOIN employees e ON u.employee_id = e.id
             WHERE u.username = ? AND u.is_active = TRUE`,
            [username]
        );
        
        console.log('📊 Users found:', users.length);
        
        if (users.length === 0) {
            console.log('❌ User not found');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials - User not found' 
            });
        }
        
        const user = users[0];
        console.log('👤 User found:', {
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email
        });
        
        console.log('🔐 Verifying password...');
        const isValid = await bcrypt.compare(password, user.password_hash);
        console.log('✅ Password valid:', isValid);
        
        if (!isValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials - Wrong password' 
            });
        }
        
        console.log('🎫 Generating JWT token...');
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role, 
                employee_id: user.employee_id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
        
        console.log('✅ Login successful!');
        console.log('🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪🚪\n');
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                employee_id: user.employee_id,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
        
    } catch (error) {
        console.error('\n💥 Database error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Error during login', 
            error: error.message 
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        console.log('📋 Get profile for user ID:', req.user.id);
        
        const [users] = await db.execute(
            `SELECT u.id, u.username, u.email, u.role, u.employee_id, u.is_active, u.created_at,
                    e.first_name, e.last_name, e.position, e.department_id
             FROM users u
             LEFT JOIN employees e ON u.employee_id = e.id
             WHERE u.id = ?`,
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching profile', 
            error: error.message 
        });
    }
};

// Forgot password - send reset token
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('🔐 Forgot password request for email:', email);
        
        const [users] = await db.execute(
            'SELECT id, username, email FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No user found with this email' 
            });
        }
        
        const user = users[0];
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = await bcrypt.hash(resetToken, 10);
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour
        
        // Save reset token to database
        await db.execute(
            'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
            [resetTokenHash, resetExpires, user.id]
        );
        
        // Send email (commented out if email not configured)
        // const emailSent = await sendPasswordResetEmail(email, resetToken, user.username);
        
        console.log('✅ Password reset token generated for user:', user.username);
        
        // For development, return the token (remove in production)
        res.json({ 
            success: true,
            message: 'Password reset email sent successfully',
            devToken: resetToken // Only for testing, remove in production
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error processing request', 
            error: error.message 
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        console.log('🔐 Reset password attempt');
        
        // Find user with valid reset token
        const [users] = await db.execute(
            'SELECT id, reset_token, reset_expires FROM users WHERE reset_expires > NOW()',
            []
        );
        
        let validUser = null;
        for (const user of users) {
            const isValid = await bcrypt.compare(token, user.reset_token);
            if (isValid) {
                validUser = user;
                break;
            }
        }
        
        if (!validUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired reset token' 
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password and clear reset token
        await db.execute(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
            [hashedPassword, validUser.id]
        );
        
        console.log('✅ Password reset successful for user ID:', validUser.id);
        
        res.json({ 
            success: true,
            message: 'Password reset successful. You can now login with your new password.' 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error resetting password', 
            error: error.message 
        });
    }
};

// Change password (when logged in)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        
        console.log('🔐 Change password for user ID:', userId);
        
        const [users] = await db.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        
        if (!isValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Current password is incorrect' 
            });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, userId]
        );
        
        console.log('✅ Password changed successfully for user ID:', userId);
        
        res.json({ 
            success: true,
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error changing password', 
            error: error.message 
        });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        console.log('📋 Get all users - Admin request');
        
        const [users] = await db.execute(
            `SELECT u.id, u.username, u.email, u.role, u.is_active, u.created_at,
                    e.first_name, e.last_name
             FROM users u
             LEFT JOIN employees e ON u.employee_id = e.id
             ORDER BY u.created_at DESC`
        );
        
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching users', 
            error: error.message 
        });
    }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
    try {
        const { is_active } = req.body;
        const userId = req.params.id;
        
        console.log(`📋 Update user ${userId} status to:`, is_active);
        
        await db.execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [is_active, userId]
        );
        
        res.json({ 
            success: true,
            message: 'User status updated successfully' 
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating user status', 
            error: error.message 
        });
    }
};

module.exports = { 
    register, 
    login, 
    getProfile, 
    forgotPassword, 
    resetPassword, 
    changePassword,
    getAllUsers,
    updateUserStatus
};