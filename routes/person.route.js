import { Router } from "express";
import { listPerson, createPerson, updatePerson, deletePerson } from "../controllers/person.controller.js";
import { validationResultExpress } from "../middlewares/validationResult.js";
import { validateToken } from "../middlewares/validateToken.js";

const router = Router()

router.get('/list', listPerson)
router.post('/create', createPerson)
router.put('/update', updatePerson)
router.delete('/delete', deletePerson)

export default router