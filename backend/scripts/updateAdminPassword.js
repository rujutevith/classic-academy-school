const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updateAdminPassword() {
    try {
        // Create database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'king@90048T', // Replace with your MySQL password
            database: 'classic_academy_eims_db'
        });
        
        // Hash the password 'admin123'
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('Generated hash:', hashedPassword);
        
        // Update admin user
        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE username = ?',
            [hashedPassword, 'admin']
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Admin password updated successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
        } else {
            console.log('❌ Admin user not found');
        }
        
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateAdminPassword();