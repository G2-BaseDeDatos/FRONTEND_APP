import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  UserPlus,
  ArrowUpRight,
  User,
  Mail,
  Settings,
  Heart,
  History,
  CheckCircle2,
  Trash2,
  Lock,
  Eye,
  Star,
  Bell,
  Search,
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
  { id: 1, name: 'Decoración del Hogar', popularity: 80, sales: '$2,400', color: '#06b6d4' },
  { id: 2, name: 'Vestido de Princesa', popularity: 65, sales: '$1,800', color: '#8b5cf6' },
  { id: 3, name: 'Esenciales de Baño', popularity: 50, sales: '$1,200', color: '#f97316' },
  { id: 4, name: 'Reloj Inteligente', popularity: 90, sales: '$3,100', color: '#34d399' },
];

const satisfaccionData = [
  { name: 'Semana 1', 'Mes Pasado': 1200, 'Este Mes': 1500 },
  { name: 'Semana 2', 'Mes Pasado': 1800, 'Este Mes': 2200 },
  { name: 'Semana 3', 'Mes Pasado': 1400, 'Este Mes': 2800 },
  { name: 'Semana 4', 'Mes Pasado': 2100, 'Este Mes': 3100 },
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
  { name: 'May', 'Nuevos Visitantes': 610 },
  { name: 'Jun', 'Nuevos Visitantes': 570 },
  { name: 'Jul', 'Nuevos Visitantes': 690 },
  { name: 'Ago', 'Nuevos Visitantes': 730 },
  { name: 'Sep', 'Nuevos Visitantes': 810 },
  { name: 'Oct', 'Nuevos Visitantes': 780 },
  { name: 'Nov', 'Nuevos Visitantes': 920 },
  { name: 'Dic', 'Nuevos Visitantes': 1050 },
];

// Tooltip Personalizado para mantener el estilo elegante en modo oscuro
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

  // ── Estado de Configuración del Layout ────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('clasificacion'); // 'clasificacion' es el tablero principal
  const [searchText, setSearchText] = useState('');

  // ── Guard de Redirección si no está Autenticado ───────────────────────────
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

  // ── Renderizado del Contenido Según el Tab Seleccionado ────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'clasificacion':
        return (
          <div className={styles.grid}>
            {/* TARJETA 1: Ventas de Hoy */}
            <section className={`${styles.card} ${styles.span12}`} aria-label="Resumen de Ventas de Hoy">
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Ventas de Hoy</h2>
                <p className={styles.cardSubtitle}>Resumen de ventas</p>
              </div>
              <div className={styles.miniCardsGrid}>
                {/* Ventas Totales */}
                <div className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <div className={styles.miniCardIconWrapper} style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                      <DollarSign size={20} color="#06b6d4" />
                    </div>
                    <span className={`${styles.miniCardTrend} ${styles.trendUp}`}>
                      +10% <ArrowUpRight size={12} />
                    </span>
                  </div>
                  <h3 className={styles.miniCardValue}>$5k</h3>
                  <span className={styles.miniCardLabel}>Ventas Totales</span>
                  <span className={styles.cardSubtitle} style={{ fontSize: '11px' }}>desde ayer</span>
                </div>

                {/* Pedidos Totales */}
                <div className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <div className={styles.miniCardIconWrapper} style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                      <ShoppingBag size={20} color="#f97316" />
                    </div>
                    <span className={`${styles.miniCardTrend} ${styles.trendUp}`}>
                      +8% <ArrowUpRight size={12} />
                    </span>
                  </div>
                  <h3 className={styles.miniCardValue}>500</h3>
                  <span className={styles.miniCardLabel}>Pedidos Totales</span>
                  <span className={styles.cardSubtitle} style={{ fontSize: '11px' }}>desde ayer</span>
                </div>

                {/* Productos Vendidos */}
                <div className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <div className={styles.miniCardIconWrapper} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                      <Package size={20} color="#8b5cf6" />
                    </div>
                    <span className={`${styles.miniCardTrend} ${styles.trendUp}`}>
                      +2% <ArrowUpRight size={12} />
                    </span>
                  </div>
                  <h3 className={styles.miniCardValue}>9</h3>
                  <span className={styles.miniCardLabel}>Productos Vendidos</span>
                  <span className={styles.cardSubtitle} style={{ fontSize: '11px' }}>desde ayer</span>
                </div>

                {/* Nuevos Clientes */}
                <div className={styles.miniCard}>
                  <div className={styles.miniCardHeader}>
                    <div className={styles.miniCardIconWrapper} style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>
                      <UserPlus size={20} color="#34d399" />
                    </div>
                    <span className={`${styles.miniCardTrend} ${styles.trendUp}`}>
                      +3% <ArrowUpRight size={12} />
                    </span>
                  </div>
                  <h3 className={styles.miniCardValue}>12</h3>
                  <span className={styles.miniCardLabel}>Nuevos Clientes</span>
                  <span className={styles.cardSubtitle} style={{ fontSize: '11px' }}>desde ayer</span>
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

      case 'perfil':
        return (
          <div className={styles.profileGrid}>
            <div className={styles.profileCardLeft}>
              <div className={styles.profileAvatarLarge}>
                {usuario?.nom_usu?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div>
                <h2 className={styles.profileNameLarge}>{usuario?.nom_usu ?? 'Administrador'}</h2>
                <p style={{ color: '#a0aec0', fontSize: '14px', margin: '4px 0 12px 0' }}>{usuario?.cor_usu}</p>
                <span className={styles.profileRoleBadge}>Administrador de Sistemas</span>
              </div>
              <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', fontSize: '13px' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#ffffff' }}>45</p>
                  <p style={{ margin: '2px 0 0 0', color: '#a0aec0' }}>Artículos</p>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#ffffff' }}>12</p>
                  <p style={{ margin: '2px 0 0 0', color: '#a0aec0' }}>Préstamos</p>
                </div>
              </div>
            </div>
            <div className={styles.profileCardRight}>
              <h2 className={styles.cardTitle} style={{ marginBottom: '20px' }}>Detalles del Perfil</h2>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre Completo</label>
                <input type="text" className={styles.formInput} defaultValue={usuario?.nom_usu} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Dirección de Correo Electrónico</label>
                <input type="email" className={styles.formInput} defaultValue={usuario?.cor_usu} disabled />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Rol de Usuario</label>
                <input type="text" className={styles.formInput} defaultValue="Administrador" disabled />
              </div>
              <button className={styles.saveBtn} onClick={() => alert('¡Información de perfil actualizada con éxito!')}>
                Guardar Cambios
              </button>
            </div>
          </div>
        );

      case 'pedidos':
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Pedidos Pendientes y Recientes</h2>
              <p className={styles.cardSubtitle}>Lista de solicitudes y pedidos de suministros</p>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Solicitante</th>
                    <th>Destino</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PED-2039</td>
                    <td>Juan Pérez</td>
                    <td>Laboratorio de Mecánica</td>
                    <td><span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Entregado</span></td>
                    <td>20/05/2026</td>
                    <td>$120.00</td>
                  </tr>
                  <tr>
                    <td>PED-2040</td>
                    <td>María Gómez</td>
                    <td>Aula 304 - Sistemas</td>
                    <td><span style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Pendiente</span></td>
                    <td>21/05/2026</td>
                    <td>$45.50</td>
                  </tr>
                  <tr>
                    <td>PED-2041</td>
                    <td>Carlos Ruiz</td>
                    <td>Oficina de Investigaciones</td>
                    <td><span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Entregado</span></td>
                    <td>19/05/2026</td>
                    <td>$310.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'productos':
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Gestión de Productos</h2>
              <p className={styles.cardSubtitle}>Control de inventario académico y equipos</p>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ART-001</td>
                    <td>Proyector Epson PowerLite</td>
                    <td>Multimedia</td>
                    <td>12 unidades</td>
                    <td><span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Excelente</span></td>
                  </tr>
                  <tr>
                    <td>ART-002</td>
                    <td>Osciloscopio Digital Tektronix</td>
                    <td>Electrónica</td>
                    <td>5 unidades</td>
                    <td><span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Excelente</span></td>
                  </tr>
                  <tr>
                    <td>ART-003</td>
                    <td>Impresora 3D Creality Ender</td>
                    <td>Laboratorio</td>
                    <td>3 unidades</td>
                    <td><span style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Mantenimiento</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'reporte_ventas':
        return (
          <div className={styles.grid}>
            <div className={`${styles.card} ${styles.span12}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Reporte Analítico de Ventas</h2>
                <p className={styles.cardSubtitle}>Tendencia y evolución comercial anual</p>
              </div>
              <div className={styles.chartWrapper} style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitantesData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a0aec0" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Nuevos Visitantes" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" name="Ventas" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'mensajes':
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Mensajes y Alertas</h2>
              <p className={styles.cardSubtitle}>Notificaciones internas de profesores y estudiantes</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>JP</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>Julio Pérez (Docente)</h4>
                    <span style={{ fontSize: '11px', color: '#a0aec0' }}>Hace 10 min</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#a0aec0', lineHeight: '1.4' }}>Solicito la aprobación del préstamo para la clase de Microcontroladores del día de mañana en el laboratorio.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>AM</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>Ana Martínez (Estudiante)</h4>
                    <span style={{ fontSize: '11px', color: '#a0aec0' }}>Hace 2 horas</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#a0aec0', lineHeight: '1.4' }}>Ya he devuelto el multímetro digital, por favor verificar el estado en el sistema para quitar la alerta.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'configuracion':
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Configuración General</h2>
              <p className={styles.cardSubtitle}>Opciones de cuenta y parámetros generales del sistema</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>Habilitar Modo Oscuro</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>Optimiza el uso de la pantalla en bajas condiciones de luz.</p>
                </div>
                <div style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: '#34d399', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#13131a', position: 'absolute', right: '2px', top: '2px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#ffffff' }}>Notificaciones por Correo</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a0aec0' }}>Recibe alertas automáticas de préstamos vencidos.</p>
                </div>
                <div style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: '#34d399', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#13131a', position: 'absolute', right: '2px', top: '2px' }} />
                </div>
              </div>
              <button className={styles.saveBtn} style={{ width: 'fit-content' }}>Guardar Preferencias</button>
            </div>
          </div>
        );

      case 'favoritos':
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Favoritos</h2>
              <p className={styles.cardSubtitle}>Equipos y reportes destacados</p>
            </div>
            <div className={styles.placeholderContainer}>
              <div className={styles.placeholderIcon}>
                <Heart size={32} />
              </div>
              <h3 className={styles.placeholderTitle}>Aún no hay favoritos</h3>
              <p className={styles.placeholderDesc}>
                Puedes marcar artículos o estadísticas importantes como favoritos para verlos de manera rápida aquí.
              </p>
            </div>
          </div>
        );

      case 'historial':
        return (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Historial de Actividades</h2>
              <p className={styles.cardSubtitle}>Auditoría de eventos recientes del sistema</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                <span style={{ color: '#a0aec0', width: '90px' }}>Hoy, 10:45 AM</span>
                <span style={{ color: '#ffffff', fontWeight: '500' }}>Sesión de Administrador iniciada</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                <span style={{ color: '#a0aec0', width: '90px' }}>Ayer, 04:30 PM</span>
                <span style={{ color: '#ffffff', fontWeight: '500' }}>Préstamo PED-2039 entregado por Julio Pérez</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                <span style={{ color: '#a0aec0', width: '90px' }}>20 May, 11:15 AM</span>
                <span style={{ color: '#ffffff', fontWeight: '500' }}>Nuevo equipo "Impresora 3D" añadido al inventario</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Render General del Dashboard layout ────────────────────────────────────
  return (
    <div className={styles.layout}>
      {/* Barra Lateral Izquierda (Sidebar) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        activeItem={activeTab}
        onSelect={setActiveTab}
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
        {/* Cabecera (Top Bar) */}
        <TopNavbar onMenuToggle={toggleSidebar} pageTitle="Dashboard" />

        {/* Contenido Principal */}
        <main className={styles.content} id="main-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}