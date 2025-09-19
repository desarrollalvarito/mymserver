import { Router } from 'express';
import { EmployeeController } from '../../controllers/v1/employee.controller';
import { validationResultExpress } from '../../middlewares/validationResult';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/list', authenticateToken, EmployeeController.list);
router.post(
  '/add',
  authenticateToken,
  EmployeeController.validate('add'),
  validationResultExpress,
  EmployeeController.add
);
router.put(
  '/modify',
  authenticateToken,
  EmployeeController.validate('modify'),
  validationResultExpress,
  EmployeeController.modify
);
router.delete(
  '/remove',
  authenticateToken,
  EmployeeController.validate('remove'),
  validationResultExpress,
  EmployeeController.remove
);

export default router;