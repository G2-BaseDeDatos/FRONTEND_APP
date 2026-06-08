import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  BarChart2,
  ShoppingBag,
  Package,
  TrendingUp,
  Mail,
  Settings,
  Heart,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// Definición de módulos del menú lateral requeridos para el rediseño.
// ──────────────────────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  {
    label: 'Tablero',
    id:    'admin',
    path:  '/dashboard/admin',
    icon:  BarChart2,
  },
  {
    label: 'Usuarios',
    id:    'usuarios',
    path:  '/dashboard/admin/usuarios',
    icon:  User,
  },
  {
    label: 'Inventario',
    id:    'inventario',
    path:  '/dashboard/admin/inventario',
    icon:  Package,
  },
  {
    label: 'Préstamos',
    id:    'prestamos',
    path:  '/dashboard/admin/prestamos',
    icon:  History,
  },
  {
    label: 'Mantenimiento',
    id:    'mantenimiento',
    path:  '/dashboard/admin/mantenimiento',
    icon:  Settings,
  },
  {
    label: 'Movimientos',
    id:    'movimientos',
    path:  '/dashboard/admin/movimientos',
    icon:  TrendingUp,
  },
  {
    label: 'Categorías',
    id:    'categorias',
    path:  '/dashboard/admin/categorias',
    icon:  ShoppingBag,
  },
  {
    label: 'Ubicaciones',
    id:    'ubicaciones',
    path:  '/dashboard/admin/ubicaciones',
    icon:  Heart, // Or any other icon
  },
];

export default function Sidebar({ collapsed, onToggle, activeItem, onSelect }) {
  const { cerrarSesion, usuario } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

      {/* ── Logo / Nombre del sistema (Encabezado: Tablero) ────────────────── */}
      <div className={styles.logoArea} onClick={() => navigate('/dashboard/admin')} style={{ cursor: 'pointer' }}>
        <div className={styles.logoIcon} aria-hidden="true">
          <LayoutDashboard size={20} color="#34d399" />
        </div>
        {!collapsed && (
          <span className={styles.logoText}>Tablero</span>
        )}
        <button
          className={styles.toggleBtn}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Navegación ────────────────────────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Menú principal del administrador">
        <ul className={styles.navList} role="list">
          {MENU_ITEMS.map(({ label, id, path, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => navigate(path)}
                className={`${styles.navItem} ${activeItem === id ? styles.navItemActive : ''}`}
                title={collapsed ? label : undefined}
                aria-label={label}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  <Icon size={20} />
                </span>
                {!collapsed && (
                  <span className={styles.navLabel}>{label}</span>
                )}
              </button>
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
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>

    </aside>
  );
}
