import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import styles from './UbicacionesPage.module.css';
import { fetchUbicaciones, fetchDepartamentos } from '../../services/catalogosService';

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroDep, setFiltroDep] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dataUbi, dataDep] = await Promise.all([
          fetchUbicaciones(),
          fetchDepartamentos()
        ]);
        setUbicaciones(dataUbi);
        setDepartamentos(dataDep);
      } catch (error) {
        console.error('Error al cargar ubicaciones', error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const ubicacionesFiltradas = useMemo(() => {
    return ubicaciones.filter(u => {
      const matchTexto = 
        u.NOM_UBI.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.NOM_DEP?.toLowerCase().includes(busqueda.toLowerCase());
      const matchDep = filtroDep ? String(u.ID_DEP) === filtroDep : true;
      return matchTexto && matchDep;
    });
  }, [ubicaciones, busqueda, filtroDep]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <MapPin size={28} color="#0EA5E9" />
            Catálogo de Ubicaciones
          </h1>
          <p className={styles.subtitle}>
            Directorio de áreas, laboratorios y sus departamentos asociados. (Solo lectura)
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre de ubicación..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select 
          className={styles.filterSelect}
          value={filtroDep}
          onChange={(e) => setFiltroDep(e.target.value)}
        >
          <option value="">Todos los Departamentos</option>
          {departamentos.map(d => (
            <option key={d.ID_DEP} value={d.ID_DEP}>{d.NOM_DEP}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de ubicaciones">
          <thead>
            <tr>
              <th className={styles.th} style={{ width: '100px' }}>ID</th>
              <th className={styles.th}>Nombre de Ubicación</th>
              <th className={styles.th}>Departamento (Facultad)</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={3}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : ubicacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className={styles.emptyState}>
                    <MapPin size={48} color="#CBD5E1" />
                    <p>No se encontraron ubicaciones</p>
                  </div>
                </td>
              </tr>
            ) : (
              ubicacionesFiltradas.map((u) => (
                <tr key={u.ID_UBI} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.idBadge}>#{u.ID_UBI}</span>
                  </td>
                  <td className={styles.td} style={{ fontWeight: 500 }}>
                    {u.NOM_UBI}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.depBadge}>{u.NOM_DEP || 'Sin asignar'}</span>
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
