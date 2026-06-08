import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  UserPlus,
  Users,
  Settings,
  History,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import TopNavbar from '../../components/TopNavbar/TopNavbar';
import styles from './AdminDashboardPage.module.css';
import { fetchUsuarios } from '../../services/usuariosService';
import { fetchArticulos } from '../../services/articulosService';
import { fetchPrestamos } from '../../services/prestamosService';
import { fetchMantenimientosActivos } from '../../services/mantenimientosService';

// ──────────────────────────────────────────────────────────────────────────────
// Datos de Simulación Estructurados para los Gráficos del Tablero (en Español)
// ──────────────────────────────────────────────────────────────────────────────

const nivelData = [
  { name: 'Lun', Volumen: 420, Servicio: 280 },
  { name: 'Mar', Volumen: 350, Servicio: 190 },
  { name: 'Mié', Volumen: 510, Servicio: 410 },
  { name: 'Jue', Volumen: 380, Servicio: 320 },
  { name: 'Vie', Volumen: 620, Servicio: 490 },
  { name: 'Sáb', Volumen: 450, Servicio: 380 },
  { name: 'Dom', Volumen: 390, Servicio: 300 },
];

const topProducts = [
  { id: 1, name: 'Proyector Epson', popularity: 80, sales: '3', color: '#06b6d4' },
  { id: 2, name: 'Laptop Dell', popularity: 65, sales: '2', color: '#8b5cf6' },
  { id: 3, name: 'Multímetro Digital', popularity: 50, sales: '5', color: '#f97316' },
];

const satisfaccionData = [
  { name: 'Semana 1', 'Mes Pasado': 12, 'Este Mes': 15 },
  { name: 'Semana 2', 'Mes Pasado': 18, 'Este Mes': 22 },
  { name: 'Semana 3', 'Mes Pasado': 14, 'Este Mes': 28 },
  { name: 'Semana 4', 'Mes Pasado': 21, 'Este Mes': 31 },
];

const gaugeData = [
  { name: 'Completado', value: 80, fill: '#34d399' },
  { name: 'Restante', value: 20, fill: '#2d2d3d' },
];

const visitantesData = [
  { name: 'Ene', 'Nuevos Visitantes': 340 },
  { name: 'Feb', 'Nuevos Visitantes': 450 },
  { name: 'Mar', 'Nuevos Visitantes': 380 },
  { name: 'Abr', 'Nuevos Visitantes': 520 },
];

// Tooltip Personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1f2029',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#a0aec0', fontWeight: 500 }}>{label}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: '4px 0 0 0', fontSize: '13px', color: p.color || p.fill, fontWeight: 600 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('es-EC') : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    usuarios: 0,
    articulos: 0,
    prestamos: 0,
    mantenimientos: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const cargarStats = async () => {
      try {
        const [resUsuarios, resArticulos, resPrestamos, resMantenimientos] = await Promise.all([
          fetchUsuarios(),
          fetchArticulos(),
          fetchPrestamos(),
          fetchMantenimientosActivos(),
        ]);
        setStats({
          usuarios: resUsuarios.length,
          articulos: resArticulos.length,
          prestamos: resPrestamos.length,
          mantenimientos: resMantenimientos.length,
        });
      } catch (error) {
        console.error('Error al cargar stats del dashboard:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (estaAutenticado && usuario?.rol === 'Administrador') {
      cargarStats();
    }
  }, [estaAutenticado, usuario]);

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login', { replace: true });
      return;
    }
    if (usuario?.rol && usuario.rol !== 'Administrador') {
      const rutas = { Docente: '/dashboard/docente', Estudiante: '/dashboard/estudiante' };
      navigate(rutas[usuario.rol] || '/login', { replace: true });
    }
  }, [estaAutenticado, usuario, navigate]);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  // Computamos el item activo basado en la URL
  let activeItem = 'admin';
  if (location.pathname.includes('/usuarios')) activeItem = 'usuarios';
  if (location.pathname.includes('/inventario')) activeItem = 'inventario';
  if (location.pathname.includes('/prestamos')) activeItem = 'prestamos';
  if (location.pathname.includes('/mantenimiento')) activeItem = 'mantenimiento';
  if (location.pathname.includes('/movimientos')) activeItem = 'movimientos';
  if (location.pathname.includes('/categorias')) activeItem = 'categorias';
  if (location.pathname.includes('/ubicaciones')) activeItem = 'ubicaciones';

  // Solo renderiza los gráficos si estamos exactamente en la ruta raíz del admin
  const isDashboardRoot = location.pathname === '/dashboard/admin' || location.pathname === '/dashboard/admin/';

  const renderDashboardRoot = () => {
    return (
          <div className={styles.grid}>
            {/* TARJETA 1: Usuarios */}
            <section className={`${styles.card} ${styles.span12}`} aria-label="Resumen de Usuarios">
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className={styles.statBox}>
                  <div className={styles.statIconWrapper} style={{ background: 'rgba(52,211,153,0.1)' }}>
                    <Users size={24} color="#34d399" />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Total Usuarios</p>
                    <h3 className={styles.statValue}>{loadingStats ? '...' : stats.usuarios}</h3>
                    <div className={styles.statGrowth} style={{ color: '#34d399' }}>
                      <ArrowUpRight size={14} />
                      <span>Activos</span>
                    </div>
                  </div>
                </div>

                <div className={styles.statBox}>
                  <div className={styles.statIconWrapper} style={{ background: 'rgba(139,92,246,0.1)' }}>
                    <Package size={24} color="#8b5cf6" />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Total Artículos</p>
                    <h3 className={styles.statValue}>{loadingStats ? '...' : stats.articulos}</h3>
                    <div className={styles.statGrowth} style={{ color: '#8b5cf6' }}>
                      <ArrowUpRight size={14} />
                      <span>En Inventario</span>
                    </div>
                  </div>
                </div>

                <div className={styles.statBox}>
                  <div className={styles.statIconWrapper} style={{ background: 'rgba(249,115,22,0.1)' }}>
                    <History size={24} color="#f97316" />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Préstamos Globales</p>
                    <h3 className={styles.statValue}>{loadingStats ? '...' : stats.prestamos}</h3>
                    <div className={styles.statGrowth} style={{ color: '#f97316' }}>
                      <Activity size={14} />
                      <span>Registrados</span>
                    </div>
                  </div>
                </div>

                <div className={styles.statBox}>
                  <div className={styles.statIconWrapper} style={{ background: 'rgba(6,182,212,0.1)' }}>
                    <Settings size={24} color="#06b6d4" />
                  </div>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Mantenimientos</p>
                    <h3 className={styles.statValue}>{loadingStats ? '...' : stats.mantenimientos}</h3>
                    <div className={styles.statGrowth} style={{ color: '#06b6d4' }}>
                      <Activity size={14} />
                      <span>Activos</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TARJETA 2: Nivel */}
            <section className={`${styles.card} ${styles.span6}`} aria-label="Nivel de Volumen y Servicio">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Nivel</h2>
                <p className={styles.cardSubtitle}>Rendimiento semanal</p>
              </div>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nivelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a0aec0' }} />
                    <Bar dataKey="Volumen" fill="#f97316" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="Servicio" fill="#34d399" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* TARJETA 3: Productos Principales */}
            <section className={`${styles.card} ${styles.span6}`} aria-label="Lista de Productos Principales">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Productos Principales</h2>
                <p className={styles.cardSubtitle}>Productos más vendidos y su popularidad</p>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Popularidad</th>
                      <th>Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
                      <tr key={p.id}>
                        <td style={{ color: '#a0aec0', fontWeight: 'bold' }}>{p.id}</td>
                        <td style={{ fontWeight: '500' }}>{p.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className={styles.progressBarContainer}>
                              <div
                                className={styles.progressBar}
                                style={{ width: `${p.popularity}%`, backgroundColor: p.color }}
                              />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: p.color }}>
                              {p.popularity}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: '600', color: p.color }}>{p.sales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* TARJETA 4: Satisfacción del Cliente */}
            <section className={`${styles.card} ${styles.span6}`} aria-label="Satisfacción del Cliente">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Satisfacción del Cliente</h2>
                <p className={styles.cardSubtitle}>Comparación de ingresos por mes</p>
              </div>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={satisfaccionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMesPasado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEsteMes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a0aec0' }} />
                    <Area type="monotone" dataKey="Mes Pasado" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMesPasado)" />
                    <Area type="monotone" dataKey="Este Mes" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEsteMes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#a0aec0' }}>Mes Pasado</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>$4,087</p>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#a0aec0' }}>Este Mes</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '700', color: '#06b6d4' }}>$5,506</p>
                </div>
              </div>
            </section>

            {/* TARJETA 5: Ingresos */}
            <section className={`${styles.card} ${styles.span6}`} aria-label="Resumen de Ingresos">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Ingresos</h2>
                <p className={styles.cardSubtitle}>Gastos Totales</p>
              </div>
              <div className={styles.earningsContainer}>
                <div className={styles.earningsInfo}>
                  <h3 className={styles.earningsValue}>$6,078.76</h3>
                  <p className={styles.earningsText}>
                    El beneficio es <span style={{ color: '#34d399', fontWeight: 'bold' }}>48% mayor</span> que el mes pasado
                  </p>
                </div>
                <div className={styles.gaugeWrapper}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gaugeData}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="75%"
                        outerRadius="100%"
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {gaugeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.gaugeCenterText}>80%</div>
                </div>
              </div>
            </section>

            {/* TARJETA 6: Estadísticas de Visitantes */}
            <section className={`${styles.card} ${styles.span12}`} aria-label="Estadísticas de Visitantes">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Estadísticas de Visitantes</h2>
                <p className={styles.cardSubtitle}>Nuevos Visitantes mensuales</p>
              </div>
              <div className={styles.chartWrapper} style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitantesData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a0aec0' }} />
                    <Line
                      type="monotone"
                      dataKey="Nuevos Visitantes"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
    );
  };

  // ── Render General del Dashboard layout ────────────────────────────────────
  return (
    <div className={styles.layout}>
      {/* Barra Lateral Izquierda (Sidebar) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        activeItem={activeItem}
        onSelect={() => {}} // Ya no se usa para navegar, Sidebar.jsx llama a navigate()
      />

      {/* Overlay para móviles cuando sidebar abierto */}
      {!sidebarCollapsed && (
        <div
          className={styles.mobileOverlay}
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Columna de Contenido Principal */}
      <div className={styles.mainColumn}>
        <TopNavbar onMenuToggle={toggleSidebar} />
        {/* Contenido Principal */}
        <main className={styles.content} id="main-content">
          {isDashboardRoot ? renderDashboardRoot() : <Outlet />}
        </main>
      </div>
    </div>
  );
}