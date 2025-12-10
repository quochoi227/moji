import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './libs/db.js'
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import friendRoute from './routes/friendRoute.js'
import messageRoute from './routes/messageRoute.js'
import conversationRoute from './routes/conversationRoute.js'
import cookieParser from 'cookie-parser'
import { protectedRoute } from './middlewares/authMiddleware.js'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import { app, server } from './socket/index.js'

dotenv.config()

const PORT = process.env.PORT || 5001

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
)

// Swagger Setup
const swaggerDocument = JSON.parse(fs.readFileSync('./src/swagger.json', 'utf8'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Public Routes
app.use('/api/auth', authRoute)

// Private Routes
app.use(protectedRoute)
app.use('/api/users', userRoute)
app.use('/api/friends', friendRoute)
app.use('/api/messages', messageRoute)
app.use('/api/conversations', conversationRoute)

connectDB().then(() => {
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
