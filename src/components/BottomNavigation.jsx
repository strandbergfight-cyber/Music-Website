import { NavLink } from 'react-router-dom'

function buildClassName({ isActive }) {
  return `student-bottom-link${isActive ? ' active' : ''}`
}

export default function BottomNavigation({ routes }) {
  return (
    <nav className="student-bottom-nav">
      {routes.map((route) => (
        <NavLink key={route.id} className={buildClassName} to={route.path}>
          {route.navLabel ?? route.title}
        </NavLink>
      ))}
    </nav>
  )
}
