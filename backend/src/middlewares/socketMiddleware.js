import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      next(new Error('Unauthorized: No token provided'))
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!decoded) {
      return next(new Error('Unauthorized: Invalid token'))
    }

    const user = await User.findById(decoded.userId).select('-hashPassword')
    if (!user) {
      return next(new Error('Unauthorized: User not found'))
    }

    socket.user = user

    next()
  } catch (error) {
    console.error('Lỗi khi verify token trong socketAuthMiddleware:', error)
    next(new Error('Unauthorized: Token verification failed'))
  }
}
