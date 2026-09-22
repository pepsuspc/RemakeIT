import express from 'express';
import { MongoClient } from 'mongodb';

async function main() {
  const { env } = await import('./config/env.js');

  const client = new MongoClient(env.mongodbUri);
  await client.connect();
  console.log('เชื่อมต่อ MongoDB สำเร็จ');

  const app = express();

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  app.get('/', (req, res) => {
    res.send('Hi');
  });

  app.get('/about', (req, res) => {
    res.send('<h1>HelloBro</h1>');
  });

  app.get('/healthz', async (req, res) => {
    try {
      await client.db().command({ ping: 1 });
      res.json({ status: 'ok', db: 'ok' });
    } catch (err) {
      res.status(500).json({ status: 'ok', db: 'error' });
    }
  });

  app.listen(env.port, () => {
    console.log(`its-forms listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('its-forms failed to start:');
  console.error(err.message);
  process.exit(1);
});
