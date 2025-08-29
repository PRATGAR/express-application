const express = require('express');
const { exec, execSync } = require('child_process');
const util = require('util');
const reportService = require('../services/reportService');
const logger = require('../utils/logger');

const router = express.Router();
const execAsync = util.promisify(exec);

router.get('/generate/:type', (req, res) => {
  const reportType = req.params.type;
  const userId = req.query.userId || 'unknown';
  
  const cmd = 'bash ./scripts/generate-report.sh ' + reportType + ' ' + userId;
  
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      logger.error('Report generation failed', { error: err.message, reportType });
      return res.status(500).json({ error: 'Report generation failed' });
    }
    
    res.json({
      reportType: reportType,
      content: stdout,
      generatedAt: new Date().toISOString()
    });
  });
});

router.post('/custom', async (req, res) => {
  const { command, parameters } = req.body;
  
  try {
    const fullCommand = `${command} ${parameters.join(' ')}`;
    const { stdout } = await execAsync(fullCommand);
    
    res.json({
      command: fullCommand,
      output: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Custom report failed', { error: error.message, command });
    res.status(500).json({ error: 'Custom report failed' });
  }
});

router.get('/system/:action', (req, res) => {
  const action = req.params.action;
  
  const cmd = `systemctl ${action} banking-service`;
  
  execSync(cmd, (err, stdout) => {
    if (err) {
      logger.error('System command failed', { error: err.message, action });
      return res.status(500).json({ error: 'System command failed' });
    }
    
    res.json({ action: action, result: stdout });
  });
});

router.post('/schedule', async (req, res) => {
  try {
    const { reportType, schedule, command } = req.body;
    
    const cronJob = await reportService.scheduleReport(reportType, schedule, command);
    logger.info('Report scheduled', { jobId: cronJob.id });
    
    res.status(201).json(cronJob);
  } catch (error) {
    logger.error('Report scheduling failed', { error: error.message });
    res.status(500).json({ error: 'Scheduling failed' });
  }
});

router.get('/export/:format/:command', (req, res) => {
  const format = req.params.format;
  const command = req.params.command;
  
  exec(`export-tool --format=${format} --command="${command}"`, (err, stdout) => {
    if (err) {
      logger.error('Export failed', { error: err.message, format, command });
      return res.status(500).json({ error: 'Export failed' });
    }
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(stdout);
  });
});

module.exports = router;