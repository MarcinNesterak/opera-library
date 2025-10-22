import { Link, useLocation } from 'react-router-dom'

// Icons mapping
const icons = {
  '/': '🏠',
  '/loans': '📋',
  '/musicians': '👥',
  '/scores': '🎵',
  '/settings': '⚙️',
}

const navItems = [
  { path: '/', label: 'Panel' },
  { path: '/loans', label: 'Wypożyczenia' },
  { path: '/musicians', label: 'Muzycy' },
  { path: '/scores', label: 'Nuty' },
  { path: '/settings', label: 'Ustawienia' },
]

export default function BottomNavigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pastel-beige border-t-2 border-pastel-gold z-50 shadow-lg md:hidden opacity-100">
      <div className="flex justify-around items-center h-20 safe-padding-bottom">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full text-sm font-medium transition-colors duration-200 ${
              isActive(item.path)
                ? 'text-pastel-burgundy'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="text-3xl mb-1">{icons[item.path as keyof typeof icons]}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      <style>{`
        .safe-padding-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </nav>
  )
}
