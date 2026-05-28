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
    label: 'Perfil',
    id:    'perfil',
    icon:  User,
  },
  {
    label: 'Clasificación',
    id:    'clasificacion',
    icon:  BarChart2,
  },
  {
    label: 'Pedidos',
    id:    'pedidos',
    icon:  ShoppingBag,
  },
  {
    label: 'Productos',
    id:    'productos',
    icon:  Package,
  },
  {
    label: 'Reporte de Ventas',
    id:    'reporte_ventas',
    icon:  TrendingUp,
  },
  {
    label: 'Mensajes',
    id:    'mensajes',
    icon:  Mail,
  },
  {
    label: 'Configuración',
    id:    'configuracion',
    icon:  Settings,
  },
  {
    label: 'Favoritos',
    id:    'favoritos',
    icon:  Heart,
  },
  {
    label: 'Historial',
    id:    'historial',
    icon:  History,
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
      <div className={styles.logoArea} onClick={() => onSelect('tablero')} style={{ cursor: 'pointer' }}>
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
          {MENU_ITEMS.map(({ label, id, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => onSelect(id)}
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
