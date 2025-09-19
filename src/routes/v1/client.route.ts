import { Router } from 'express';
import { ClientController } from '../../controllers/v1/client.controller';
import { validationResultExpress } from '../../middlewares/validationResult';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/list', authenticateToken, ClientController.list);
router.post(
  '/add',
  authenticateToken,
  ClientController.validate('add'),
  validationResultExpress,
  ClientController.add
);
router.put(
  '/modify',
  authenticateToken,
  ClientController.validate('modify'),
  validationResultExpress,
  ClientController.modify
);
router.delete(
  '/remove',
  authenticateToken,
  ClientController.validate('remove'),
  validationResultExpress,
  ClientController.remove
);

export default router;