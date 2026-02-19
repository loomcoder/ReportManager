type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
    level: LogLevel;
    message: string;
    [key: string]: any;
}

const LOG_API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "" : `http://localhost:${process.env.PORT || 3025}`);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Colors for console logging
const COLORS = {
    info: 'color: #3b82f6; font-weight: bold',
    warn: 'color: #f59e0b; font-weight: bold',
    error: 'color: #ef4444; font-weight: bold',
    debug: 'color: #10b981; font-weight: bold',
};

class Logger {
    private sendToBackend(level: LogLevel, message: string, meta?: any) {
        // In production, we want to send logs to the backend
        // We typically only send warn/error to avoid spamming the server
        if (!IS_PRODUCTION && level === 'debug') return;

        // Use sendBeacon if available for non-blocking requests (great for page unloads)
        // Otherwise fall back to fetch
        const payload = JSON.stringify({ level, message, ...meta, url: typeof window !== 'undefined' ? window.location.href : 'server-render' });

        try {
            const url = `${LOG_API_URL}/logs`;
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
            } else {
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true // Ensure request completes even if page unloads
                }).catch(err => {
                    // Fallback to console if backend logging fails
                    console.error('Failed to send log to backend:', err);
                });
            }
        } catch (e) {
            console.error('Error in logger:', e);
        }
    }

    private formatMessage(level: LogLevel, message: string) {
        return [`%c[${level.toUpperCase()}]`, COLORS[level], message];
    }

    public info(message: string, ...args: any[]) {
        if (!IS_PRODUCTION) {
            console.log(...this.formatMessage('info', message), ...args);
        }
        // Optional: Send info logs to backend in production if critical
    }

    public warn(message: string, ...args: any[]) {
        console.warn(...this.formatMessage('warn', message), ...args);
        this.sendToBackend('warn', message, { args });
    }

    public error(message: string, error?: any, ...args: any[]) {
        console.error(...this.formatMessage('error', message), error, ...args);

        // Extract useful error info
        const errorDetails = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : error;

        this.sendToBackend('error', message, { error: errorDetails, args });
    }

    public debug(message: string, ...args: any[]) {
        // Only show debug logs in development
        if (!IS_PRODUCTION) {
            console.debug(...this.formatMessage('debug', message), ...args);
        }
    }
}

export const logger = new Logger();
