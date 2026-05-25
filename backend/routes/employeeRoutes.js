const express = require('express');
const { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, getAllEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), createEmployee);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr'), updateEmployee);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteEmployee);

module.exports = router;