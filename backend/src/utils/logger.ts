import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format: `YYYY-MM-DD HH:mm:ss [LEVEL]: message`
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${stack || message}${metaStr}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

/**
 * Application-wide Winston logger.
 * Uses colorized console output in development, JSON in production.
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'nexhire-backend' },
  transports: [new winston.transports.Console()],
});
