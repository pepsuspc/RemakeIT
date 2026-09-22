import express from 'express';
import { MongoClient } from 'mongodb';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const { env } = await import('./config/env.js');
  const { sessionMiddleware, startSession, requireAuth } = await import('./auth/session.js');

  const client = new MongoClient(env.mongodbUri);
  await client.connect();
  console.log('เชื่อมต่อ MongoDB สำเร็จ');

  const employeesFile = await readFile(path.join(__dirname, '../mock/org/employees.json'), 'utf8');
  const employees = JSON.parse(employeesFile).data;

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  app.use(sessionMiddleware());

  // /healthz กับ /auth/* ไม่ต้อง login — ต้องอยู่ก่อน requireAuth เสมอ
  app.get('/healthz', async (req, res) => {
    try {
      await client.db().command({ ping: 1 });
      res.json({ status: 'ok', db: 'ok' });
    } catch (err) {
      res.status(500).json({ status: 'ok', db: 'error' });
    }
  });

  app.get('/auth/login', (req, res) => {
    res.render('login-mock', { employees });
  });

  app.post('/auth/mock-login', (req, res) => {
    startSession(req, req.body.emp_id);
    res.redirect('/');
  });

  app.post('/auth/logout', (req, res) => {
    req.session = null;
    res.redirect('/auth/login');
  });

  // ทุก route ข้างล่างนี้ต้อง login ก่อนเท่านั้น
  app.use(requireAuth);

  app.get('/', (req, res) => {
    const user = employees.find((e) => e.emp_id === req.session.emp_id);
    res.render('home', { user });
  });

  app.get('/about', (req, res) => {
    res.send('<h1>HelloBro</h1>');
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
