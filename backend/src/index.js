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
app.get('/api/debug-db', (req, res) => {
  const raw = process.env.DATABASE_URL || '';
  const masked = raw.replace(/:([^:@]{3})[^@]*@/, ':***@');
  const hasPooler = raw.includes('.pooler.supabase.com');
  const port = raw.match(/:(\d+)\//)?.[1];
  res.json({ masked, hasPooler, port, hasPgbouncer: raw.includes('pgbouncer') });
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
