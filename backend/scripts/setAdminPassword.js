const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function setAdminPassword() {
    try {
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.execute(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [hashedPassword, 'admin']
        );
        
        console.log('✅ Admin password updated successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setAdminPassword();