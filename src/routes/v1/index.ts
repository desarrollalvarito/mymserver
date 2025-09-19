import { Router } from 'express'
import routerAuth from "./auth.route"
import routerPerson from "./person.route"
import routerEmployee from "./employee.route"
import routerClient from "./client.route"
import routerProduct from "./product.route"
import routerOrder from "./order.route"
import routerProduction from "./production.route"

const router = Router();

// Prefijo para todas las rutas v1
router.use('/auth', routerAuth)
router.use('/person', routerPerson)
router.use('/employee', routerEmployee)
router.use('/client', routerClient)
router.use('/product', routerProduct)
router.use('/order', routerOrder)
router.use('/production', routerProduction)

export default router;