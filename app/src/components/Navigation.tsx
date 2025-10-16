import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navigation() {
  const { logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Panel główny', icon: '🏠' },
    { path: '/loans', label: 'Wypożyczenia', icon: '📋' },
    { path: '/musicians', label: 'Muzycy', icon: '👥' },
    { path: '/scores', label: 'Nuty', icon: '🎵' },
    { path: '/settings', label: 'Ustawienia', icon: '⚙️' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Błąd wylogowania:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive(item.path)
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

