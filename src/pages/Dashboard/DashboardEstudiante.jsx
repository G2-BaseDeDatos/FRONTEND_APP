import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Package, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth }          from '../../context/AuthContext';
import TeacherNavbar        from '../../components/TeacherNavbar/TeacherNavbar';
import HeroSearch           from '../../components/HeroSearch/HeroSearch';
import ActiveLoanAlert      from '../../components/ActiveLoanAlert/ActiveLoanAlert';
import EquipmentCard, { EquipmentCardSkeleton }
                            from '../../components/EquipmentCard/EquipmentCard';
import CategoryGrid         from '../../components/CategoryGrid/CategoryGrid';
import Toast                from '../../components/Toast/Toast';
import {
  fetchArticulosDisponibles,
  fetchMisPrestamos,
  fetchCategorias,
  solicitarPrestamo,
} from '../../services/studentService';
import styles from './StudentDashboardPage.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// StudentDashboardPage.jsx — Panel principal del Estudiante
// ──────────────────────────────────────────────────────────────────────────────

const SKELETON_COUNT = 8;

export default function StudentDashboardPage() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  // ── Estado ────────────────────────────────────────────────────────────────
  const [articulos,    setArticulos]    = useState([]);
  const [prestamos,    setPrestamos]    = useState([]);
  const [categorias,   setCategorias]   = useState([]);
  const [cargandoArt,  setCargandoArt]  = useState(true);
  const [cargandoPre,  setCargandoPre]  = useState(true);
  const [cargandoCat,  setCargandoCat]  = useState(true);
  const [errorGlobal,  setErrorGlobal]  = useState('');
  const [queryFiltro,  setQueryFiltro]  = useState('');
  const [solicitados,  setSolicitados]  = useState(new Set()); 
  const [toast,        setToast]        = useState(null);    
  const [mounted,      setMounted]      = useState(false);

  // ── Guard de rol ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!estaAutenticado) { navigate('/login', { replace: true }); return; }
    if (usuario?.rol && usuario.rol !== 'Estudiante') {
      const rutas = { Administrador: '/dashboard/admin', Docente: '/dashboard/docente' };
      navigate(rutas[usuario.rol] || '/login', { replace: true });
      return;
    }
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [estaAutenticado, usuario, navigate]);

  // ── Carga paralela de datos ───────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setErrorGlobal('');
    setCargandoArt(true);
    setCargandoPre(true);
    setCargandoCat(true);

    // Equipos disponibles (catálogo)
    fetchArticulosDisponibles()
      .then(setArticulos)
      .catch((err) => {
        if (err?.status === 401) { cerrarSesion(); navigate('/login', { replace: true }); }
        else setErrorGlobal('No se pudo cargar el catálogo de equipos');
      })
      .finally(() => setCargandoArt(false));

    // Mis préstamos (artículos asignados)
    fetchMisPrestamos(usuario?.id_usu)
      .then(setPrestamos)
      .catch(() => setPrestamos([]))
      .finally(() => setCargandoPre(false));

    // Categorías
    fetchCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
      .finally(() => setCargandoCat(false));

  }, [usuario?.id_usu, cerrarSesion, navigate]);

  useEffect(() => {
    if (estaAutenticado && usuario?.rol === 'Estudiante') cargarDatos();
  }, [cargarDatos, estaAutenticado, usuario?.rol]);

  // ── Filtrado local del catálogo por búsqueda ──────────────────────────────
  const articulosFiltrados = useMemo(() => {
    if (!queryFiltro) return articulos;
    const q = queryFiltro.toLowerCase();
    return articulos.filter(a =>
      a.NOM_ART?.toLowerCase().includes(q) ||
      a.NOM_CAT?.toLowerCase().includes(q) ||
      a.COD_ART?.toLowerCase().includes(q)
    );
  }, [articulos, queryFiltro]);

  // ── Solicitar préstamo ────────────────────────────────────────────────────
  const handleSolicitar = useCallback(async (idArticulo) => {
    setToast({ mensaje: 'Funcionalidad de solicitud Próximamente', tipo: 'info' });
  }, []);

  // ── Click en resultado del dropdown → scroll a la tarjeta o filtrar ───────
  const handleResultClick = useCallback((art) => {
    setQueryFiltro(art.NOM_ART.toLowerCase());
  }, []);

  const primerNombre = usuario?.nom_usu?.split(' ')[0] ?? 'Estudiante';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Navbar horizontal (reutiliza el del docente con ajuste de links) */}
      <StudentNavbar />

      <main className={`${styles.content} ${mounted ? styles.contentVisible : ''}`}>
        <div className={styles.inner}>

          {/* ── Banner de error global ────────────────────────────────── */}
          {errorGlobal && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              {errorGlobal}
              <button className={styles.reintentarBtn} onClick={cargarDatos}>
                <RefreshCw size={14} aria-hidden="true" />
                Reintentar
              </button>
            </div>
          )}

          {/* ── Hero: saludo + buscador ───────────────────────────────── */}
          <section className={styles.heroSection} aria-label="Búsqueda de equipos">
            <div className={styles.heroTexto}>
              <h1 className={styles.heroTitulo}>
                Hola, <span className={styles.heroNombre}>{primerNombre}</span> 👋
              </h1>
              <p className={styles.heroSub}>
                Encuentra el equipo que necesitas para tus clases y solicítalo con un clic.
              </p>
            </div>
            <HeroSearch
              articulos={articulos}
              onResultClick={handleResultClick}
              onSearchChange={setQueryFiltro}
            />
          </section>

          {/* ── Alerta de préstamos activos ───────────────────────────── */}
          <section aria-label="Estado de mis préstamos">
            <ActiveLoanAlert
              prestamos={prestamos}
              cargando={cargandoPre}
            />
          </section>

          {/* ── Categorías ────────────────────────────────────────────── */}
          <section aria-label="Categorías de equipos" className={styles.sectionMargin}>
            <div className={styles.catalogoHeader}>
              <h2 className={styles.catalogoTitulo}>
                <Package size={20} aria-hidden="true" />
                Explorar por Categoría
              </h2>
            </div>
            <CategoryGrid
              categorias={categorias}
              cargando={cargandoCat}
              onSeleccionar={(cat) => navigate(`/dashboard/estudiante/catalogo?categoria=${cat.ID_CAT}`)}
            />
          </section>

          {/* ── Catálogo de equipos disponibles ──────────────────────── */}
          <section aria-label="Catálogo de equipos disponibles">
            <div className={styles.catalogoHeader}>
              <h2 className={styles.catalogoTitulo}>
                <Package size={20} aria-hidden="true" />
                {queryFiltro
                  ? `Resultados para "${queryFiltro}"`
                  : 'Equipos Disponibles'
                }
              </h2>
              {!cargandoArt && (
                <span className={styles.countBadge}>
                  {articulosFiltrados.length} equipo{articulosFiltrados.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {cargandoArt ? (
              <div className={styles.grid}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <EquipmentCardSkeleton key={i} />
                ))}
              </div>
            ) : articulosFiltrados.length === 0 ? (
              <div className={styles.emptyGrid}>
                <Package size={48} color="#CBD5E1" aria-hidden="true" />
                <p className={styles.emptyTitulo}>
                  {queryFiltro
                    ? `No se encontraron equipos para "${queryFiltro}"`
                    : 'No hay equipos disponibles en este momento'
                  }
                </p>
                {queryFiltro && (
                  <button
                    className={styles.limpiarFiltroBtn}
                    onClick={() => setQueryFiltro('')}
                  >
                    Ver todo el catálogo
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.grid}>
                {articulosFiltrados.map((art, idx) => (
                  <EquipmentCard
                    key={art.ID_ART}
                    articulo={art}
                    cardIdx={idx}
                    yaSolicitado={solicitados.has(art.ID_ART)}
                    onSolicitar={handleSolicitar}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Sub-rutas: /mis-prestamos, /catalogo, etc. */}
      <Outlet />

      {/* Toast de notificación */}
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// StudentNavbar — Adapta TeacherNavbar con links del rol Estudiante.
// Reutiliza el mismo CSS Module de TeacherNavbar.
// ──────────────────────────────────────────────────────────────────────────────
import { useState as useStateNav, useRef as useRefNav, useEffect as useEffectNav } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth as useAuthNav } from '../../context/AuthContext';
import navStyles from '../../components/TeacherNavbar/TeacherNavbar.module.css';

const STUDENT_NAV = [
  { label: 'Inicio',         to: '/dashboard/estudiante',              exact: true  },
  { label: 'Mis Préstamos',  to: '/dashboard/estudiante/mis-prestamos',exact: false },
  { label: 'Catálogo',       to: '/dashboard/estudiante/catalogo',     exact: false },
];

function StudentNavbar() {
  const { usuario, cerrarSesion } = useAuthNav();
  const nav = useNavigate();
  const [menuMovil,       setMenuMovil]       = useStateNav(false);
  const [dropdownAbierto, setDropdownAbierto] = useStateNav(false);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useStateNav(false);
  const dropdownRef = useRefNav(null);

  useEffectNav(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownAbierto(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { cerrarSesion(); nav('/login', { replace: true }); };
  const inicial = usuario?.nom_usu?.[0]?.toUpperCase() ?? 'E';

  return (
    <header className={navStyles.navbar}>
      <div className={navStyles.inner}>
        <NavLink to="/dashboard/estudiante" className={navStyles.logo} aria-label="Inicio">
          <div className={navStyles.logoIcon}><GraduationCap size={18} color="#3B82F6" /></div>
          <span className={navStyles.logoText}>Inventario Académico</span>
        </NavLink>

        <nav className={navStyles.navDesktop} aria-label="Navegación del estudiante">
          {STUDENT_NAV.map(({ label, to, exact }) => (
            <NavLink
              key={to} to={to} end={exact}
              className={({ isActive }) =>
                `${navStyles.navLink} ${isActive ? navStyles.navLinkActive : ''}`
              }
            >{label}</NavLink>
          ))}
        </nav>

        <div className={navStyles.right}>
          <div className={navStyles.profileWrapper} style={{ position: 'relative' }}>
            <button 
              className={navStyles.bellBtn} 
              aria-label="Notificaciones"
              onClick={() => setNotificacionesAbiertas(v => !v)}
            >
              <Bell size={20} className={navStyles.bellIcon} />
              <span className={navStyles.bellBadge} aria-hidden="true" />
            </button>
            {notificacionesAbiertas && (
              <div 
                className={navStyles.dropdown} 
                style={{ right: 0, minWidth: '250px', padding: '16px', textAlign: 'center' }}
                role="menu"
              >
                <Bell size={24} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#1E293B' }}>Notificaciones</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Próximamente: Historial de alertas y vencimientos.
                </p>
              </div>
            )}
          </div>

          <div className={navStyles.profileWrapper} ref={dropdownRef}>
            <button
              className={navStyles.profileBtn}
              onClick={() => setDropdownAbierto(v => !v)}
              aria-expanded={dropdownAbierto}
              aria-haspopup="menu"
            >
              <div className={navStyles.avatar}>{inicial}</div>
              <span className={navStyles.profileName}>{usuario?.nom_usu}</span>
              <ChevronDown size={14} className={`${navStyles.chevron} ${dropdownAbierto ? navStyles.chevronOpen : ''}`} />
            </button>

            {dropdownAbierto && (
              <div className={navStyles.dropdown} role="menu">
                <div className={navStyles.dropdownHeader}>
                  <p className={navStyles.dropdownName}>{usuario?.nom_usu}</p>
                  <p className={navStyles.dropdownRole}>Estudiante</p>
                  <p className={navStyles.dropdownEmail}>{usuario?.cor_usu}</p>
                </div>
                <hr className={navStyles.divider} />
                <button
                  className={`${navStyles.dropdownItem} ${navStyles.dropdownLogout}`}
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <button
            className={navStyles.menuMovilBtn}
            onClick={() => setMenuMovil(v => !v)}
            aria-label={menuMovil ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuMovil ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuMovil && (
        <nav className={navStyles.navMovil} aria-label="Menú móvil">
          {STUDENT_NAV.map(({ label, to, exact }) => (
            <NavLink
              key={to} to={to} end={exact}
              className={({ isActive }) =>
                `${navStyles.navMovilLink} ${isActive ? navStyles.navMovilLinkActive : ''}`
              }
              onClick={() => setMenuMovil(false)}
            >{label}</NavLink>
          ))}
          <button className={navStyles.navMovilLogout} onClick={handleLogout}>
            <LogOut size={16} /> Cerrar sesión
          </button>
        </nav>
      )}
    </header>
  );
}
