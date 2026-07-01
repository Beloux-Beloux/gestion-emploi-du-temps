import { Request, Response } from 'express';
import { pool } from '../index';

export const getAllSalles = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM salle ORDER BY nom');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des salles' });
  }
};

export const getSalleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM salle WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Salle non trouvée' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
};

export const createSalle = async (req: Request, res: Response) => {
  const { nom, capacite } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO salle (nom, capacite) VALUES ($1, $2) RETURNING *',
      [nom, capacite || 30]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Cette salle existe déjà' });
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

export const updateSalle = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nom, capacite } = req.body;
  try {
    const result = await pool.query(
      'UPDATE salle SET nom=$1, capacite=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [nom, capacite, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Salle non trouvée' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deleteSalle = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM salle WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Salle non trouvée' });
    res.json({ message: 'Salle supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};