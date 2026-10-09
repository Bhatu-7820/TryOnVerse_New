require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');

// ─── Process-level crash guards (MUST be first) ────────────────────────────

// Never crash on unhandled promise rejections (e.g. Firebase async errors)
process.on('unhandledRejection', (err) => {
  console.warn('[UnhandledRejection] Caught:', err?.message || err);
  // Don't exit — keep the server alive
});

// Never crash on uncaught sync exceptions (last resort safety net)
process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err?.message || err);
  // Don't exit for non-fatal errors
});

// ─── Database ──────────────────────────────────────────────────────────────
connectDB();

// ─── App & Server ──────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.io ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /\.netlify\.app$/.test(origin) || /\.onrender\.com$/.test(origin)) {
        return cb(null, true);
      }
      cb(new Error(`Socket CORS: ${origin} not allowed`));
    },
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_user_room', (userId) => {
    if (userId) socket.join(userId);
  });
  socket.on('disconnect', () => { });
});

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Helmet — permissive for React SPA Vite bundle, Three.js canvas & external images
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (/\.netlify\.app$/.test(origin)) return callback(null, true);
    if (/\.onrender\.com$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ─── TryOnVerse API Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/body-scan', require('./routes/bodyScanRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/auctions', require('./routes/auctionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ─── Legacy / Compatibility Routes ─────────────────────────────────────────
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/user/requests', require('./routes/requestRoutes'));
app.use('/api/cities', require('./routes/cityRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

// ─── Serve Frontend (React Single Page App) ────────────────────────────────
const candidateDistPaths = [
  path.join(__dirname, '../traveloop-frontend/dist'),
  path.join(__dirname, '../../traveloop-frontend/dist'),
  path.join(process.cwd(), 'traveloop-frontend/dist'),
  path.join(process.cwd(), 'dist'),
];

const clientBuildDir = candidateDistPaths.find(dir => fs.existsSync(dir));

if (clientBuildDir) {
  console.log(`📦 Serving React frontend from: ${clientBuildDir}`);
  app.use(express.static(clientBuildDir));

  // SPA fallback for all GET navigation requests
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.originalUrl.startsWith('/api') && !req.originalUrl.startsWith('/health')) {
      return res.sendFile(path.join(clientBuildDir, 'index.html'));
    }
    next();
  });
} else {
  console.warn('⚠️ Frontend dist directory not found. Candidates checked:', candidateDistPaths);
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:80px auto;text-align:center;padding:32px;background:#0f172a;color:#f8fafc;border-radius:16px;">
        <h1 style="color:#6366f1">TryOnVerse Backend is Running</h1>
        <p style="color:#94a3b8">The API and MongoDB connection are online.</p>
        <div style="margin-top:20px">
          <a href="/health" style="color:#38bdf8;margin:0 10px;text-decoration:none">Health Check</a> |
          <a href="/api/products" style="color:#38bdf8;margin:0 10px;text-decoration:none">Product API (180 Items)</a>
        </div>
      </div>
    `);
  });
}

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} already in use. Retrying in 3 seconds...`);
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 3000);
  } else {
    console.error('[Server] Error:', err.message);
  }
});

server.listen(PORT, () => {
  console.log(`✅ SaaS Backend running on port ${PORT}`);
});
