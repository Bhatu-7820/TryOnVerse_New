require('dotenv').config();
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

// Helmet — CSP allows external images (Unsplash, Google, Firebase, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', '*'],   // allow ALL image origins
      connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
      mediaSrc: ["'self'", 'blob:', '*'],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,  // needed for cross-origin images/resources
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
