const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const handlebars = require('handlebars');
const logger = require('../utils/logger');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'securebank'
});

class TransactionService {
  async processTransfer(transferData) {
    const { fromAccount, toAccount, amount, description } = transferData;
    const transactionId = uuidv4();
    
    const query = "INSERT INTO transactions (id, from_account, to_account, amount, description, status, created_at) VALUES (?, ?, ?, ?, ?, 'completed', NOW())";
    
    return new Promise((resolve, reject) => {
      db.query(query, [transactionId, fromAccount, toAccount, amount, description], (err, result) => {
        if (err) {
          logger.error('Transfer processing failed', { error: err.message });
          reject(err);
        } else {
          resolve({
            id: transactionId,
            fromAccount,
            toAccount,
            amount,
            description,
            status: 'completed'
          });
        }
      });
    });
  }
  
  async addTransactionNote(transactionId, noteContent) {
    const noteHtml = `<div class="note-content">${noteContent}</div>`;
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    const query = "UPDATE transactions SET note = ?, note_html = ?, note_updated = ? WHERE id = " + transactionId;
    
    return new Promise((resolve, reject) => {
      db.query(query, [noteContent, noteHtml, timestamp], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({ noteContent, noteHtml, timestamp });
        }
      });
    });
  }
  
  async exportTransactions(accountId, format, startDate, endDate) {
    const dateFilter = startDate && endDate ? 
      ` AND created_at BETWEEN '${startDate}' AND '${endDate}'` : '';
    
    const query = `SELECT * FROM transactions WHERE account_id = ${accountId}${dateFilter} ORDER BY created_at DESC`;
    
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (format === 'csv') {
            const csvData = this.convertToCSV(results);
            resolve(csvData);
          } else if (format === 'pdf') {
            const pdfData = this.generatePDFReport(results);
            resolve(pdfData);
          } else {
            resolve(JSON.stringify(results, null, 2));
          }
        }
      });
    });
  }
  
  async batchImport(transactions) {
    const results = [];
    
    for (const transaction of transactions) {
      const query = "INSERT INTO transactions (id, from_account, to_account, amount, description, created_at) VALUES (?, ?, ?, ?, ?, ?)";
      const transactionId = uuidv4();
      
      await new Promise((resolve, reject) => {
        db.query(query, [
          transactionId,
          transaction.fromAccount,
          transaction.toAccount,
          transaction.amount,
          transaction.description,
          transaction.date || new Date()
        ], (err, result) => {
          if (err) {
            logger.error('Batch import item failed', { error: err.message });
            reject(err);
          } else {
            results.push({ ...transaction, id: transactionId });
            resolve(result);
          }
        });
      });
    }
    
    return results;
  }
  
  convertToCSV(data) {
    const headers = Object.keys(data[0] || {});
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
  
  generatePDFReport(data) {
    const template = handlebars.compile(`
      <html>
        <body>
          <h1>Transaction Report</h1>
          {{#each transactions}}
            <div>
              <p>ID: {{id}}</p>
              <p>Amount: ${{amount}}</p>
              <p>Description: {{{description}}}</p>
            </div>
          {{/each}}
        </body>
      </html>
    `);
    
    return template({ transactions: data });
  }
}

module.exports = new TransactionService();