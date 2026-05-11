import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './TeacherNavbar.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// TeacherNavbar.jsx — Barra superior horizontal para el panel del docente.
// Sin sidebar; la navegación es horizontal compacta.
// ──────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Inicio',          to: '/dashboard/docente',                exact: true  },
  { label: 'Mis Préstamos',   to: '/dashboard/docente/prestamos',      exact: false },
  { label: 'Mantenimientos',  to: '/dashboard/docente/mantenimientos', exact: false },
  { label: 'Usuarios',        to: '/dashboard/docente/usuarios',       exact: false },
  { label: 'Roles',           to: '/dashboard/docente/roles',          exact: false },
  { label: 'Catálogo',        to: '/dashboard/docente/catalogo',       exact: false },
];

export default function TeacherNavbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [menuMovil,       setMenuMovil]       = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  const inicial = usuario?.nom_usu?.[0]?.toUpperCase() ?? 'D';

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>

        {/* ── Logo ────────────────────────────────────────────────────────── */}
        <NavLink to="/dashboard/docente" className={styles.logo} aria-label="Inicio">
          <div className={styles.logoIcon} aria-hidden="true">
            <GraduationCap size={18} color="#3B82F6" />
          </div>
          <span className={styles.logoText}>Inventario Académico</span>
        </NavLink>

        {/* ── Navegación desktop ──────────────────────────────────────────── */}
        <nav className={styles.navDesktop} aria-label="Navegación principal del docente">
          {NAV_LINKS.map(({ label, to, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Derecha: campana + avatar ────────────────────────────────────── */}
        <div className={styles.right}>

          {/* Campana animada */}
          <button className={styles.bellBtn} aria-label="Notificaciones">
            <Bell size={20} className={styles.bellIcon} />
            <span className={styles.bellBadge} aria-hidden="true" />
          </button>

          {/* Avatar + dropdown */}
          <div className={styles.profileWrapper} ref={dropdownRef}>
            <button
              className={styles.profileBtn}
              onClick={() => setDropdownAbierto((v) => !v)}
              aria-expanded={dropdownAbierto}
              aria-haspopup="menu"
              aria-label="Menú de perfil"
            >
              <div className={styles.avatar} aria-hidden="true">{inicial}</div>
              <span className={styles.profileName}>{usuario?.nom_usu}</span>
              <ChevronDown
                size={14}
                className={`${styles.chevron} ${dropdownAbierto ? styles.chevronOpen : ''}`}
                aria-hidden="true"
              />
            </button>

            {dropdownAbierto && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownName}>{usuario?.nom_usu}</p>
                  <p className={styles.dropdownRole}>Docente</p>
                  <p className={styles.dropdownEmail}>{usuario?.cor_usu}</p>
                </div>
                <hr className={styles.divider} />
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={15} aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Hamburguesa móvil */}
          <button
            className={styles.menuMovilBtn}
            onClick={() => setMenuMovil((v) => !v)}
            aria-label={menuMovil ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuMovil ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Menú móvil desplegable ──────────────────────────────────────────── */}
      {menuMovil && (
        <nav className={styles.navMovil} aria-label="Menú móvil">
          {NAV_LINKS.map(({ label, to, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `${styles.navMovilLink} ${isActive ? styles.navMovilLinkActive : ''}`
              }
              onClick={() => setMenuMovil(false)}
            >
              {label}
            </NavLink>
          ))}
          <button className={styles.navMovilLogout} onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            Cerrar sesión
          </button>
        </nav>
      )}
    </header>
  );
}
