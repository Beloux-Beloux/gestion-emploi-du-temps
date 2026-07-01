import { Router } from 'express';
import { getAllCours, getCoursByNiveau, getNiveauxList, createCours, updateCours, deleteCours } from '../controllers/coursController';

const router = Router();

router.get('/', getAllCours);
router.get('/niveaux', getNiveauxList);
router.get('/niveau/:niveau', getCoursByNiveau);
router.post('/', createCours);
router.put('/:id', updateCours);
router.delete('/:id', deleteCours);

export default router;