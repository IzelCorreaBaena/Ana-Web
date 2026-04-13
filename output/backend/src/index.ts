import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

import authRoutes from './routes/auth.routes';
import servicesRoutes from './routes/services.routes';
import blocksRoutes from './routes/blocks.routes';
import reservationsRoutes from './routes/reservations.routes';
import calendarRoutes from './routes/calendar.routes';

const app: Express = express();

// Do not advertise the framework in headers.
app.disable('x-powered-by');

// Trust the first proxy hop so express-rate-limit sees the real client IP
// behind a reverse proxy (nginx, Cloudflare, etc.).
app.set('trust proxy', 1);

// ─── Security middleware ─────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);

// Strict CORS allowlist — rejects requests from origins not explicitly allowed.
const allowedOrigins = env.ALLOWED_ORIGINS_LIST;
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server (no Origin header) and curl/health checks.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate limiters ───────────────────────────────────────────────────────────

// Global fallback limiter for the API surface.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for credential-based endpoints (brute-force protection).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.',
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
  },
});

// Anti-spam limiter for the public reservation endpoint.
const reservationsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas reservas enviadas desde esta IP. Inténtalo más tarde.',
    code: 'TOO_MANY_RESERVATIONS',
  },
});

// Apply specific limiters BEFORE the global one so they take precedence.
app.use('/api/auth/login', loginLimiter);
// Only rate-limit the public POST /api/reservations — admin routes are authenticated.
app.post('/api/reservations', reservationsLimiter);

app.use('/api', globalLimiter);

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/blocks', blocksRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/calendar', calendarRoutes);

// 404 & error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

export default app;
