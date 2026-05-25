const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log('🔐 Auth Check:', {
        hasAuthHeader: !!authHeader,
        hasToken: !!token,
        url: req.url,
        method: req.method
    });

    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ 
            success: false,
            message: 'Access token required',
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for user:', decoded.username);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token has expired',
                error: 'TokenExpiredError'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid token',
                error: 'JsonWebTokenError'
            });
        }
        
        return res.status(403).json({ 
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log('🎭 Role Check:', {
            userRole: req.user?.role,
            requiredRoles: roles,
            hasAccess: req.user && roles.includes(req.user.role)
        });
        
        if (!req.user) {
            console.log('❌ User not authenticated');
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }
        
        if (!roles.includes(req.user.role)) {
            console.log(`❌ Access denied for role: ${req.user.role}`);
            return res.status(403).json({ 
                success: false,
                message: `Access denied. ${req.user.role} role does not have permission.`,
                requiredRoles: roles,
                userRole: req.user.role
            });
        }
        
        console.log('✅ Role authorization successful');
        next();
    };
};

module.exports = { authenticateToken, authorizeRoles };