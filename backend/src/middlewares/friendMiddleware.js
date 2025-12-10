import Conversation from '../models/Conversation.js'
import Friend from '../models/Friend.js'

const pair = (a, b) => (a < b ? [a, b] : [b, a])

export const checkFriendship = async (req, res, next) => {
  try {
    const me = req.user._id.toString()

    const recipientId = req.body?.recipientId ?? null

    const memberIds = req.body?.memberIds ?? []

    if (!recipientId && memberIds.length === 0) {
      return res.status(400).json({ message: 'Thiếu recipientId hoặc memberIds' })
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId)
      const isFriend = await Friend.findOne({ userA, userB })
      if (!isFriend) {
        return res.status(403).json({ message: 'Chưa là bạn bè' })
      }

      return next()
    }

    // todo: chat nhóm
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId)

      const friend = await Friend.findOne({ userA, userB })
      return friend ? null : memberId
    })

    const results = await Promise.all(friendChecks)
    const notFriends = results.filter((result) => result !== null)

    if (notFriends.length > 0) {
      return res.status(403).json({ message: `Chưa là bạn bè với các user: ${notFriends.join(', ')}` })
    }

    return next()
  } catch (error) {
    console.error('Lỗi khi kiểm tra friendship:', error)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body
    const userId = req.user._id

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: 'Cuộc trò chuyện không tồn tại' })
    }

    const isMember = conversation.participants.some((p) => p.userId.toString() === userId.toString())

    if (!isMember) {
      return res.status(403).json({ message: 'Bạn không phải thành viên của nhóm này' })
    }

    req.conversation = conversation

    next()
  } catch (error) {
    console.error('Lỗi khi kiểm tra thành viên nhóm:', error)
    return res.status(500).json({ message: 'Lỗi máy chủ' })
  }
}
