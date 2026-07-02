import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import professeurRoutes from './routes/professeurRoutes';
import salleRoutes from './routes/salleRoutes';
import coursRoutes from './routes/coursRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use('/api/professeurs', professeurRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/cours', coursRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'ok', message: 'Base de données connectée' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erreur de connexion BD' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
