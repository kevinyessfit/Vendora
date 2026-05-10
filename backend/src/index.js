import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import affiliateRoutes from './routes/affiliate.routes.js';
import adminRoutes from './routes/admin.routes.js';
import orderRoutes from './routes/order.routes.js';
import payoutRoutes from './routes/payout.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// Apply basic security headers
app.use(helmet());

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payouts', payoutRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vendora API is running' });
});

// Temporary DB debug (remove after fix)
app.get('/api/debug-db', async (req, res) => {
  const raw = process.env.DATABASE_URL || '';
  // Apply same fix as prisma.js
  let fixed = raw.replace(/ /g, '%20');
  if (fixed.includes('.pooler.supabase.com')) {
    fixed = fixed.replace(/:5432\//, ':6543/');
    if (!fixed.includes('pgbouncer')) fixed += (fixed.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
  }
  const info = {
    rawPort: raw.match(/:(\d+)\//)?.[1],
    fixedPort: fixed.match(/:(\d+)\//)?.[1],
    hasSpaces: raw.includes(' '),
    hasPooler: raw.includes('.pooler.supabase.com'),
    fixedHasPgbouncer: fixed.includes('pgbouncer'),
    fixedHost: fixed.match(/@([^:/]+)/)?.[1],
  };
  // Quick TCP test
  const { createConnection } = await import('net');
  const host = fixed.match(/@([^:/]+)/)?.[1];
  const port = parseInt(fixed.match(/:(\d+)\//)?.[1] || '5432');
  await new Promise(resolve => {
    const conn = createConnection({ host, port, timeout: 5000 });
    conn.on('connect', () => { info.tcpConnect = 'ok'; conn.destroy(); resolve(); });
    conn.on('error', e => { info.tcpConnect = e.message; resolve(); });
    conn.on('timeout', () => { info.tcpConnect = 'timeout'; conn.destroy(); resolve(); });
  });
  res.json(info);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Vendora API running on http://localhost:${PORT}`);
  });
}

export default app;
