import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

import config from './config';
import connectDB from './config/database';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting — relaxed for browsing-heavy SPA
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 requests per 15 min — enough for SPA navigation
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ==================== CORE MIDDLEWARE ====================
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================== STATIC FILES ====================
// Ensure upload directory exists
const uploadsDir = path.resolve(config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  immutable: false,
}));

// Serve CUTIFY ASSETS folder with aggressive caching
const assetsDir = path.resolve(__dirname, '../../CUTIFY ASSETS/PROJECT CUTIFY');
if (fs.existsSync(assetsDir)) {
  // ── On-the-fly image resize endpoint ──
  // Usage: /assets/resize?src=/assets/CUTE%20BRACELETS/BC01/1.webp&w=400&q=75
  const resizeCache = new Map<string, { buffer: Buffer; etag: string }>();

  app.get('/assets/resize', async (req, res) => {
    try {
      const { src, w, h, q } = req.query;
      if (!src || typeof src !== 'string') {
        return res.status(400).json({ error: 'Missing src parameter' });
      }

      const width = w ? Math.min(parseInt(w as string, 10), 1200) : undefined;
      const height = h ? Math.min(parseInt(h as string, 10), 1200) : undefined;
      const quality = q ? Math.min(Math.max(parseInt(q as string, 10), 10), 100) : 75;

      // Build cache key
      const cacheKey = `${src}_${width || ''}_${height || ''}_${quality}`;

      // Check memory cache
      if (resizeCache.has(cacheKey)) {
        const cached = resizeCache.get(cacheKey)!;
        res.set({
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'ETag': cached.etag,
        });
        if (req.headers['if-none-match'] === cached.etag) {
          return res.status(304).end();
        }
        return res.send(cached.buffer);
      }

      // Resolve file path — strip /assets/ prefix
      const relativePath = decodeURIComponent(src).replace(/^\/assets\//, '');
      const filePath = path.join(assetsDir, relativePath);

      // Security: prevent path traversal
      if (!filePath.startsWith(assetsDir)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Image not found' });
      }

      let pipeline = sharp(filePath);
      if (width || height) {
        pipeline = pipeline.resize(width, height, { fit: 'cover', withoutEnlargement: true });
      }
      const buffer = await pipeline.webp({ quality }).toBuffer();

      const etag = `"${Buffer.from(cacheKey).toString('base64url').slice(0, 16)}"`;

      // Store in cache (limit to 500 entries to prevent memory issues)
      if (resizeCache.size > 500) {
        const firstKey = resizeCache.keys().next().value;
        if (firstKey) resizeCache.delete(firstKey);
      }
      resizeCache.set(cacheKey, { buffer, etag });

      res.set({
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etag,
        'Vary': 'Accept',
      });
      return res.send(buffer);
    } catch (err) {
      console.error('Image resize error:', err);
      return res.status(500).json({ error: 'Failed to process image' });
    }
  });

  // Serve original assets with long-term caching
  app.use('/assets', express.static(assetsDir, {
    maxAge: '30d',
    etag: true,
    lastModified: true,
    immutable: true,
  }));
  console.log('📁 Serving assets from:', assetsDir);
} else {
  console.warn('⚠️  CUTIFY ASSETS folder not found at:', assetsDir);
}

// ==================== API ROUTES ====================
app.use('/api', routes);

// Root route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '✨ Cutify API Server',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ==================== ERROR HANDLING ====================
app.use(notFound);
app.use(errorHandler);

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    app.listen(config.port, () => {
      console.log(`\n✨ Cutify API Server running on port ${config.port}`);
      console.log(`   Environment: ${config.env}`);
      console.log(`   API URL: http://localhost:${config.port}/api`);
      console.log(`   Health: http://localhost:${config.port}/api/health`);
      console.log(`   Frontend: ${config.frontendUrl}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
