import { useState, useEffect, useMemo } from 'react';
import { Search, Tags } from 'lucide-react';
import styles from './CategoriasPage.module.css';
import { fetchCategorias } from '../../services/catalogosService';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchCategorias();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar categorías', error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter(c =>
      c.NOM_CAT.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(c.ID_CAT).includes(busqueda)
    );
  }, [categorias, busqueda]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Tags size={28} color="#0EA5E9" />
            Catálogo de Categorías
          </h1>
          <p className={styles.subtitle}>
            Listado de categorías disponibles para la clasificación de inventario. (Solo lectura)
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por ID o nombre de categoría..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de categorías">
          <thead>
            <tr>
              <th className={styles.th} style={{ width: '100px' }}>ID</th>
              <th className={styles.th}>Nombre de Categoría</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={2}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : categoriasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={2}>
                  <div className={styles.emptyState}>
                    <Tags size={48} color="#CBD5E1" />
                    <p>No se encontraron categorías</p>
                  </div>
                </td>
              </tr>
            ) : (
              categoriasFiltradas.map((c) => (
                <tr key={c.ID_CAT} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={styles.idBadge}>#{c.ID_CAT}</span>
                  </td>
                  <td className={styles.td} style={{ fontWeight: 500 }}>
                    {c.NOM_CAT}
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
