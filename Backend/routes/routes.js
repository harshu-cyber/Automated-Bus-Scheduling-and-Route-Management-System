const express = require('express');
const { getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getAllRoutes);
router.get('/:id', auth, getRouteById);
router.post('/', auth, createRoute);
router.put('/:id', auth, updateRoute);
router.delete('/:id', auth, deleteRoute);

module.exports = router;
