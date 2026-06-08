import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, GraduationCap, Menu, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchNotificaciones, marcarNotificacionLeida } from '../../services/notificacionesService';
import styles from './TeacherNavbar.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// TeacherNavbar.jsx — Barra superior horizontal para el panel del docente.
// Sin sidebar; la navegación es horizontal compacta.
// ──────────────────────────────────────────────────────────────────────────────

export default function TeacherNavbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const isEstudiante = usuario?.rol === 'Estudiante';
  const prefix = isEstudiante ? '/dashboard/estudiante' : '/dashboard/docente';

  const NAV_LINKS = [
    { label: 'Inicio',          to: prefix,                exact: true  },
    { label: 'Mis Préstamos',   to: `${prefix}/${isEstudiante ? 'mis-prestamos' : 'prestamos'}`, exact: false },
    ...(isEstudiante ? [] : [{ label: 'Mantenimientos', to: `${prefix}/mantenimientos`, exact: false }]),
    { label: 'Catálogo',        to: `${prefix}/catalogo`,       exact: false },
  ];

  const [menuMovil,       setMenuMovil]       = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [notifDropdownAbierto, setNotifDropdownAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (usuario) {
      fetchNotificaciones().then(setNotificaciones).catch(console.error);
    }
  }, [usuario]);

  const handleLeer = async (id_not) => {
    try {
      await marcarNotificacionLeida(id_not);
      setNotificaciones(prev => 
        prev.map(n => n.ID_NOT === id_not ? { ...n, EST_NOT: 'Enviado' } : n)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const noLeidas = notificaciones.filter(n => n.EST_NOT === 'Pendiente').length;

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  const inicial = usuario?.nom_usu?.[0]?.toUpperCase() ?? 'D';

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>

        {/* ── Logo ────────────────────────────────────────────────────────── */}
        <NavLink to={prefix} className={styles.logo} aria-label="Inicio">
          <div className={styles.logoIcon} aria-hidden="true">
            <GraduationCap size={18} color="#059669" />
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
          <div className={styles.profileWrapper} ref={notifRef}>
            <button 
              className={styles.bellBtn} 
              aria-label="Notificaciones"
              onClick={() => setNotifDropdownAbierto(v => !v)}
            >
              <Bell size={20} className={styles.bellIcon} />
              {noLeidas > 0 && <span className={styles.bellBadge}>{noLeidas}</span>}
            </button>

            {notifDropdownAbierto && (
              <div 
                className={styles.dropdown} 
                style={{ right: 0, minWidth: '300px', padding: 0 }}
                role="menu"
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', background: '#ffffff', fontWeight: 600, color: '#0F172A', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                  Notificaciones
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#ffffff', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                  {notificaciones.length === 0 ? (
                    <p style={{ padding: '16px', textAlign: 'center', color: '#64748B', margin: 0, fontSize: '14px' }}>No hay notificaciones</p>
                  ) : (
                    notificaciones.map(n => (
                      <div key={n.ID_NOT} style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px', background: n.EST_NOT === 'Pendiente' ? '#F8FAFC' : '#ffffff' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>{n.MEN_NOT}</p>
                        {n.EST_NOT === 'Pendiente' && (
                          <button 
                            onClick={() => handleLeer(n.ID_NOT)}
                            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#0284C7', fontSize: '12px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle size={12} /> Marcar como leída
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
