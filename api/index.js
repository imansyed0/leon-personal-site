const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const dotenv = require('dotenv');

// Load .env into process.env (both locally and during build on Vercel)
dotenv.config();

// Bring in the existing (ES‑module) code. It is written with import/export so we need dynamic `import()`.
// Vercel's Node function runtime supports ESM as long as we use dynamic import.
async function getExpressApp() {
  // Dynamically import modules so that Babel's `export default` is respected
  const [{ default: initialize }, { default: createMiddleware }, { default: createApi }] = await Promise.all([
    import('../src/initialize.js'),
    import('../src/middleware/index.js'),
    import('../src/api/index.js'),
  ]);

  const config = process.env;
  const app = express();
  app.engine('.hbs', hbs({ extname: '.hbs', defaultLayout: 'default' }));
  app.set('view engine', '.hbs');

  // Enable CORS during local development
  if (process.env.NODE_ENV !== 'production') {
    const cors = require('cors');
    app.use(cors());
  }

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
    app.use(
      createMiddleware({
        config,
        controller,
      })
    );
    app.use(
      '/api',
      createApi({
        config,
        controller,
      })
    );
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