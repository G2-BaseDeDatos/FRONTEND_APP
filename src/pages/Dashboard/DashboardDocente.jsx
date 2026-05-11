import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth }          from '../../context/AuthContext';
import TeacherNavbar        from '../../components/TeacherNavbar/TeacherNavbar';
import ActiveLoanCard, { ActiveLoanCardSkeleton }
                            from '../../components/ActiveLoanCard/ActiveLoanCard';
import CategoryGrid         from '../../components/CategoryGrid/CategoryGrid';
import { fetchMisPrestamos, fetchCategorias }
                            from '../../services/teacherService';
import ArticleDetailModal   from '../../components/ArticleDetailModal/ArticleDetailModal';
import styles               from './TeacherDashboardPage.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// TeacherDashboardPage.jsx — Panel principal del Docente
//
// Ruta: /dashboard/docente
//
// Datos cargados al montar (paralelas):
//   1. fetchMisPrestamos()
//      → GET /api/prestamos/mis-prestamos
//      → Préstamos asignados al docente autenticado
//      → Sustituye a la anterior llamada de artículos
//
//   2. fetchCategorias()
//      → GET /api/categorias
//      → Lista de categorías para la cuadrícula de exploración
//
// Token JWT (del AuthContext):
//   usuario.id_usu   → ID del docente para el filtro de responsable
//   usuario.nom_usu  → Nombre para el encabezado de bienvenida
//   usuario.rol      → 'Docente' (guard de acceso)
// ──────────────────────────────────────────────────────────────────────────────

export default function TeacherDashboardPage() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Estado ────────────────────────────────────────────────────────────────
  const [articulos,      setArticulos]      = useState([]);
  const [categorias,     setCategorias]     = useState([]);
  const [cargandoArt,    setCargandoArt]    = useState(true);
  const [cargandoCat,    setCargandoCat]    = useState(true);
  const [errorGlobal,    setErrorGlobal]    = useState('');
  const [mounted,        setMounted]        = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen,    setIsModalOpen]    = useState(false);

  // ── Guard de rol ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login', { replace: true });
      return;
    }
    if (usuario?.rol && usuario.rol !== 'Docente') {
      const rutas = { Administrador: '/dashboard/admin', Estudiante: '/dashboard/estudiante' };
      navigate(rutas[usuario.rol] || '/login', { replace: true });
    }
    // Pequeño delay para activar animación de entrada
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [estaAutenticado, usuario, navigate]);

  // ── Carga de datos ────────────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setErrorGlobal('');
    setCargandoArt(true);
    setCargandoCat(true);

    // Petición 1: préstamos activos del docente
    fetchMisPrestamos()
      .then((data) => {
        // Filtrar préstamos no devueltos
        const activos = data.filter(p => p.EST_PRE !== 'Devuelto');
        setArticulos(activos);
      })
      .catch((err) => {
        if (err?.status === 401) { cerrarSesion(); navigate('/login', { replace: true }); }
        else setErrorGlobal('No se pudieron cargar tus préstamos activos');
      })
      .finally(() => setCargandoArt(false));

    // Petición 2: categorías de equipos
    fetchCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
      .finally(() => setCargandoCat(false));
  }, [usuario?.id_usu, cerrarSesion, navigate]);

  useEffect(() => {
    if (estaAutenticado && usuario?.rol === 'Docente') {
      cargarDatos();
    }
  }, [cargarDatos, estaAutenticado, usuario?.rol]);

  // ── Navegar a categoría ───────────────────────────────────────────────────
  const handleSeleccionarCategoria = (cat) => {
    // Ruta del catálogo con filtro por categoría — módulo futuro
    navigate(`/dashboard/docente/catalogo?categoria=${cat.ID_CAT}&nombre=${encodeURIComponent(cat.NOM_CAT)}`);
  };

  // ── Primer nombre del docente (solo primer token) ─────────────────────────
  const primerNombre = usuario?.nom_usu?.split(' ')[0] ?? 'Docente';

  // ── Separar artículos prestados de los disponibles ────────────────────────
  // En este punto articulos contiene los prestamos activos, que tienen estructura:
  // { ID_PRE, FSA_PRE, FPR_PRE, EST_PRE, ID_ART, NOM_ART, COD_ART }
  const articulosAsignados  = articulos;

  // ── Determinar si estamos en la raíz del dashboard ───────────────────────
  const isHome = location.pathname === '/dashboard/docente' || location.pathname === '/dashboard/docente/';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Navbar superior horizontal */}
      <TeacherNavbar />

      {isHome && (
        <main className={`${styles.content} ${mounted ? styles.contentVisible : ''}`}>
          <div className={styles.inner}>

          {/* ── Banner de error ──────────────────────────────────────────── */}
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

          {/* ── Encabezado de bienvenida ─────────────────────────────────── */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.saludo}>
                ¡Hola, <span className={styles.saludoNombre}>{primerNombre}</span> 👋
              </h1>
              <p className={styles.saludoSub}>
                Estos son los equipos que tienes asignados y las categorías disponibles para explorar.
              </p>
            </div>

            {/* Badge de rol */}
            <div className={styles.rolBadge}>
              <BookOpen size={14} aria-hidden="true" />
              Docente
            </div>
          </div>

          {/* ── Sección: Artículos Asignados / Préstamos ─────────────────── */}
          <section aria-label="Equipos asignados">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <BookOpen size={20} aria-hidden="true" />
                Mis Artículos Asignados
              </h2>
              {!cargandoArt && articulosAsignados.length > 0 && (
                <span className={styles.contadorBadge}>{articulosAsignados.length}</span>
              )}
            </div>

            {cargandoArt ? (
              <div className={styles.loansContainer}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <ActiveLoanCardSkeleton key={i} />
                ))}
              </div>
            ) : articulosAsignados.length === 0 ? (
              /* Estado vacío elegante */
              <div className={styles.emptyLoans}>
                <div className={styles.emptyIcon} aria-hidden="true">📦</div>
                <h3 className={styles.emptyTitle}>No tienes equipos asignados actualmente</h3>
                <p className={styles.emptySubtitle}>
                  Cuando se te asigne un artículo, aparecerá aquí con su información completa.
                </p>
                <button
                  className={styles.explorarBtn}
                  onClick={() => {
                    const catSection = document.getElementById('seccion-categorias');
                    catSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Compass size={16} aria-hidden="true" />
                  Explorar categorías
                </button>
              </div>
            ) : (
              <div className={styles.loansContainer}>
                {articulosAsignados.map((art) => (
                  <ActiveLoanCard
                    key={art.ID_PRE + '-' + art.ID_ART}
                    prestamo={{
                      ...art,
                      NOM_CAT: 'Categoría por defecto', // El backend no devuelve NOM_CAT en este endpoint aún
                      NOM_UBI: 'Ubicación asignada',
                      fec_fin_pre: art.FPR_PRE
                    }}
                    onClick={() => {
                      setSelectedArticle({
                        ...art,
                        fec_fin_pre: art.FPR_PRE,
                        fec_ini_pre: art.FSA_PRE
                      });
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Separador visual ─────────────────────────────────────────── */}
          <div className={styles.divider} aria-hidden="true" />

          {/* ── Sección: Categorías de Equipos ───────────────────────────── */}
          <section id="seccion-categorias" aria-label="Catálogo de categorías de equipos">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Compass size={20} aria-hidden="true" />
                Categorías de Equipos
              </h2>
              {!cargandoCat && categorias.length > 0 && (
                <span className={styles.contadorBadge}>{categorias.length}</span>
              )}
            </div>
            <p className={styles.sectionDesc}>
              Explora las categorías disponibles. Al hacer clic en una, verás los equipos disponibles para solicitar.
            </p>
            <CategoryGrid
              categorias={categorias}
              cargando={cargandoCat}
              onSeleccionar={handleSeleccionarCategoria}
            />
          </section>

        </div>
      </main>
      )}

      {/* Sub-rutas: /catalogo, /prestamos, /articulo/:id */}
      <Outlet />

      {/* Modal de Detalle de Artículo */}
      {isModalOpen && selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedArticle(null);
          }}
        />
      )}
    </div>
  );
}
