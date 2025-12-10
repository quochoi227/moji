export const authMe = async (req, res) => {
  try {
    const user = req.user

    return res.status(200).json({ user })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi gọi authMe:', error)
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' })
  }
}
