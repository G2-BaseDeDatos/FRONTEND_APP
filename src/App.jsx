import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login                from './pages/Login/Login';
import AdminDashboardPage   from './pages/Dashboard/DashboardAdmin';
import UsuariosPage         from './pages/Usuarios/UsuariosPage';
import RolesPage            from './pages/Roles/RolesPage';
import InventarioPage       from './pages/Inventario/InventarioPage';
import PrestamosPage        from './pages/Prestamos/PrestamosPage';
import MantenimientoPage    from './pages/Mantenimiento/MantenimientoPage';
import MovimientosPage      from './pages/Movimientos/MovimientosPage';
import CategoriasPage       from './pages/Categorias/CategoriasPage';
import UbicacionesPage      from './pages/Ubicaciones/UbicacionesPage';
import DashboardDocente     from './pages/Dashboard/DashboardDocente';
import DashboardEstudiante  from './pages/Dashboard/DashboardEstudiante';

// ──────────────────────────────────────────────────────────────────────────────
// Placeholder genérico para módulos futuros del panel de administrador.
// Sustituir por los componentes reales conforme se desarrollen.
// ──────────────────────────────────────────────────────────────────────────────
function ModuloPlaceholder({ nombre }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px', gap: '12px', color: '#475569',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: '#DBEAFE', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>🔧</div>
      <h2 style={{ margin: 0, color: '#1E3A8A', fontSize: 20, fontWeight: 700 }}>
        Módulo: {nombre}
      </h2>
      <p style={{ margin: 0, fontSize: 14, color: '#94A3B8', textAlign: 'center', maxWidth: 340 }}>
        Este módulo está en desarrollo. Estará disponible próximamente.
      </p>
    </div>
  );
}

/**
 * Ruta protegida — redirige al login si no hay sesión activa.
 */
function RutaProtegida({ children }) {
  const { estaAutenticado } = useAuth();
  return estaAutenticado ? children : <Navigate to="/login" replace />;
}

/**
 * Ruta pública — redirige al dashboard si ya hay sesión.
 */
function RutaPublica({ children }) {
  const { estaAutenticado, usuario } = useAuth();
  if (!estaAutenticado) return children;
  const rutas = {
    Administrador: '/dashboard/admin',
    Docente:       '/dashboard/docente',
    Estudiante:    '/dashboard/estudiante',
  };
  const destino = (usuario?.rol && rutas[usuario.rol]) || '/dashboard/admin';
  return <Navigate to={destino} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Raíz → Login ──────────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ── Login (público) ───────────────────────────────────────── */}
          <Route
            path="/login"
            element={<RutaPublica><Login /></RutaPublica>}
          />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* PANEL ADMINISTRADOR                                          */}
          {/* Layout: AdminDashboardPage envuelve todas las sub-rutas.    */}
          {/* Las rutas hijas usan <Outlet /> en AdminDashboardPage.       */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Route
            path="/dashboard/admin"
            element={
              <RutaProtegida>
                <AdminDashboardPage />
              </RutaProtegida>
            }
          >
            {/* Sub-rutas de módulos */}
            {/* Ruta: /dashboard/admin/inventario */}
            <Route path="inventario"    element={<InventarioPage />} />
            {/* Ruta: /dashboard/admin/prestamos */}
            <Route path="prestamos"     element={<PrestamosPage />} />
            {/* Ruta: /dashboard/admin/mantenimiento */}
            <Route path="mantenimiento" element={<MantenimientoPage />} />
            {/* Ruta: /dashboard/admin/movimientos */}
            <Route path="movimientos"   element={<MovimientosPage />} />
            {/* Ruta: /dashboard/admin/usuarios */}
            <Route path="usuarios"      element={<UsuariosPage />} />
            {/* Ruta: /dashboard/admin/categorias */}
            <Route path="categorias"    element={<CategoriasPage />} />
            {/* Ruta: /dashboard/admin/ubicaciones */}
            <Route path="ubicaciones"   element={<UbicacionesPage />} />
          </Route>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* PANEL DOCENTE                                                */}
          {/* Layout: TeacherDashboardPage con navbar horizontal.         */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Route
            path="/dashboard/docente"
            element={<RutaProtegida><DashboardDocente /></RutaProtegida>}
          >
            {/* Ruta: /dashboard/docente/prestamos → mis préstamos y globales */}
            <Route path="prestamos"          element={<PrestamosPage />} />
            {/* Ruta: /dashboard/docente/mantenimientos → gestión de reparaciones */}
            <Route path="mantenimientos"     element={<MantenimientoPage />} />
            {/* Ruta: /dashboard/docente/usuarios → vista de solo lectura */}
            <Route path="usuarios"           element={<UsuariosPage />} />
            {/* Ruta: /dashboard/docente/roles → vista de solo lectura */}
            <Route path="roles"              element={<RolesPage />} />
            {/* Ruta: /dashboard/docente/catalogo  → catálogo de equipos */}
            <Route path="catalogo"           element={<ModuloPlaceholder nombre="Catálogo de Equipos" />} />
            {/* Ruta: /dashboard/docente/articulo/:id → detalle de artículo */}
            <Route path="articulo/:id"       element={<ModuloPlaceholder nombre="Detalle del Artículo" />} />
          </Route>
          {/* ──────────────────────────────────────────────────────────── */}
          {/* PANEL ESTUDIANTE                                             */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Route
            path="/dashboard/estudiante"
            element={<RutaProtegida><DashboardEstudiante /></RutaProtegida>}
          >
            <Route path="mis-prestamos" element={<ModuloPlaceholder nombre="Mis Préstamos" />} />
            <Route path="catalogo"      element={<ModuloPlaceholder nombre="Catálogo" />} />
            <Route path="articulo/:id"  element={<ModuloPlaceholder nombre="Detalle del Artículo" />} />
          </Route>

          {/* ── Fallbacks ─────────────────────────────────────────────── */}
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="*"          element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
