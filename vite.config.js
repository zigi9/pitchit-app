import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Nastavíme env premenné aj pre process.env, aby k nim mali prístup lokálne Netlify funkcie
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      {
        name: 'local-netlify-functions',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url.startsWith('/.netlify/functions/')) {
              const functionName = req.url.split('/').pop();
              const functionPath = path.resolve(__dirname, `netlify/functions/${functionName}.js`);
              
              if (fs.existsSync(functionPath)) {
                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                  try {
                    // Pre dynamický import CommonJS
                    const module = await import(`file://${functionPath}?update=${Date.now()}`);
                    const handler = module.handler || module.default?.handler;
                    
                    const event = {
                      httpMethod: req.method,
                      body: body || null,
                      headers: req.headers
                    };
                    
                    const result = await handler(event, {});
                    res.statusCode = result.statusCode || 200;
                    if (result.headers) {
                      for (const [k, v] of Object.entries(result.headers)) {
                        res.setHeader(k, v);
                      }
                    }
                    res.end(result.body);
                  } catch (err) {
                    console.error('Error running local function:', err);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: err.message }));
                  }
                });
                return;
              }
            }
            next();
          });
        }
      }
    ],
    server: {
      port: 5173,
      open: true,
    },
  }
})
