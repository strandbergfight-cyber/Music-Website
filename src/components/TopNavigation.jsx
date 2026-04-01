import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function buildClassName({ isActive }) {
  return `teacher-link${isActive ? ' active' : ''}`
}

export default function TopNavigation({ routes }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="teacher-nav">
      <div className="teacher-nav-inner">
        <div className="teacher-nav-top">
          <h1 className="teacher-brand">ZiyangMusicStudio</h1>
          <button
            className="teacher-nav-toggle"
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
          >
            {isOpen ? '收起' : '菜单'}
          </button>
        </div>
        <nav className={`teacher-link-list${isOpen ? ' open' : ''}`}>
          {routes.map((route) => (
            <NavLink key={route.id} className={buildClassName} onClick={() => setIsOpen(false)} to={route.path}>
              {route.navLabel ?? route.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
