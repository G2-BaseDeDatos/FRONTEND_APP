import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar      from '../../components/Sidebar/Sidebar';
import TopNavbar    from '../../components/TopNavbar/TopNavbar';
import KPICards     from '../../components/KPICards/KPICards';
import PendingRequestsTable from '../../components/PendingRequestsTable/PendingRequestsTable';
import {
  fetchDashboardStats,
  fetchPrestamosPendientes,
  aprobarPrestamo,
  rechazarPrestamo,
} from '../../services/dashboardService';
import styles from './AdminDashboardPage.module.css';
import { ESTADO_COLORES } from '../../constants/theme';

// ──────────────────────────────────────────────────────────────────────────────
// AdminDashboardPage.jsx
//
// Estructura:  <Sidebar> | <main> → <TopNavbar> + <content>
//
// Rutas del menú lateral (declaradas en App.jsx bajo /dashboard/admin/*):
//   /dashboard/admin                  → Este componente (overview)
//   /dashboard/admin/inventario       → Placeholder
//   /dashboard/admin/prestamos        → Placeholder
//   /dashboard/admin/mantenimiento    → Placeholder
//   /dashboard/admin/movimientos      → Placeholder
//   /dashboard/admin/usuarios         → Placeholder
//   /dashboard/admin/categorias       → Placeholder
//   /dashboard/admin/ubicaciones      → Placeholder
//
// Datos cargados al montar:
//   fetchDashboardStats()    → GET /api/articulos  (cuenta por EST_ART)
//   fetchPrestamosPendientes() → GET /api/prestamos?estado=Pendiente (futuro)
// ──────────────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  // ── Estado ────────────────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats,       setStats]       = useState(null);
  const [articulos,   setArticulos]   = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoStats, setCargandoStats] = useState(true);
  const [cargandoSol,   setCargandoSol]   = useState(true);
  const [errorGlobal,   setErrorGlobal]   = useState('');

  // ── Guard: redirige al login si no es Administrador ───────────────────────
  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login', { replace: true });
      return;
    }
    if (usuario?.rol && usuario.rol !== 'Administrador') {
      // Rol incorrecto → redirige al panel correcto
      const rutas = { Docente: '/dashboard/docente', Estudiante: '/dashboard/estudiante' };
      navigate(rutas[usuario.rol] || '/login', { replace: true });
    }
  }, [estaAutenticado, usuario, navigate]);

  // ── Carga inicial de datos (paralela) ─────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setErrorGlobal('');
    setCargandoStats(true);
    setCargandoSol(true);

    // Petición 1: estadísticas + artículos
    fetchDashboardStats()
      .then(({ stats: s, articulos: a }) => {
        setStats(s);
        setArticulos(a);
      })
      .catch((err) => {
        if (err?.status === 401) {
          cerrarSesion();
          navigate('/login', { replace: true });
        } else {
          setErrorGlobal('Error de conexión al cargar estadísticas');
        }
      })
      .finally(() => setCargandoStats(false));

    // Petición 2: solicitudes pendientes (stub hasta que exista el endpoint)
    fetchPrestamosPendientes()
      .then((data) => setSolicitudes(data))
      .catch(() => setSolicitudes([]))
      .finally(() => setCargandoSol(false));
  }, [cerrarSesion, navigate]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // ── Aprobar préstamo ───────────────────────────────────────────────────────
  const handleAprobar = useCallback(async (id) => {
    await aprobarPrestamo(id);
    // UI optimista: eliminar la fila y decrementar "disponibles"
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    setStats((prev) => prev
      ? { ...prev, disponibles: Math.max(0, prev.disponibles - 1), prestados: prev.prestados + 1 }
      : prev
    );
  }, []);

  // ── Rechazar préstamo ──────────────────────────────────────────────────────
  const handleRechazar = useCallback(async (id) => {
    await rechazarPrestamo(id);
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Toggle sidebar ─────────────────────────────────────────────────────────
  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.layout}>

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Overlay para móviles cuando sidebar abierto */}
      {!sidebarCollapsed && (
        <div
          className={styles.mobileOverlay}
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Columna principal */}
      <div className={styles.mainColumn}>

        {/* Navbar superior */}
        <TopNavbar onMenuToggle={toggleSidebar} pageTitle="Dashboard" />

        {/* Contenido */}
        <main className={styles.content} id="main-content">

          {/* Banner de error global */}
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

          {/* ── KPI Cards ──────────────────────────────────────────────── */}
          <section aria-label="Indicadores del inventario">
            <KPICards stats={stats} cargando={cargandoStats} />
          </section>

          {/* ── Tabla de solicitudes pendientes ────────────────────────── */}
          <section className={styles.tableSection}>
            <PendingRequestsTable
              solicitudes={solicitudes}
              cargando={cargandoSol}
              onAprobar={handleAprobar}
              onRechazar={handleRechazar}
            />
          </section>

          {/* ── Resumen rápido de artículos (tabla secundaria) ──────────── */}
          {!cargandoStats && articulos.length > 0 && (
            <section className={styles.tableSection}>
              <ResumenArticulos articulos={articulos} />
            </section>
          )}

        </main>

        {/* Outlet para sub-rutas de módulos (Inventario, Usuarios, etc.) */}
        <Outlet />

      </div>
    </div>
  );
}

// ── Componente secundario: tabla-resumen de artículos ─────────────────────────
// Muestra los primeros 10 artículos del inventario con estado coloreado.
// Útil como vista rápida desde el dashboard antes de navegar al módulo completo.

function ResumenArticulos({ articulos }) {
  const preview = articulos.slice(0, 10);
  return (
    <div className={styles.resumenWrapper}>
      <div className={styles.resumenHeader}>
        <h2 className={styles.resumenTitulo}>Artículos Recientes</h2>
        <span className={styles.resumenMeta}>Mostrando {preview.length} de {articulos.length}</span>
      </div>
      <div className={styles.resumenTableContainer}>
        <table className={styles.resumenTable} aria-label="Resumen de artículos del inventario">
          <thead>
            <tr>
              <th className={styles.rth}>Código</th>
              <th className={styles.rth}>Nombre</th>
              <th className={styles.rth}>Categoría</th>
              <th className={styles.rth}>Ubicación</th>
              <th className={styles.rth}>Estado</th>
              <th className={styles.rth}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((art, idx) => {
              const colores = ESTADO_COLORES[art.EST_ART] || { bg: '#F1F5F9', text: '#475569' };
              return (
                <tr key={art.ID_ART} className={`${styles.rtr} ${idx % 2 === 1 ? styles.rtrAlt : ''}`}>
                  <td className={styles.rtd}>{art.COD_ART}</td>
                  <td className={styles.rtd}>{art.NOM_ART}</td>
                  <td className={styles.rtd}>{art.NOM_CAT}</td>
                  <td className={styles.rtd}>{art.NOM_UBI}</td>
                  <td className={styles.rtd}>
                    <span
                      className={styles.estadoBadge}
                      style={{ background: colores.bg, color: colores.text }}
                    >
                      {art.EST_ART}
                    </span>
                  </td>
                  <td className={styles.rtd}>
                    ${Number(art.VAL_ART || 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
