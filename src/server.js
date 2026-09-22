import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
console.log('เชื่อมต่อ MongoDB สำเร็จ');

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/about',(req, res) => {
  res.send('<h1>HelloBro</h1>')
});

app.get('/healthz', async (req, res) => {
  try {
    await client.db().command({ ping: 1 });
    res.json({ status: 'ok', db: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'ok', db: 'error' });
  }
});

app.listen(PORT, () => {
  console.log(`its-forms listening on http://localhost:${PORT}`);
});
