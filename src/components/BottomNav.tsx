import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', icon: '🏡', label: 'Hjem', end: true },
  { to: '/overview', icon: '📋', label: 'Oversigt', end: false },
  { to: '/reminders', icon: '🔔', label: 'Påmindelser', end: false },
  { to: '/profile', icon: '👤', label: 'Profil', end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom">
      <div className="flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-[#1D9E75]' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
