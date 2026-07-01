import { Request, Response } from 'express';
import { pool } from '../index';

export const getAllCours = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.nom AS professeur_nom, p.prenom AS professeur_prenom, s.nom AS salle_nom
      FROM cours c
      JOIN professeur p ON c.professeur_id = p.id
      JOIN salle s ON c.salle_id = s.id
      ORDER BY c.jour, c.heure_debut
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des cours' });
  }
};

export const getCoursByNiveau = async (req: Request, res: Response) => {
  const { niveau } = req.params;
  try {
    const result = await pool.query(`
      SELECT c.*, p.nom AS professeur_nom, p.prenom AS professeur_prenom, s.nom AS salle_nom
      FROM cours c
      JOIN professeur p ON c.professeur_id = p.id
      JOIN salle s ON c.salle_id = s.id
      WHERE c.niveau = $1
      ORDER BY c.jour, c.heure_debut
    `, [niveau]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
};

export const getNiveauxList = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT DISTINCT niveau FROM cours ORDER BY niveau');
    const niveaux = ['L1 Grp1', 'L1 Grp2', 'L2 Grp1', 'L2 Grp2', 'L3 Grp1', 'L3 Grp2', 'M1 Grp1', 'M1 Grp2'];
    res.json(niveaux);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
};

export const createCours = async (req: Request, res: Response) => {
  const { titre, professeur_id, salle_id, niveau, groupe, jour, heure_debut, heure_fin, couleur } = req.body;
  try {
    // Contrainte : même professeur ne peut pas être à deux endroits en même temps
    const conflitProf = await pool.query(`
      SELECT * FROM cours 
      WHERE professeur_id = $1 AND jour = $2
      AND (
        (heure_debut <= $3 AND heure_fin > $3)
        OR (heure_debut < $4 AND heure_fin >= $4)
        OR (heure_debut >= $3 AND heure_fin <= $4)
      )
    `, [professeur_id, jour, heure_debut, heure_fin]);

    if (conflitProf.rows.length > 0) {
      return res.status(409).json({ error: 'Le professeur a déjà un cours à ce créneau' });
    }

    // Contrainte : même salle ne peut pas avoir deux cours en même temps
    const conflitSalle = await pool.query(`
      SELECT * FROM cours 
      WHERE salle_id = $1 AND jour = $2
      AND (
        (heure_debut <= $3 AND heure_fin > $3)
        OR (heure_debut < $4 AND heure_fin >= $4)
        OR (heure_debut >= $3 AND heure_fin <= $4)
      )
    `, [salle_id, jour, heure_debut, heure_fin]);

    if (conflitSalle.rows.length > 0) {
      return res.status(409).json({ error: 'La salle est déjà occupée à ce créneau' });
    }

    // Contrainte : même niveau+groupe ne peut pas avoir deux cours en même temps
    const conflitNiveau = await pool.query(`
      SELECT * FROM cours 
      WHERE niveau = $1 AND jour = $2
      AND (
        groupe = $3
        OR groupe = 'Grp1+Grp2'
        OR $3 = 'Grp1+Grp2'
      )
      AND (
        (heure_debut <= $4 AND heure_fin > $4)
        OR (heure_debut < $5 AND heure_fin >= $5)
        OR (heure_debut >= $4 AND heure_fin <= $5)
      )
    `, [niveau, jour, groupe, heure_debut, heure_fin]);

    if (conflitNiveau.rows.length > 0) {
      return res.status(409).json({ error: 'Conflit d\'horaire pour ce niveau/groupe' });
    }

    const result = await pool.query(`
      INSERT INTO cours (titre, professeur_id, salle_id, niveau, groupe, jour, heure_debut, heure_fin, couleur)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [titre, professeur_id, salle_id, niveau, groupe, jour, heure_debut, heure_fin, couleur || '#3B82F6']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du cours' });
  }
};

export const updateCours = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titre, professeur_id, salle_id, niveau, groupe, jour, heure_debut, heure_fin, couleur } = req.body;
  try {
    const result = await pool.query(`
      UPDATE cours 
      SET titre=$1, professeur_id=$2, salle_id=$3, niveau=$4, groupe=$5, 
          jour=$6, heure_debut=$7, heure_fin=$8, couleur=$9, updated_at=NOW()
      WHERE id=$10
      RETURNING *
    `, [titre, professeur_id, salle_id, niveau, groupe, jour, heure_debut, heure_fin, couleur, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cours non trouvé' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deleteCours = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cours WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cours non trouvé' });
    res.json({ message: 'Cours supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};