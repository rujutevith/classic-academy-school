const express = require('express');
const { getAllSalaries, createSalary, updateSalary, deleteSalary } = require('../controllers/salaryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, getAllSalaries);
router.post('/', authenticateToken, authorizeRoles('admin', 'hr', 'finance'), createSalary);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr', 'finance'), updateSalary);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSalary);

module.exports = router;