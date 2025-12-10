import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'

function Logout() {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/signin')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  return (
    <Button variant="completeGhost" onClick={handleLogout}>
      <LogOut className="text-destructive" />
      Đăng xuất
    </Button>
  )
}

export default Logout
