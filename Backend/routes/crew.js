const express = require('express');
const { getAllCrew, getCrewById, createCrew, updateCrew, deleteCrew } = require('../controllers/crewController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getAllCrew);
router.get('/:id', auth, getCrewById);
router.post('/', auth, createCrew);
router.put('/:id', auth, updateCrew);
router.delete('/:id', auth, deleteCrew);

module.exports = router;
