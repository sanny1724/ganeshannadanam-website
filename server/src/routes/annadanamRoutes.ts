import { Router } from 'express';
import {
  getAnnadanams,
  createAnnadanam,
  getMetadata,
  updateAnnadanam,
  deleteAnnadanam,
  getSingleAnnadanam
} from '../controllers/annadanamController.js';

const router = Router();

router.get('/', getAnnadanams);
router.post('/', createAnnadanam);
router.get('/meta', getMetadata);
router.get('/:id', getSingleAnnadanam);
router.put('/:id', updateAnnadanam);
router.delete('/:id', deleteAnnadanam);

export default router;


