const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const dotenv = require('dotenv');

// Load .env into process.env (both locally and during build on Vercel)
dotenv.config();

// Bring in the existing (ES‑module) code
async function getExpressApp() {
  try {
    // Use require directly because the code will already be transpiled in production
    let initialize, createMiddleware, createApi;
    
    // In production, ES modules are transpiled to CommonJS
    if (process.env.NODE_ENV === 'production') {
      const prodRoot = path.join(__dirname, '../dist');
      initialize = require(path.join(prodRoot, 'initialize'));
      createMiddleware = require(path.join(prodRoot, 'middleware/index'));
      createApi = require(path.join(prodRoot, 'api/index'));
      
      // Handle both export styles
      initialize = initialize.default || initialize;
      createMiddleware = createMiddleware.default || createMiddleware;
      createApi = createApi.default || createApi;
    } else {
      // In development, use dynamic import for ESM support
      const [initMod, middleMod, apiMod] = await Promise.all([
        import('../src/initialize.js'),
        import('../src/middleware/index.js'),
        import('../src/api/index.js'),
      ]);
      
      initialize = initMod.default;
      createMiddleware = middleMod.default;
      createApi = apiMod.default;
    }

    const config = process.env;
    const app = express();
    app.engine('.hbs', hbs({ extname: '.hbs', defaultLayout: 'default' }));
    app.set('view engine', '.hbs');

    // Block requests to source map files
    app.use((req, res, next) => {
      if (req.path.endsWith('.map')) {
        return res.status(404).send('Not found');
      }
      next();
    });

    // Enable CORS during local development
    if (process.env.NODE_ENV !== 'production') {
      const cors = require('cors');
      app.use(cors());
    }

    // Add direct image serving from src/public/images
    app.use('/images', (req, res, next) => {
      const imagePath = path.join(__dirname, '../src/public/images', req.path);
      res.sendFile(imagePath, err => {
        if (err) {
          console.error('Error sending image:', err);
          res.status(404).send('Image not found');
        }
      });
    });
    
    // Handle /guapinol/images path as well
    app.use('/guapinol/images', (req, res, next) => {
      const imagePath = path.join(__dirname, '../src/public/images', req.path.replace('/guapinol', ''));
      res.sendFile(imagePath, err => {
        if (err) {
          console.error('Error sending image:', err);
          res.status(404).send('Image not found');
        }
      });
    });

    let controllerReadyResolve;
    const controllerReady = new Promise((resolve) => (controllerReadyResolve = resolve));

    // Fix image URLs in API responses
    app.use((req, res, next) => {
      const originalSend = res.send;
      res.send = function(body) {
        if (body && typeof body === 'string' && (req.path.includes('/export_sources/') || req.path.includes('/export_events/'))) {
          try {
            // Replace hardcoded localhost:4040 image paths with relative paths
            body = body.replace(/http:\/\/localhost:4040\/images\//g, '/images/');
          } catch (e) {
            console.error('Error fixing image paths:', e);
          }
        }
        originalSend.call(this, body);
      };
      next();
    });

    initialize((controller) => {
      const middleware = createMiddleware({
        config,
        controller,
      });
      const apiRouter = createApi({
        config,
        controller,
      });
      
      // Apply middleware to both path prefixes
      app.use(middleware);
      app.use('/guapinol', middleware);
      
      // Serve blank page at root
      app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../src/public/index.html'));
      });
      
      // Handle both /api and /guapinol/api paths
      app.use('/api', apiRouter);
      app.use('/guapinol/api', apiRouter);
      
      app.use(express.static(path.join(__dirname, '../src/public')));

      // Wait until all blueprints are built before marking the app as ready.
      const waitForBlueprints = () =>
        new Promise((resolve) => {
          const check = () => {
            try {
              const bps = controller.blueprints();
              if (bps && Array.isArray(bps) && bps.length && bps.every((bp) => bp && bp.urls)) {
                return resolve();
              }
            } catch (_) {
              /* ignore */
            }
            setTimeout(check, 50);
          };
          check();
        });

      waitForBlueprints().then(controllerReadyResolve);
    });

    await controllerReady;
    return app;
  } catch (e) {
    console.error('Error initializing express app:', e);
    throw e;
  }
}

// Cache the initialisation between invocations
let cachedPromise;

module.exports = async (req, res) => {
  if (!cachedPromise) {
    cachedPromise = getExpressApp();
  }
  const app = await cachedPromise;
  return app(req, res);
}; 