import { Router } from 'express'
import routerAuth from "./auth.route.js"
import routerPerson from "./person.route.js"
import routerEmployee from "./employee.route.js"
import routerClient from "./client.route.js"
import routerProduct from "./product.route.js"
import routerOrder from "./order.route.js"
import routerProduction from "./production.route.js"
import routerSale from "./sale.route.js"

const router = Router();

// Prefijo para todas las rutas v1
router.use('/auth', routerAuth)
router.use('/client', routerClient)
router.use('/employee', routerEmployee)
router.use('/order', routerOrder)
router.use('/person', routerPerson)
router.use('/product', routerProduct)
router.use('/production', routerProduction)
router.use('/sale', routerSale)

export default router;