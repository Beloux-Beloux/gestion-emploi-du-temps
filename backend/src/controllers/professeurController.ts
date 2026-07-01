import { Request, Response } from 'express';
import { pool } from '../index';

export const getAllProfesseurs = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM professeur ORDER BY nom, prenom');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des professeurs' });
  }
};

export const getProfesseurById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM professeur WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Professeur non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
};

export const createProfesseur = async (req: Request, res: Response) => {
  const { nom, prenom, email, specialite } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO professeur (nom, prenom, email, specialite) VALUES ($1, $2, $3, $4) RETURNING *`,
      [nom, prenom, email, specialite]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Cet email existe déjà' });
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

export const updateProfesseur = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nom, prenom, email, specialite } = req.body;
  try {
    const result = await pool.query(
      `UPDATE professeur SET nom=$1, prenom=$2, email=$3, specialite=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
      [nom, prenom, email, specialite, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Professeur non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deleteProfesseur = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM professeur WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Professeur non trouvé' });
    res.json({ message: 'Professeur supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};