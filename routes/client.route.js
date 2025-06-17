import { Router } from "express";
import { list, add, modify, remove } from "../controllers/client.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = Router()

router.get('/list', list)
router.post('/add', add)
router.put('/modify', modify)
router.delete('/remove', remove)

export default router