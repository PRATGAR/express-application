const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const rateLimit = require('express-rate-limit');

const customerRoutes = require('./routes/customers');
const transactionRoutes = require('./routes/transactions');
const documentRoutes = require('./routes/documents');
const reportRoutes = require('./routes/reports');
const calculatorRoutes = require('./routes/calculator');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use((req, res, next) => {
  logger.info('Request received', { 
    method: req.method, 
    url: req.url,
    userAgent: req.get('User-Agent')
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'SecureBank API v1.0',
    version: '1.0.0',
    endpoints: [
      '/api/auth/*',
      '/api/customers/*', 
      '/api/transactions/*',
      '/api/documents/*',
      '/api/reports/*',
      '/api/calculator/*'
    ]
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/calculator', calculatorRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`SecureBank API server running on port ${PORT}`);
  console.log(`🏦 SecureBank API started on http://localhost:${PORT}`);
});

module.exports = app;