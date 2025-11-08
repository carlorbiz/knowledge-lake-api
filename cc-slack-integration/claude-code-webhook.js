const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.CLAUDE_WEBHOOK_PORT || 3001;
const WEBHOOK_SECRET = process.env.CLAUDE_WEBHOOK_SECRET || 'your-secret-key-change-this';
const LOG_FILE = path.join(__dirname, 'webhook-log.txt');

app.use(express.json());

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Verify webhook signature
function verifySignature(payload, signature) {
  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  return hash === signature;
}

// Health check endpoint
app.get('/health', (req, res) => {
  log('Health check requested');
  res.status(200).json({
    status: 'ok',
    service: 'Claude Code Webhook',
    timestamp: new Date().toISOString()
  });
});

// Main webhook endpoint
app.post('/webhook/claude-code', (req, res) => {
  log(`Webhook received from ${req.ip}`);

  // Verify signature if provided
  const signature = req.headers['x-signature'];
  if (signature && !verifySignature(req.body, signature)) {
    log('Invalid signature - request rejected');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const { task, project_path, prompt, model } = req.body;

  if (!task || !prompt) {
    log('Missing required fields: task or prompt');
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['task', 'prompt'],
      optional: ['project_path', 'model']
    });
  }

  log(`Task: ${task}, Prompt: ${prompt.substring(0, 50)}...`);

  // Build Claude Code command
  const workingDir = project_path || 'C:\\Users\\carlo\\Development\\mem0-sync\\mem0';
  const modelFlag = model ? `--model ${model}` : '';
  const claudeCommand = `cd "${workingDir}" && claude --print ${modelFlag} "${prompt.replace(/"/g, '\\"')}"`;

  log(`Executing: ${claudeCommand}`);

  // Execute Claude Code command
  exec(claudeCommand, {
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    timeout: 300000 // 5 minute timeout
  }, (error, stdout, stderr) => {
    if (error) {
      log(`Error executing Claude Code: ${error.message}`);
      return res.status(500).json({
        error: 'Failed to execute Claude Code',
        details: error.message,
        stderr: stderr
      });
    }

    if (stderr) {
      log(`Claude Code stderr: ${stderr}`);
    }

    log(`Claude Code task completed successfully`);
    log(`Output length: ${stdout.length} characters`);

    res.status(200).json({
      success: true,
      task: task,
      output: stdout,
      timestamp: new Date().toISOString()
    });
  });
});

// Webhook endpoint for GitHub issues (integrates with your existing workflow)
app.post('/webhook/github-issue', (req, res) => {
  log('GitHub issue webhook received');

  const { issue_number, issue_title, issue_body, repository } = req.body;

  if (!issue_number || !repository) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['issue_number', 'repository']
    });
  }

  const prompt = `Analyze GitHub issue #${issue_number} in ${repository}: ${issue_title}\n\n${issue_body}`;
  const project_path = 'C:\\Users\\carlo\\Development\\mem0-sync\\mem0';

  const claudeCommand = `cd "${project_path}" && claude --print "${prompt.replace(/"/g, '\\"')}"`;

  log(`Processing GitHub issue #${issue_number}`);

  exec(claudeCommand, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      log(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }

    log(`GitHub issue analysis complete`);
    res.status(200).json({
      success: true,
      issue_number: issue_number,
      analysis: stdout,
      timestamp: new Date().toISOString()
    });
  });
});

// Start server
app.listen(PORT, () => {
  log(`Claude Code Webhook server started on port ${PORT}`);
  log(`Webhook URL: http://localhost:${PORT}/webhook/claude-code`);
  log(`GitHub webhook URL: http://localhost:${PORT}/webhook/github-issue`);
  log(`Health check URL: http://localhost:${PORT}/health`);
  log(`Secret: ${WEBHOOK_SECRET === 'your-secret-key-change-this' ? '⚠️  DEFAULT (CHANGE THIS!)' : '✓ Custom'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
