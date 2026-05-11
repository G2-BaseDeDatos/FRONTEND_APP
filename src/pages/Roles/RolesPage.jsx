import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import styles from './RolesPage.module.css';
import { fetchRoles } from '../../services/usuariosService';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const data = await fetchRoles();
        setRoles(data);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarRoles();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Shield size={28} color="#10B981" />
            Roles del Sistema
          </h1>
          <p className={styles.subtitle}>
            Lista de roles disponibles y sus niveles de acceso en el Inventario Académico.
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de roles">
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Nombre del Rol</th>
              <th className={styles.th}>Descripción General</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={3}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className={styles.emptyState}>
                    <Shield size={48} color="#CBD5E1" />
                    <p>No se encontraron roles</p>
                  </div>
                </td>
              </tr>
            ) : (
              roles.map((r) => (
                <tr key={r.ID_ROL} className={styles.tr}>
                  <td className={styles.td}>#{r.ID_ROL}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badgeRol} ${styles[r.NOM_ROL] || ''}`}>
                      {r.NOM_ROL}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {r.NOM_ROL === 'Administrador' ? 'Acceso total al sistema, gestión de inventario, usuarios y configuraciones.' :
                     r.NOM_ROL === 'Docente' ? 'Acceso a inventario global, gestión de préstamos, mantenimientos y consultas de solo lectura.' :
                     'Acceso básico para consultar el catálogo y el historial de sus propios préstamos.'}
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
