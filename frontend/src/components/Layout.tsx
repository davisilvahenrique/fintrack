import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, LogOut, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside className="flex flex-col w-60 shrink-0 bg-slate-900/90 border-r border-slate-800/60 relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-indigo-600/5 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-indigo-400" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight">
              FinTrack
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-indigo-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={17}
                    className={`transition-all duration-200 ${isActive ? 'text-indigo-400' : ''}`}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-slate-800/60 pt-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600/40 to-violet-600/40 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-indigo-300">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-950 dot-grid">
        <Outlet />
      </main>
    </div>
  )
}
