const express = require('express');
const { getAllSchedules, createScheduleEntry, updateScheduleEntry, deleteScheduleEntry, autoGenerateSchedule, applySchedule, validateScheduleConflicts, getMyRoute } = require('../controllers/scheduleController');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/schedule
// @access  Private
router.get('/', auth, getAllSchedules);

// @route   GET /api/schedule/my-route
// @access  Private (Driver only)
// Must be BEFORE /:id route to avoid parameter confusion
router.get('/my-route', auth, getMyRoute);

// @route   POST /api/schedule
// @access  Private
router.post('/', auth, createScheduleEntry);

// @route   PUT /api/schedule/:id
// @access  Private
router.put('/:id', auth, updateScheduleEntry);

// @route   DELETE /api/schedule/:id
// @access  Private
router.delete('/:id', auth, deleteScheduleEntry);

// @route   POST /api/schedule/auto-generate
// @access  Private
router.post('/auto-generate', auth, autoGenerateSchedule);

// @route   POST /api/schedule/apply
// @access  Private
router.post('/apply', auth, applySchedule);

// @route   POST /api/schedule/validate-conflicts
// @access  Private
// Endpoint for frontend to validate schedule BEFORE applying
router.post('/validate-conflicts', auth, validateScheduleConflicts);

module.exports = router;
