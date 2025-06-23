import { Router } from "express";
import { validate, login, create, update, info, get, session } from "../controllers/auth.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/login', validate('login'), validationResultExpress, login)
router.get('/get', get)
router.get('/session', session)
router.post('/create', validate('create'), validationResultExpress, create)
router.put('/update', validate('update'), validationResultExpress, update)

router.get('/', validateToken, info)

export default router