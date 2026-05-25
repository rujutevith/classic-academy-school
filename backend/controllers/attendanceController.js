const db = require('../config/database');

const getAllAttendance = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT a.*, e.first_name, e.last_name, e.employee_code
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            ORDER BY a.date DESC, a.check_in DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
    }
};

const createAttendance = async (req, res) => {
    try {
        const { employee_id, date, check_in, check_out, status, remarks } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO attendance (employee_id, date, check_in, check_out, status, remarks)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employee_id, date, check_in, check_out, status || 'present', remarks]
        );
        
        res.status(201).json({ message: 'Attendance recorded successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error recording attendance', error: error.message });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { check_in, check_out, status, remarks } = req.body;
        
        await db.execute(
            `UPDATE attendance SET check_in = ?, check_out = ?, status = ?, remarks = ?
             WHERE id = ?`,
            [check_in, check_out, status, remarks, req.params.id]
        );
        
        res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating attendance', error: error.message });
    }
};

const deleteAttendance = async (req, res) => {
    try {
        await db.execute('DELETE FROM attendance WHERE id = ?', [req.params.id]);
        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting attendance record', error: error.message });
    }
};

module.exports = { getAllAttendance, createAttendance, updateAttendance, deleteAttendance };