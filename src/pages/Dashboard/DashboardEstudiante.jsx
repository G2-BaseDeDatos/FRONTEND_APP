import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Package, AlertCircle, RefreshCw, PackageX, Calendar, X as XIcon } from 'lucide-react';
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
  // Modal solicitud
  const [modalSolicitud, setModalSolicitud] = useState({ open: false, articulo: null });
  const [fechaRetorno,   setFechaRetorno]   = useState('');
  const [enviando,       setEnviando]       = useState(false);

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

    // Mis préstamos activos (artículos asignados)
    fetchMisPrestamos(usuario?.id_usu)
      .then(data => {
        const activos = data.filter(p => 
          p.EST_PRE !== 'Devuelto' && 
          p.EST_PRE !== 'Rechazado' && 
          p.EST_PRE !== 'Finalizado'
        );
        setPrestamos(activos);
      })
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
    // Buscar el artículo en la lista y abrir el modal
    const art = articulos.find(a => a.ID_ART === idArticulo);
    // Fecha mínima = mañana
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    setFechaRetorno(manana.toISOString().split('T')[0]);
    setModalSolicitud({ open: true, articulo: art });
  }, [articulos]);

  const handleConfirmarSolicitud = async () => {
    if (!modalSolicitud.articulo) return;
    setEnviando(true);
    try {
      await solicitarPrestamo(modalSolicitud.articulo.ID_ART, fechaRetorno);
      setSolicitados(prev => new Set([...prev, modalSolicitud.articulo.ID_ART]));
      setToast({ mensaje: `✓ Solicitud de "${modalSolicitud.articulo.NOM_ART}" registrada correctamente`, tipo: 'success' });
      setModalSolicitud({ open: false, articulo: null });
      // Refrescar lista y préstamos
      fetchArticulosDisponibles().then(setArticulos).catch(() => {});
      fetchMisPrestamos().then(setPrestamos).catch(() => {});
    } catch (err) {
      const msg = err?.message || 'Error al procesar la solicitud';
      setToast({ mensaje: msg, tipo: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  // ── Click en resultado del dropdown → scroll a la tarjeta o filtrar ───────
  const handleResultClick = useCallback((art) => {
    setQueryFiltro(art.NOM_ART.toLowerCase());
  }, []);

  const primerNombre = usuario?.nom_usu?.split(' ')[0] ?? 'Estudiante';
  const location = useLocation();
  const isHome = location.pathname === '/dashboard/estudiante' || location.pathname === '/dashboard/estudiante/';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Navbar horizontal (dinámico) */}
      <TeacherNavbar />

      {isHome && (
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
                Hola, <span className={styles.heroNombre}>{primerNombre}</span>!
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
                <PackageX size={48} color="#a0aec0" aria-hidden="true" />
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
      )}

      {/* Sub-rutas: /mis-prestamos, /catalogo, etc. */}
      <Outlet />

      {/* Modal de Solicitud de Préstamo */}
      {modalSolicitud.open && modalSolicitud.articulo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '32px', 
            width: '90%', maxWidth: '440px', color: '#0F172A', position: 'relative',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setModalSolicitud({ open: false, articulo: null })}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <XIcon size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#EFF6FF', color: '#3B82F6', borderRadius: 10, padding: 10 }}>
                <Package size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Solicitar Préstamo</h2>
                <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>{modalSolicitud.articulo.NOM_ART}</p>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Artículo</p>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{modalSolicitud.articulo.NOM_ART}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                Cód: {modalSolicitud.articulo.COD_ART} &nbsp;·&nbsp; {modalSolicitud.articulo.NOM_CAT}
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748B' }}>
                📍 {modalSolicitud.articulo.NOM_UBI}
              </p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748B', marginBottom: 8 }}>
                <Calendar size={16} />
                Fecha de devolución
              </label>
              <input
                type="date"
                value={fechaRetorno}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                onChange={(e) => setFechaRetorno(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setModalSolicitud({ open: false, articulo: null })}
                disabled={enviando}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#ffffff', color: '#64748B', cursor: 'pointer', fontSize: 14 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarSolicitud}
                disabled={enviando || !fechaRetorno}
                style={{ 
                  flex: 2, padding: '12px', borderRadius: 8, border: 'none', 
                  background: enviando ? '#93C5FD' : '#3b82f6', color: '#fff', 
                  cursor: enviando ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 
                }}
              >
                {enviando ? 'Procesando...' : '✓ Confirmar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}

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


