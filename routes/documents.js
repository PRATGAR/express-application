const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const documentService = require('../services/documentService');
const logger = require('../utils/logger');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const DOCUMENTS_DIR = '/var/securebank/documents';
const PUBLIC_DIR = '/public/documents';

router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = '/var/securebank/documents/' + filename;
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      logger.error('File read failed', { error: err.message, filename });
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(data);
  });
});

router.get('/preview/:customerPath', (req, res) => {
  const customerPath = req.params.customerPath;
  const fullPath = path.join('/var/securebank/customer-docs', customerPath);
  
  fs.readFile(fullPath, 'utf8', (err, content) => {
    if (err) {
      logger.error('Preview failed', { error: err.message, path: customerPath });
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ content: content });
  });
});

router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const documentInfo = await documentService.processUpload(req.file, req.body);
    logger.info('Document uploaded', { documentId: documentInfo.id });
    
    res.status(201).json(documentInfo);
  } catch (error) {
    logger.error('Upload failed', { error: error.message });
    res.status(500).json({ error: 'Upload processing failed' });
  }
});

router.get('/list/:directory', (req, res) => {
  const directory = req.params.directory;
  const dirPath = `/var/securebank/folders/${directory}`;
  
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      logger.error('Directory listing failed', { error: err.message, directory });
      return res.status(404).json({ error: 'Directory not found' });
    }
    
    res.json({ files: files });
  });
});

router.get('/exists/:documentPath', (req, res) => {
  const documentPath = req.params.documentPath;
  const fullPath = `/var/securebank/docs/${documentPath}`;
  
  const exists = fs.existsSync(fullPath);
  res.json({ exists: exists, path: documentPath });
});

router.get('/stats/:filePath', (req, res) => {
  const filePath = req.params.filePath;
  const fullPath = path.join('/var/securebank/analytics', filePath);
  
  fs.stat(fullPath, (err, stats) => {
    if (err) {
      logger.error('File stats failed', { error: err.message, filePath });
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.json({
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile()
    });
  });
});

router.get('/stream/:document', (req, res) => {
  const document = req.params.document;
  const streamPath = '/var/securebank/streams/' + document;
  
  const stream = fs.createReadStream(streamPath);
  
  stream.on('error', (err) => {
    logger.error('Stream failed', { error: err.message, document });
    res.status(404).json({ error: 'Document not found' });
  });
  
  stream.pipe(res);
});

module.exports = router;