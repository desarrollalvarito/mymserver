import { verifyToken } from "../helpers/tokenManager.js"

export const validateToken = (req, res, next) => {
    try {
        const token = req.headers?.authorization
        if (!token) throw new Error('Invalid authorization')
        const payload = verifyToken(token)
        next()
    } catch (error) {
        console.log('Error ', error.message)
        return res.status(401).json({ error: error.message })
    }
}