import express from "express";
import 'dotenv/config'
import routerAuth from './routes/auth.route.js'
import routerPerson from './routes/person.route.js'
import routerEmployee from './routes/employee.route.js'
import routerClient from './routes/client.route.js'
import routerProduct from './routes/product.route.js'
import routerOrder from './routes/order.route.js'
import routerOrderProduct from './routes/orderproduct.route.js'
import cors from 'cors'

const app = express();
app.use(cors())
app.use(express.json())
app.use('/api/auth', routerAuth)
app.use('/api/person', routerPerson)
app.use('/api/employee', routerEmployee)
app.use('/api/client', routerClient)
app.use('/api/product', routerProduct)
app.use('/api/order', routerOrder)
app.use('/api/orderproduct', routerOrderProduct)

app.get('/', (req, res) => {
    res.send('Welcome to the API');
})

export default app;