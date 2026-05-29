const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', '..', 'logs');
const errorLogFile = path.join(logDir, 'error.log');
const accessLogFile = path.join(logDir, 'access.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function log(level, message, details = null) {
  const timestamp = formatDate(new Date());
  let logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (details) {
    if (details instanceof Error) {
      logMessage += `\n  Error: ${details.message}`;
      logMessage += `\n  Stack: ${details.stack}`;
    } else if (typeof details === 'object') {
      logMessage += `\n  Details: ${JSON.stringify(details, null, 2)}`;
    } else {
      logMessage += `\n  Details: ${details}`;
    }
  }
  
  logMessage += '\n';
  
  console.log(logMessage);
  
  const logFile = level === 'error' ? errorLogFile : accessLogFile;
  
  try {
    fs.appendFileSync(logFile, logMessage);
  } catch (err) {
    console.error('Failed to write log file:', err);
  }
  
  return logMessage;
}

const logger = {
  info: (message, details) => log('info', message, details),
  warn: (message, details) => log('warn', message, details),
  error: (message, details) => log('error', message, details),
  debug: (message, details) => {
    if (process.env.NODE_ENV !== 'production') {
      log('debug', message, details);
    }
  },
  
  access: (req, res, duration) => {
    const message = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
    log('access', message, {
      query: req.query,
      body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  },
  
  getErrorLogs: () => {
    try {
      if (fs.existsSync(errorLogFile)) {
        const content = fs.readFileSync(errorLogFile, 'utf8');
        return content.split('\n').filter(line => line.trim());
      }
    } catch (err) {
      console.error('Failed to read error logs:', err);
    }
    return [];
  },
  
  getAccessLogs: () => {
    try {
      if (fs.existsSync(accessLogFile)) {
        const content = fs.readFileSync(accessLogFile, 'utf8');
        return content.split('\n').filter(line => line.trim());
      }
    } catch (err) {
      console.error('Failed to read access logs:', err);
    }
    return [];
  },
  
  clearErrorLogs: () => {
    try {
      fs.writeFileSync(errorLogFile, '');
      return true;
    } catch (err) {
      console.error('Failed to clear error logs:', err);
      return false;
    }
  }
};

module.exports = logger;
