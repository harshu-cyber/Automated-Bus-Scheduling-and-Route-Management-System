const express = require('express');
const { getAllDepots, getDepotById, createDepot, updateDepot, deleteDepot } = require('../controllers/depotController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getAllDepots);
router.get('/:id', auth, getDepotById);
router.post('/', auth, createDepot);
router.put('/:id', auth, updateDepot);
router.delete('/:id', auth, deleteDepot);

module.exports = router;
