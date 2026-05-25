const db = require('../config/database');

const getAllEmployees = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, d.name as department_name 
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY e.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, d.name as department_name 
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE e.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error: error.message });
    }
};

const createEmployee = async (req, res) => {
    try {
        const { employee_code, first_name, last_name, email, phone, address, position, department_id, hire_date, salary, status } = req.body;
        
        const [result] = await db.execute(
            `INSERT INTO employees (employee_code, first_name, last_name, email, phone, address, position, department_id, hire_date, salary, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employee_code, first_name, last_name, email, phone, address, position, department_id, hire_date, salary, status || 'active']
        );
        
        res.status(201).json({ message: 'Employee created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating employee', error: error.message });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, address, position, department_id, salary, status } = req.body;
        
        await db.execute(
            `UPDATE employees 
             SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, position = ?, department_id = ?, salary = ?, status = ?
             WHERE id = ?`,
            [first_name, last_name, email, phone, address, position, department_id, salary, status, req.params.id]
        );
        
        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating employee', error: error.message });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        await db.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error: error.message });
    }
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };