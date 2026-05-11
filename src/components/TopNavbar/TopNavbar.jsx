import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './TopNavbar.module.css';

export default function TopNavbar({ onMenuToggle, pageTitle }) {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [busqueda,        setBusqueda]        = useState('');
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  // Inicial del nombre del usuario para el avatar
  const inicial = usuario?.nom_usu?.[0]?.toUpperCase() ?? 'A';

  return (
    <header className={styles.navbar}>

      {/* ── Izquierda: hamburguesa + título ─────────────────────────────── */}
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Abrir/cerrar menú lateral"
        >
          <Menu size={22} />
        </button>
        {pageTitle && (
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        )}
      </div>

      {/* ── Centro: búsqueda global ──────────────────────────────────────── */}
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          id="busqueda-global"
          type="search"
          className={styles.searchInput}
          placeholder="Buscar equipos, usuarios…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoComplete="off"
          aria-label="Búsqueda global"
        />
      </div>

      {/* ── Derecha: notificaciones + perfil ─────────────────────────────── */}
      <div className={styles.right}>

        {/* Campana */}
        <button className={styles.bellBtn} aria-label="Notificaciones (hay alertas pendientes)">
          <Bell size={20} />
          <span className={styles.bellBadge} aria-hidden="true" />
        </button>

        {/* Avatar + dropdown ───────────────────────────────────────────── */}
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
                <p className={styles.dropdownEmail}>{usuario?.cor_usu}</p>
              </div>
              <hr className={styles.dropdownDivider} />
              <button
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => { setDropdownAbierto(false); }}
              >
                <User size={15} aria-hidden="true" />
                Mi perfil
              </button>
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

      </div>
    </header>
  );
}
