import { NavLink } from 'react-router-dom'

function buildClassName({ isActive }) {
  return `teacher-link${isActive ? ' active' : ''}`
}

export default function TopNavigation({ routes }) {
  return (
    <header className="teacher-nav">
      <div className="teacher-nav-inner">
        <h1 className="teacher-brand">ZiyangMusicStudio</h1>
        <nav className="teacher-link-list">
          {routes.map((route) => (
            <NavLink key={route.id} className={buildClassName} to={route.path}>
              {route.navLabel ?? route.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
