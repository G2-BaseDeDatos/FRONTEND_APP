import { useState, useEffect, useMemo } from 'react';
import { Search, Activity } from 'lucide-react';
import styles from './MovimientosPage.module.css';
import { fetchAuditorias } from '../../services/auditoriasService';
import { fetchRoles } from '../../services/usuariosService';

export default function MovimientosPage() {
  const [auditorias, setAuditorias] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataAuditorias, dataRoles] = await Promise.all([
        fetchAuditorias(),
        fetchRoles() // Para el selector de filtros
      ]);
      setAuditorias(dataAuditorias);
      setRoles(dataRoles);
    } catch (error) {
      console.error('Error al cargar auditorías', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrosFiltrados = useMemo(() => {
    return auditorias.filter(a => {
      const matchTexto = 
        a.NOM_USU?.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.COR_USU?.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.ACC_AUD?.toLowerCase().includes(busqueda.toLowerCase());
      const matchRol = filtroRol ? a.NOM_ROL === filtroRol : true;
      return matchTexto && matchRol;
    });
  }, [auditorias, busqueda, filtroRol]);

  const formateaFechaHora = (fechaISO) => {
    if (!fechaISO) return '';
    const date = new Date(fechaISO);
    return date.toLocaleString('es-EC', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Activity size={28} color="#6366F1" />
            Historial de Movimientos y Auditoría
          </h1>
          <p className={styles.subtitle}>
            Revise el registro de las actividades clave realizadas en el sistema.
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por usuario, correo o acción..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select 
          className={styles.filterSelect}
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="">Todos los Roles</option>
          {roles.map(r => (
            <option key={r.ID_ROL} value={r.NOM_ROL}>{r.NOM_ROL}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Historial de auditoría">
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Usuario</th>
              <th className={styles.th}>Rol</th>
              <th className={styles.th}>Acción Realizada</th>
              <th className={styles.th}>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 7 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={5}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : registrosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <Activity size={48} color="#CBD5E1" />
                    <p>No se encontraron registros de auditoría</p>
                  </div>
                </td>
              </tr>
            ) : (
              registrosFiltrados.map((a) => (
                <tr key={a.ID_AUD} className={styles.tr}>
                  <td className={styles.td}>#{a.ID_AUD}</td>
                  <td className={styles.td}>
                    <strong>{a.NOM_USU}</strong>
                    <div className={styles.tdSecundario}>{a.COR_USU}</div>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.badgeRol} ${styles[a.NOM_ROL] || ''}`}>
                      {a.NOM_ROL}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {a.ACC_AUD}
                  </td>
                  <td className={`${styles.td} ${styles.tdSecundario}`}>
                    {formateaFechaHora(a.FEC_AUD)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
