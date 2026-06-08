import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchMisPrestamos } from '../../services/studentService';
import styles from './PrestamosPage.module.css';

// Usaremos los estilos generales de PrestamosPage o unos propios si es necesario.
// Como el usuario no los proveyó, reutilizaré una estructura limpia o el .module.css que asumo que existe.

export default function MisPrestamosEstudiante() {
  const { usuario } = useAuth();
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroTab, setFiltroTab] = useState('Activos'); // Activos | Pendientes | Finalizados

  const cargarPrestamos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await fetchMisPrestamos(usuario?.id_usu);
      setPrestamos(data);
    } catch (err) {
      setError('No se pudo cargar tu historial de préstamos.');
    } finally {
      setCargando(false);
    }
  }, [usuario?.id_usu]);

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  const prestamosFiltrados = useMemo(() => {
    return prestamos.filter(p => {
      if (filtroTab === 'Activos') return p.EST_PRE === 'Activo';
      if (filtroTab === 'Pendientes') return p.EST_PRE === 'Pendiente';
      if (filtroTab === 'Finalizados') return p.EST_PRE === 'Devuelto' || p.EST_PRE === 'Rechazado';
      return true;
    });
  }, [prestamos, filtroTab]);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#1E3A8A', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package /> Mis Préstamos
        </h1>
        <p style={{ color: '#64748B', margin: 0 }}>
          Historial completo de tus solicitudes y equipos asignados.
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px' }}>
        {['Activos', 'Pendientes', 'Finalizados'].map(tab => (
          <button
            key={tab}
            onClick={() => setFiltroTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              fontSize: '15px',
              fontWeight: 500,
              color: filtroTab === tab ? '#2563EB' : '#64748B',
              borderBottom: filtroTab === tab ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Listado */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Cargando préstamos...</div>
      ) : prestamosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#F8FAFC', borderRadius: '12px', color: '#94A3B8' }}>
          <Package size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>No hay préstamos en esta categoría</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Aún no tienes préstamos registrados o que coincidan con este filtro.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {prestamosFiltrados.map(p => (
            <div key={p.ID_PRE || p.ID_ART} style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0F172A' }}>{p.NOM_ART}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Código: {p.COD_ART}</p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Solicitud: {new Date(p.FEC_INI_PRE).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Devolución Est.: {new Date(p.FEC_FIN_PRE).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: p.EST_PRE === 'Aprobado' || p.EST_PRE === 'Prestado' ? '#DBEAFE' : '#F1F5F9',
                  color: p.EST_PRE === 'Aprobado' || p.EST_PRE === 'Prestado' ? '#1D4ED8' : '#475569',
                }}>
                  {p.EST_PRE || 'Desconocido'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
