import { ReactNode } from 'react'
import Navigation from './Navigation'
import BottomNavigation from './BottomNavigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-pastel-cream pb-24 md:pb-0">
      {/* Top navigation for medium screens and up */}
      <div className="hidden md:block">
        <Navigation />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bottom navigation for small screens */}
      <BottomNavigation />
    </div>
  )
}

