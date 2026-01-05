const express = require('express');
const router = express.Router();
const SynapsesService = require('../services/synapsesService');
const { queryToFilters } = require('../utils/helpers');

const synapsesService = new SynapsesService();

/**
 * @route GET /synapses
 * @desc Get all synapses with pagination and filters
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page) || 0;
        
        const filters = queryToFilters(req.query);

        const synapses = await synapsesService.getAll(page, filters);
        res.json(synapses);
    } catch (error) {
        console.error('Error getting synapses:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @route GET /synapses/between/:fromId/:toId
 * @desc Get synapses between two specific neurons
 * @access Public
 */
router.get('/between/:fromId/:toId', async (req, res) => {
    try {
        const fromId = req.params.fromId;
        const toId = req.params.toId;
        const synapses = await synapsesService.getByNeurons(fromId, toId);
        res.json(synapses);
    } catch (error) {
        console.error('Error getting synapses between neurons:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @route GET /synapses/neuron/:neuronId
 * @desc Get all synapses for a specific neuron (both incoming and outgoing)
 * @access Public
 */
router.get('/neuron/:neuronId', async (req, res) => {
    try {
        const neuronId = req.params.neuronId;
        const page = Number.parseInt(req.query.page) || 0;
        const synapses = await synapsesService.getByNeuronId(neuronId, page);
        res.json(synapses);
    } catch (error) {
        console.error('Error getting synapses for neuron:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/**
 * @route POST /synapses
 * @desc Create a new synapse
 * @access Public
 */
router.post('/', async (req, res) => {
    try {
        const synapseData = req.body;
        
        // Validar campos requeridos
        if (!synapseData.source || !synapseData.target) {
            return res.status(400).json({ 
                error: 'source y target son campos requeridos' 
            });
        }

        const synapse = await synapsesService.create(synapseData);
        res.status(201).json(synapse);
    } catch (error) {
        console.error('Error creating synapse:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



module.exports = router; 