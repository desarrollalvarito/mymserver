import 'dotenv/config'
import jwt from 'jsonwebtoken'

const expiresIn = process.env.JWT_EXPIRES || '1d'
const secret = process.env.JWT_SECRET || 'secret'

export const generateToken = (username) =>{
    try {
        const token = jwt.sign({username}, secret, {expiresIn})
        return {token, expiresIn}
    } catch (error) {
        console.log('Error: ',error.message);
    }
}

export const verifyToken = (token) =>{
    try {
        token = token.split(' ')[1]
        return jwt.verify(token, secret)
    } catch (error) {
        console.log('Error: ',error.message);
    }
}