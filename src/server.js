import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('its-forms');
});

app.listen(PORT, () => {
  console.log(`its-forms listening on http://localhost:${PORT}`);
});
