import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, ChevronDown, LogOut, User, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchNotificaciones, marcarNotificacionLeida } from '../../services/notificacionesService';
import styles from './TopNavbar.module.css';

export default function TopNavbar({ onMenuToggle, pageTitle }) {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [busqueda,        setBusqueda]        = useState('');
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [notifDropdownAbierto, setNotifDropdownAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          placeholder="Buscar aquí..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoComplete="off"
          aria-label="Búsqueda global"
        />
      </div>

      {/* ── Derecha: notificaciones + perfil ─────────────────────────────── */}
      <div className={styles.right}>

        {/* Campana */}
        <div className={styles.profileWrapper} ref={notifRef}>
          <button 
            className={styles.bellBtn} 
            aria-label="Notificaciones"
            onClick={() => setNotifDropdownAbierto(v => !v)}
          >
            <Bell size={20} />
            {noLeidas > 0 && <span className={styles.bellBadge}>{noLeidas}</span>}
          </button>

          {notifDropdownAbierto && (
            <div className={styles.dropdown} style={{ right: 0, minWidth: '300px', padding: 0 }} role="menu">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600 }}>
                Notificaciones
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notificaciones.length === 0 ? (
                  <p style={{ padding: '16px', textAlign: 'center', color: '#64748B', margin: 0, fontSize: '14px' }}>No hay notificaciones</p>
                ) : (
                  notificaciones.map(n => (
                    <div key={n.ID_NOT} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '6px', background: n.EST_NOT === 'Pendiente' ? '#f0fdfa' : '#fff' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>{n.MEN_NOT}</p>
                      {n.EST_NOT === 'Pendiente' && (
                        <button 
                          onClick={() => handleLeer(n.ID_NOT)}
                          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#0ea5e9', fontSize: '12px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
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
