import { Router } from "express";
import { listClient, createClient, updateClient, deleteClient } from "../controllers/client.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = Router()

router.get('/list', listClient)
router.post('/create', createClient)
router.put('/update', updateClient)
router.delete('/delete', deleteClient)

export default router