const express = require('express');
const { getAllAttendance, createAttendance, updateAttendance, deleteAttendance } = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, getAllAttendance);
router.post('/', authenticateToken, createAttendance);
router.put('/:id', authenticateToken, updateAttendance);
router.delete('/:id', authenticateToken, deleteAttendance);

module.exports = router;