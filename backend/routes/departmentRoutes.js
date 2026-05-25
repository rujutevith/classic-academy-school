const express = require('express');
const { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, getAllDepartments);
router.post('/', authenticateToken, authorizeRoles('admin', 'hr'), createDepartment);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'hr'), updateDepartment);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteDepartment);

module.exports = router;