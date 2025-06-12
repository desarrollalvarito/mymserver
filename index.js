import express from "express";
import 'dotenv/config'
import routerAuth from './routes/auth.route.js'
import routerEmployee from './routes/employee.route.js'
import routerProduct from './routes/product.route.js'
import cors from 'cors'

const app = express();
app.use(cors())
app.use(express.json())
app.use('/api/auth', routerAuth)
app.use('/api/employee', routerEmployee)
app.use('/api/product', routerProduct)

app.get('/', (req, res) => {
    res.send('Welcome to the API');
})

const port = process.env.PORT || 3000;
app.listen(port);
console.log("Express in port " + port);