import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Wrench,
  ClipboardList,
  Users,
  FolderOpen,
  MapPin,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// Definición de módulos del menú lateral.
// "to" debe coincidir con las rutas declaradas en App.jsx.
// ──────────────────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    label: 'Dashboard',
    to:    '/dashboard/admin',
    icon:  LayoutDashboard,
    exact: true,
  },
  {
    label: 'Inventario',
    to:    '/dashboard/admin/inventario',
    icon:  Package,
  },
  {
    label: 'Préstamos',
    to:    '/dashboard/admin/prestamos',
    icon:  BookOpen,
  },
  {
    label: 'Mantenimiento',
    to:    '/dashboard/admin/mantenimiento',
    icon:  Wrench,
  },
  {
    label: 'Movimientos',
    to:    '/dashboard/admin/movimientos',
    icon:  ClipboardList,
  },
  {
    label: 'Usuarios',
    to:    '/dashboard/admin/usuarios',
    icon:  Users,
  },
  {
    label: 'Categorías',
    to:    '/dashboard/admin/categorias',
    icon:  FolderOpen,
  },
  {
    label: 'Ubicaciones',
    to:    '/dashboard/admin/ubicaciones',
    icon:  MapPin,
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { cerrarSesion, usuario } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

      {/* ── Logo / Nombre del sistema ──────────────────────────────────────── */}
      <div className={styles.logoArea}>
        <div className={styles.logoIcon} aria-hidden="true">
          <GraduationCap size={22} color="#60A5FA" />
        </div>
        {!collapsed && (
          <span className={styles.logoText}>Inventario Académico</span>
        )}
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Navegación ────────────────────────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Menú principal del administrador">
        <ul className={styles.navList} role="list">
          {MENU_ITEMS.map(({ label, to, icon: Icon, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                title={collapsed ? label : undefined}
                aria-label={label}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  <Icon size={20} />
                </span>
                {!collapsed && (
                  <span className={styles.navLabel}>{label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer del sidebar (usuario + logout) ─────────────────────────── */}
      <div className={styles.sidebarFooter}>
        {!collapsed && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar} aria-hidden="true">
              {usuario?.nom_usu?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{usuario?.nom_usu}</span>
              <span className={styles.userRole}>Administrador</span>
            </div>
          </div>
        )}
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
          {!collapsed && <span>Salir</span>}
        </button>
      </div>

    </aside>
  );
}
