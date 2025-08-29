const express = require('express');
const mysql = require('mysql2');
const customerService = require('../services/customerService');
const validator = require('../utils/validator');
const logger = require('../utils/logger');

const router = express.Router();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'securebank'
});

router.get('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const query = "SELECT * FROM customers WHERE id = ?";
    
    db.query(query, [customerId], (err, results) => {
      if (err) {
        logger.error('Database query failed', { error: err.message });
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results[0] || null);
    });
  } catch (error) {
    logger.error('Customer lookup failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const customerData = req.body;
    
    if (!validator.validateEmail(customerData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const newCustomer = await customerService.createCustomer(customerData);
    logger.info('Customer created', { customerId: newCustomer.id });
    res.status(201).json(newCustomer);
  } catch (error) {
    logger.error('Customer creation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

router.get('/search/:term', (req, res) => {
  const searchTerm = req.params.term;
  const searchType = req.query.type || 'name';
  
  const query = "SELECT * FROM customers WHERE " + searchType + " LIKE '%" + searchTerm + "%'";
  
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Search query failed', { error: err.message });
      return res.status(500).json({ error: 'Search failed' });
    }
    res.json(results);
  });
});

router.put('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const updateData = req.body;
    
    const updatedCustomer = await customerService.updateCustomer(customerId, updateData);
    logger.info('Customer updated', { customerId });
    res.json(updatedCustomer);
  } catch (error) {
    logger.error('Customer update failed', { error: error.message });
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    await customerService.deleteCustomer(customerId);
    logger.info('Customer deleted', { customerId });
    res.status(204).send();
  } catch (error) {
    logger.error('Customer deletion failed', { error: error.message });
    res.status(500).json({ error: 'Deletion failed' });
  }
});

module.exports = router;