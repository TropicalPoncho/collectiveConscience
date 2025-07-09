const express = require('express');
const router = express.Router();
const NeuronsService = require('../services/neuronsService');
const SynapsesService = require('../services/synapsesService');
const synapsesService = new SynapsesService();
const neuronsService = new NeuronsService();

/**
 * @route GET /network
 * @desc Get all neurons and synapses
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const neurons = await neuronsService.getAll(page);
        const synapses = await synapsesService.getAll(page);
        res.json({ neurons, synapses });
    } catch (error) {
        console.error('Error getting network:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @route GET /network/:dimensionId
 * @desc Get neurons and synapses by dimensionId
 * @access Public
 */
router.get('/:dimensionId', async (req, res) => {
    try {
        const dimensionId = parseInt(req.params.dimensionId);
        const page = parseInt(req.query.page) || 0;
        const neurons = await neuronsService.getByDimensionId(dimensionId,page);
        const synapses = await synapsesService.getByDimensionId(dimensionId,page);
        res.json({ neurons, synapses });
    } catch (error) {
        console.error('Error getting network by dimension:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router; 