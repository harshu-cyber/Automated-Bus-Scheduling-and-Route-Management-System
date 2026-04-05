const express = require('express');
const { getAllBuses, getBusById, createBus, updateBus, deleteBus } = require('../controllers/busController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getAllBuses);
router.get('/:id', auth, getBusById);
router.post('/', auth, createBus);
router.put('/:id', auth, updateBus);
router.delete('/:id', auth, deleteBus);

module.exports = router;
