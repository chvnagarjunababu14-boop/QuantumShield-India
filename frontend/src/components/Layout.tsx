import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { api } from '../api'
import { LoadingState } from './ui'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { to: '/inventory', label: 'Cryptographic Inventory', icon: 'M4 6h16M4 12h16M4 18h10' },
  { to: '/simulator', label: 'Quantum Threat Simulator', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2' },
  { to: '/quiz', label: 'Awareness Quiz', icon: 'M9 9a3 3 0 116 0c0 2-3 2-3 5m0 3h.01' },
  { to: '/report', label: 'Readiness Report', icon: 'M7 3h7l5 5v13H7V3zm7 0v5h5M10 13h6M10 17h6' },
  { to: '/about', label: 'About / Methodology', icon: 'M12 8h.01M11 12h1v5h1M12 2a10 10 0 100 20 10 10 0 000-20z' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function ApiStatus() {
  const [state, setState] = useState<'checking' | 'online' | 'offline'>('checking')
  useEffect(() => {
    let alive = true
    const check = () =>
      api.health().then(
        () => alive && setState('online'),
        () => alive && setState('offline'),
      )
    check()
    const id = window.setInterval(check, 15000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])
  const color = state === 'online' ? 'bg-emerald-400' : state === 'offline' ? 'bg-red-400' : 'bg-slate-500'
  const text = state === 'online' ? 'API online' : state === 'offline' ? 'API offline' : 'Checking API...'
  return (
    <p className="flex items-center gap-2 text-xs text-slate-400" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {text}
    </p>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-teal-500 focus:px-3 focus:py-2 focus:text-navy-950">
        Skip to content
      </a>

      {/* Mobile top bar */}
      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-navy-700 bg-navy-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          className="btn btn-secondary px-3"
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Toggle navigation</span>
          <Icon d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 6h16M4 12h16M4 18h16'} />
        </button>
      </div>

      {open && <div className="no-print fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        id="sidebar"
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-navy-700 bg-navy-900 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="hidden px-6 py-5 lg:block">
          <Brand />
        </div>
        <nav aria-label="Main" className="mt-16 flex-1 space-y-1 px-3 lg:mt-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-teal-500/10 font-medium text-teal-300 ring-1 ring-inset ring-teal-500/30' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon d={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-navy-700 px-6 py-4">
          <ApiStatus />
          <p className="text-xs leading-relaxed text-slate-500">
            Educational tool. Not a certified security scanner. No registration, no data stored on disk.
          </p>
        </div>
      </aside>

      <main id="main" className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/shield.svg" alt="" className="h-8 w-8" />
      <div className="leading-tight">
        <p className="font-semibold text-white">QuantumShield</p>
        <p className="text-xs font-medium tracking-widest text-teal-400">INDIA</p>
      </div>
    </div>
  )
}
