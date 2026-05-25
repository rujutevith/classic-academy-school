const db = require('../config/database');

const getAllSalaries = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT s.*, e.first_name, e.last_name, e.employee_code
            FROM salaries s
            JOIN employees e ON s.employee_id = e.id
            ORDER BY s.month_year DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching salaries:', error);
        res.status(500).json({ message: 'Error fetching salary records', error: error.message });
    }
};

const createSalary = async (req, res) => {
    try {
        const { employee_id, month_year, base_salary, bonuses, deductions, net_salary, payment_status, payment_date } = req.body;
        
        // Validate required fields
        if (!employee_id || !month_year || !base_salary) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Check if salary record already exists for this employee and month
        const [existing] = await db.execute(
            'SELECT id FROM salaries WHERE employee_id = ? AND month_year = ?',
            [employee_id, month_year]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Salary record already exists for this employee and month' });
        }
        
        const [result] = await db.execute(
            `INSERT INTO salaries (employee_id, month_year, base_salary, bonuses, deductions, net_salary, payment_status, payment_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [employee_id, month_year, base_salary, bonuses || 0, deductions || 0, net_salary, payment_status || 'pending', payment_date || null]
        );
        
        res.status(201).json({ message: 'Salary record created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating salary:', error);
        res.status(500).json({ message: 'Error creating salary record', error: error.message });
    }
};

const updateSalary = async (req, res) => {
    try {
        const { base_salary, bonuses, deductions, net_salary, payment_status, payment_date } = req.body;
        const salaryId = req.params.id;
        
        // Check if salary record exists
        const [existing] = await db.execute('SELECT id FROM salaries WHERE id = ?', [salaryId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Salary record not found' });
        }
        
        await db.execute(
            `UPDATE salaries 
             SET base_salary = ?, bonuses = ?, deductions = ?, net_salary = ?, payment_status = ?, payment_date = ?
             WHERE id = ?`,
            [base_salary, bonuses || 0, deductions || 0, net_salary, payment_status, payment_date || null, salaryId]
        );
        
        res.json({ message: 'Salary record updated successfully' });
    } catch (error) {
        console.error('Error updating salary:', error);
        res.status(500).json({ message: 'Error updating salary record', error: error.message });
    }
};

const deleteSalary = async (req, res) => {
    try {
        const salaryId = req.params.id;
        
        // Check if salary record exists
        const [existing] = await db.execute('SELECT id FROM salaries WHERE id = ?', [salaryId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Salary record not found' });
        }
        
        await db.execute('DELETE FROM salaries WHERE id = ?', [salaryId]);
        res.json({ message: 'Salary record deleted successfully' });
    } catch (error) {
        console.error('Error deleting salary:', error);
        res.status(500).json({ message: 'Error deleting salary record', error: error.message });
    }
};

module.exports = { getAllSalaries, createSalary, updateSalary, deleteSalary };