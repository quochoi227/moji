export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'
  'https://moji-ivory.vercel.app',
  // Không cho phép localhost access ở đây nữa vì nó đã được cho phép khi env.BUILD_MODE='dev'
  // Về sau thêm domains nếu có deploy
  'https://moji.henrylam.id.vn'
]
