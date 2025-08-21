import { Router } from "express";
import { getProduct, listDates, add, modify, remove, listToday } from "../controllers/order.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.get('/list', listToday)
router.post('/listdates', listDates)
router.post('/get', getProduct)
router.post('/add', add)
router.put('/modify', modify)
router.delete('/remove', remove)

export default router