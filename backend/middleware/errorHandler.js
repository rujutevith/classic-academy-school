const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });

    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
            success: false,
            message: 'Duplicate entry error', 
            error: err.message 
        });
    }

    // MySQL foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ 
            success: false,
            message: 'Cannot delete because it is referenced by other records',
            error: err.message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token',
            error: err.message
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            success: false,
            message: 'Token expired',
            error: err.message
        });
    }

    // Path-to-regexp error
    if (err.message && err.message.includes('path-to-regexp')) {
        return res.status(500).json({ 
            success: false,
            message: 'Server configuration error',
            error: 'Invalid route pattern'
        });
    }

    // Default error
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err
        })
    });
};

module.exports = errorHandler;