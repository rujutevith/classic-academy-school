const db = require('../config/database');

const getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM departments ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching departments', error: error.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.execute(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({ message: 'Department created successfully', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating department', error: error.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        await db.execute(
            'UPDATE departments SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );
        res.json({ message: 'Department updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating department', error: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        await db.execute('DELETE FROM departments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting department', error: error.message });
    }
};

module.exports = { getAllDepartments, createDepartment, updateDepartment, deleteDepartment };