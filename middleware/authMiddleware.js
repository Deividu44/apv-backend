import jwt from 'jsonwebtoken'
import Veterinario from '../models/Veterinario.js'

const checkAuth = async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log('Si')
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.veterinario = await Veterinario.findById(decoded.id).select('-password')
      return next()
    } catch (error) {
      const e = new Error('Token no válido o inexitente')
      res.status(403).json({ msg: e.message })
    }
  }
  if (!token) {
    const e = new Error('Token no válido o inexitente')
    res.status(403).json({ msg: e.message })
  }
  next()
}

export default checkAuth
