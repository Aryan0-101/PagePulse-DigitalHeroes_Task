import express from 'express';
import cors from 'cors';
import auditRoutes from './api/auditRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/', auditRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
  console.log(`Page Pulse backend listening on port ${PORT}`);
});
