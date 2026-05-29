const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://jp-2.frp.one:35661';

const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.isProduction = import.meta.env.PROD;
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        logEntry += `\n  Error: ${data.message}`;
        logEntry += `\n  Stack: ${data.stack}`;
      } else if (typeof data === 'object') {
        logEntry += `\n  Data: ${JSON.stringify(data, null, 2)}`;
      } else {
        logEntry += `\n  Data: ${data}`;
      }
    }
    
    return logEntry;
  }

  addLog(level, message, data) {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data instanceof Error ? { message: data.message, stack: data.stack } : data
    };

    this.logs.unshift(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const formatted = this.formatMessage(level, message, data);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.DEBUG:
        if (!this.isProduction) {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }

    return entry;
  }

  debug(message, data) {
    if (!this.isProduction) {
      return this.addLog(LogLevel.DEBUG, message, data);
    }
  }

  info(message, data) {
    return this.addLog(LogLevel.INFO, message, data);
  }

  warn(message, data) {
    return this.addLog(LogLevel.WARN, message, data);
  }

  error(message, data) {
    return this.addLog(LogLevel.ERROR, message, data);
  }

  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  getErrorLogs() {
    return this.getLogs(LogLevel.ERROR);
  }

  getFormattedLogs() {
    return this.logs.map(log => this.formatMessage(log.level, log.message, log.data)).join('\n\n');
  }

  async syncToServer() {
    try {
      const errorLogs = this.getErrorLogs();
      if (errorLogs.length === 0) return;

      console.log('同步错误日志到服务器...', errorLogs);
    } catch (err) {
      console.error('同步日志失败:', err);
    }
  }
}

const logger = new Logger();

window.addEventListener('error', (event) => {
  logger.error('未捕获的JS错误', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('未处理的Promise拒绝', {
    reason: event.reason?.toString(),
    stack: event.reason?.stack
  });
});

export { logger, LogLevel };
export default logger;
