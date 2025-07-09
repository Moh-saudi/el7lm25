// Debug Logger for el7lm system
export class DebugLogger {
  private static instance: DebugLogger;
  private logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'success';
    component: string;
    message: string;
    data?: any;
  }> = [];

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private log(level: 'info' | 'warn' | 'error' | 'success', component: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    this.logs.push(logEntry);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Console output with emojis
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level];

    const style = {
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444',
      success: 'color: #10b981'
    }[level];

    console.log(
      `%c${emoji} ${component} - ${message}`,
      style,
      data ? data : ''
    );
  }

  info(component: string, message: string, data?: any) {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: any) {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: any) {
    this.log('error', component, message, data);
  }

  success(component: string, message: string, data?: any) {
    this.log('success', component, message, data);
  }

  // Get all logs
  getLogs() {
    return [...this.logs];
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.clear();
    this.info('DebugLogger', 'Logs cleared');
  }

  // Export logs as JSON
  exportLogs() {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `el7lm-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // System info
  getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine
    };
  }
}

// Global instance
export const debugLogger = DebugLogger.getInstance();

// Helper functions
export const logInfo = (component: string, message: string, data?: any) => 
  debugLogger.info(component, message, data);

export const logWarn = (component: string, message: string, data?: any) => 
  debugLogger.warn(component, message, data);

export const logError = (component: string, message: string, data?: any) => 
  debugLogger.error(component, message, data);

export const logSuccess = (component: string, message: string, data?: any) => 
  debugLogger.success(component, message, data);

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugLogger = debugLogger;
  (window as any).exportLogs = () => debugLogger.exportLogs();
  (window as any).clearLogs = () => debugLogger.clearLogs();
  (window as any).getSystemInfo = () => debugLogger.getSystemInfo();
} 