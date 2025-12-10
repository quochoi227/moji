/* eslint-disable no-console */
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Session from '../models/Session.js'

const ACCESS_TOKEN_TTL = '30m'
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstname, lastname } = req.body
    if (!username || !password || !email || !firstname || !lastname) {
      return res.status(400).json({ message: 'Không thể thiếu username, password, email, firstname, lastname' })
    }

    const duplicate = await User.findOne({ username })
    if (duplicate) {
      return res.status(409).json({ message: 'Username đã tồn tại' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${lastname} ${firstname}`
    })

    return res.sendStatus(204)
  } catch (error) {
    console.error('Lỗi khi gọi signUp:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'Không thể thiếu username và password' })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' })
    }

    const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' })
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL })

    const refreshToken = crypto.randomBytes(64).toString('hex')
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL) // 7 days
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: REFRESH_TOKEN_TTL
    })

    res.status(200).json({ message: 'Đăng nhập thành công', accessToken })
  } catch (error) {
    console.error('Lỗi khi gọi signIn:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken
    if (token) {
      await Session.deleteOne({ refreshToken: token })
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
    }

    res.sendStatus(204)
  } catch (error) {
    console.error('Lỗi khi gọi signOut:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}

export const refreshToken = async (req, res) => {
  try {
    // Lấy refresh token từ cookie
    const token = req.cookies?.refreshToken
    if (!token) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' })
    }
    // So với refresh token trong database
    const session = await Session.findOne({ refreshToken: token })
    if (!session) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
    }
    // Kiểm tra hạn sử dụng
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Token đã hết hạn' })
    }
    // Tạo access token mới và gửi về cho client
    const accessToken = jwt.sign({ userId: session.userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL
    })
    return res.status(200).json({ accessToken })
  } catch (error) {
    console.error('Lỗi khi gọi refreshToken:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}
