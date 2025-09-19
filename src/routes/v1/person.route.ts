import { Router } from 'express';
import { PersonController } from '../../controllers/v1/person.controller';
import { validationResultExpress } from '../../middlewares/validationResult';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/list', authenticateToken, PersonController.list);
router.post('/add', authenticateToken, PersonController.validate('add'), validationResultExpress, PersonController.add);
router.put('/modify', authenticateToken, PersonController.validate('modify'), validationResultExpress, PersonController.modify);
router.delete('/remove', authenticateToken, PersonController.validate('remove'), validationResultExpress, PersonController.remove);

export default router;