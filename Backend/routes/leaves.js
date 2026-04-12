const express = require('express');
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, deleteLeave } = require('../controllers/leaveController');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Driver: Apply for leave
router.post('/', auth, applyLeave);

// Driver: Get my leaves
router.get('/my', auth, getMyLeaves);

// Depot/Admin: Get all leaves
router.get('/', auth, getAllLeaves);

// Depot/Admin: Approve or Reject
router.put('/:id', auth, updateLeaveStatus);

// Delete a leave
router.delete('/:id', auth, deleteLeave);

module.exports = router;
