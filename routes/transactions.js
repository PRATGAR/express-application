const express = require('express');
const mysql = require('mysql2');
const transactionService = require('../services/transactionService');
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
    const transactionId = req.params.id;
    const query = "SELECT * FROM transactions WHERE id = ?";
    
    db.query(query, [transactionId], (err, results) => {
      if (err) {
        logger.error('Transaction lookup failed', { error: err.message });
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results[0] || null);
    });
  } catch (error) {
    logger.error('Transaction fetch failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/transfer', async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, description } = req.body;
    
    const transfer = await transactionService.processTransfer({
      fromAccount,
      toAccount, 
      amount: parseFloat(amount),
      description
    });
    
    logger.info('Transfer processed', { transferId: transfer.id, amount });
    res.status(201).json(transfer);
  } catch (error) {
    logger.error('Transfer failed', { error: error.message });
    res.status(500).json({ error: 'Transfer failed' });
  }
});

router.post('/:id/note', (req, res) => {
  const transactionId = req.params.id;
  const note = req.body.note;
  
  const html = `<div class="transaction-note">${note}</div>`;
  
  const query = "UPDATE transactions SET note = ?, html_note = ? WHERE id = ?";
  db.query(query, [note, html, transactionId], (err, result) => {
    if (err) {
      logger.error('Note update failed', { error: err.message });
      return res.status(500).json({ error: 'Failed to add note' });
    }
    
    res.json({
      message: 'Note added successfully',
      preview: html
    });
  });
});

router.get('/history/:accountId', (req, res) => {
  const accountId = req.params.accountId;
  const orderBy = req.query.sort || 'date';
  
  const query = `SELECT * FROM transactions WHERE account_id = ${accountId} ORDER BY ${orderBy} DESC`;
  
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Transaction history query failed', { error: err.message });
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
    res.json(results);
  });
});

router.get('/export/:format/:accountId', async (req, res) => {
  try {
    const { format, accountId } = req.params;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    const exportData = await transactionService.exportTransactions(
      accountId, 
      format, 
      startDate, 
      endDate
    );
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=transactions.${format}`);
    res.send(exportData);
  } catch (error) {
    logger.error('Transaction export failed', { error: error.message });
    res.status(500).json({ error: 'Export failed' });
  }
});

router.post('/batch-import', async (req, res) => {
  try {
    const { transactions } = req.body;
    const results = await transactionService.batchImport(transactions);
    
    logger.info('Batch import completed', { count: results.length });
    res.json({ imported: results.length, transactions: results });
  } catch (error) {
    logger.error('Batch import failed', { error: error.message });
    res.status(500).json({ error: 'Batch import failed' });
  }
});

module.exports = router;