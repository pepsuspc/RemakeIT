import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const { env } = await import('./config/env.js');
  const { sessionMiddleware, startSession, requireAuth } = await import('./auth/session.js');
  const { connectDb, getDb } = await import('./db/connection.js');
  const { allEmployees } = await import('./org/client.js');
  const { syncUsers } = await import('./org/sync.js');
  const { findUserByEmpId } = await import('./models/users.js');
  const { createDraft, findDraftById, saveDraftValues, listMyDrafts } = await import('./models//submissions.js');
  const { ObjectId } = await import('mongodb');

  await connectDb();
  console.log('เชื่อมต่อ MongoDB สำเร็จ');

  const count = await syncUsers();
  console.log(`sync ผังองค์กรตอนเริ่มระบบ: ${count} คน`);

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.static(path.join(__dirname, '../public')));
  
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
      await getDb().command({ ping: 1 });
      res.json({ status: 'ok', db: 'ok' });
    } catch (err) {
      res.status(500).json({ status: 'ok', db: 'error' });
    }
  });

  app.get('/auth/login', async (req, res) => {
    const employees = await allEmployees();
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

  app.get('/', async (req, res) => {
    const user = await findUserByEmpId(req.session.emp_id);
    res.render('home', { user });
  });

  app.get('/about', (req, res) => {
    res.send('<h1>HelloBro</h1>');
  });

  app.get('/memo/new', async (req, res) => {
    const user = await findUserByEmpId(req.session.emp_id);
    const id = await createDraft(user);
    res.redirect(`/memo/${id}/edit`);
  });

  app.get('/memo/:id/edit', async (req, res) => {
    let objectId;
    try {
      objectId = new ObjectId(req.params.id);
    } catch {
      return res.status(404).send('ไม่พบร่างนี้');
    }
    const draft = await findDraftById(objectId, req.session.emp_id);
    if (!draft) return res.status(404).send('ไม่พบร่างนี้');
    res.render('memo-edit', { draft });
  });

  app.post('/memo/:id/save', async (req, res) => {
    let objectId;
    try {
      objectId = new ObjectId(req.params.id);
    } catch {
      return res.status(404).json({ ok: false });
    }
    const ok = await saveDraftValues(objectId, req.session.emp_id, req.body.values || {});
    if (!ok) return res.status(404).json({ ok: false });
    res.json({ ok: true });
  });

  app.get('/submissions/mine', async (req, res) => {
    const drafts = await listMyDrafts(req.session.emp_id);
    res.render('submissions-mine', { drafts });
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
