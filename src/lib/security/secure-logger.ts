// نظام Logging آمن ومحسن
interface LogLevel {
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  SECURITY: 'security';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
}

class SecureLogger {
  private isProduction: boolean;
  private sessionId: string;
  private maxLogHistory: number = 100;
  private logHistory: LogEntry[] = [];

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // إزالة البيانات الحساسة
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'apiKey', 'privateKey', 'accessToken', 'refreshToken',
      'socialSecurityNumber', 'ssn', 'creditCard', 'cvv',
      'bankAccount', 'routingNumber'
    ];

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some(sensitiveKey => 
          lowerKey.includes(sensitiveKey)
        );

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return sanitize(data);
  }

  private createLogEntry(
    level: keyof LogLevel, 
    message: string, 
    data?: any, 
    stack?: string
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      data: this.sanitizeData(data)
    };

    // إضافة معلومات إضافية في المتصفح
    if (typeof window !== 'undefined') {
      entry.url = window.location.href;
      entry.userAgent = navigator.userAgent;
    }

    if (stack) {
      entry.stack = stack;
    }

    return entry;
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // الحفاظ على الحد الأقصى للتاريخ
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory = this.logHistory.slice(-this.maxLogHistory);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      // إرسال للمراقبة في الإنتاج
      await fetch('/api/monitoring/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // فشل في إرسال اللوج - لا نريد إنشاء حلقة مفرغة
      console.error('Failed to send log to monitoring:', error);
    }
  }

  // Info logging
  info(message: string, data?: any): void {
    const entry = this.createLogEntry('INFO', message, data);
    this.addToHistory(entry);

    if (!this.isProduction) {
      console.log(`ℹ️ ${message}`, data || '');
    }

    this.sendToMonitoring(entry);
  }

  // Warning logging
  warn(message: string, data?: any): void {
    const entry = this.createLogEntry('WARN', message, data);
    this.addToHistory(entry);

    console.warn(`⚠️ ${message}`, data || '');
    this.sendToMonitoring(entry);
  }

  // Error logging
  error(message: string, error?: Error | any): void {
    const entry = this.createLogEntry(
      'ERROR', 
      message, 
      error, 
      error?.stack
    );
    this.addToHistory(entry);

    console.error(`❌ ${message}`, error || '');
    this.sendToMonitoring(entry);
  }

  // Security logging - خاص جداً
  security(message: string, data?: any): void {
    const entry = this.createLogEntry('SECURITY', message, data);
    this.addToHistory(entry);

    console.warn(`🔒 SECURITY: ${message}`, data || '');
    
    // إرسال فوري للتنبيهات الأمنية
    this.sendSecurityAlert(entry);
  }

  // Debug logging - فقط في التطوير
  debug(message: string, data?: any): void {
    if (this.isProduction) return;

    const entry = this.createLogEntry('DEBUG', message, data);
    this.addToHistory(entry);

    console.debug(`🐛 ${message}`, data || '');
  }

  // إرسال تنبيه أمني فوري
  private async sendSecurityAlert(entry: LogEntry): Promise<void> {
    try {
      await fetch('/api/security/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Alert': 'true',
        },
        body: JSON.stringify({
          ...entry,
          priority: 'HIGH',
          alertType: 'SECURITY_INCIDENT'
        }),
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // الحصول على تاريخ اللوجات
  getLogHistory(level?: keyof LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  // مسح التاريخ
  clearHistory(): void {
    this.logHistory = [];
  }

  // تصدير اللوجات للتشخيص
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  // معلومات النظام للتشخيص
  getSystemInfo(): any {
    const info: any = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      isProduction: this.isProduction,
      logHistorySize: this.logHistory.length,
    };

    if (typeof window !== 'undefined') {
      info.browser = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        platform: navigator.platform,
      };

      info.screen = {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      };

      info.window = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        url: window.location.href,
        referrer: document.referrer,
      };
    }

    return info;
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
const secureLogger = new SecureLogger();

export default secureLogger;
export { SecureLogger };
export type { LogEntry, LogLevel }; 
