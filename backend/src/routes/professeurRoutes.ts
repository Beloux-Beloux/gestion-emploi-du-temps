import { Router } from 'express';
import { getAllProfesseurs, getProfesseurById, createProfesseur, updateProfesseur, deleteProfesseur } from '../controllers/professeurController';

const router = Router();

router.get('/', getAllProfesseurs);
router.get('/:id', getProfesseurById);
router.post('/', createProfesseur);
router.put('/:id', updateProfesseur);
router.delete('/:id', deleteProfesseur);

export default router;