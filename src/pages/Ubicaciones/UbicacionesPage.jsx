import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import styles from './UbicacionesPage.module.css';
import { 
  fetchUbicaciones, fetchDepartamentos,
  crearUbicacion, actualizarUbicacion, eliminarUbicacion 
} from '../../services/catalogosService';
import Toast from '../../components/Toast/Toast';
import UbicacionFormModal from './UbicacionFormModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

export default function UbicacionesPage() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroDep, setFiltroDep] = useState('');

  // Modales y Toast
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ubicacionEditar, setUbicacionEditar] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, item: null });
  const [toast, setToast] = useState(null);

  const cargar = async () => {
    try {
      setCargando(true);
      const [dataUbi, dataDep] = await Promise.all([
        fetchUbicaciones(),
        fetchDepartamentos()
      ]);
      setUbicaciones(dataUbi);
      setDepartamentos(dataDep);
    } catch (error) {
      console.error('Error al cargar ubicaciones', error);
      setToast({ mensaje: 'Error al cargar ubicaciones', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleOpenModal = (ubi = null) => {
    setUbicacionEditar(ubi);
    setModalAbierto(true);
  };

  const handleSave = async (formData) => {
    if (ubicacionEditar) {
      await actualizarUbicacion(ubicacionEditar.ID_UBI, formData);
      setToast({ mensaje: 'Ubicación actualizada correctamente', tipo: 'success' });
    } else {
      await crearUbicacion(formData);
      setToast({ mensaje: 'Ubicación creada correctamente', tipo: 'success' });
    }
    setModalAbierto(false);
    cargar();
  };

  const handleAbrirConfirm = (item) => {
    setModalConfirm({ isOpen: true, item });
  };

  const handleCerrarConfirm = () => {
    setModalConfirm({ isOpen: false, item: null });
  };

  const handleConfirmarEliminar = async () => {
    try {
      await eliminarUbicacion(modalConfirm.item.ID_UBI);
      setToast({ mensaje: 'Ubicación eliminada', tipo: 'success' });
      handleCerrarConfirm();
      cargar();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar la ubicación';
      setToast({ mensaje: msg, tipo: 'error' });
      handleCerrarConfirm();
    }
  };

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
        <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
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
        <button className={styles.btnAdd} onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nueva Ubicación
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de ubicaciones">
          <thead>
            <tr>
              <th className={styles.th} style={{ width: '100px' }}>ID</th>
              <th className={styles.th}>Nombre de Ubicación</th>
              <th className={styles.th}>Departamento (Facultad)</th>
              <th className={styles.th} style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={4}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : ubicacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={4}>
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
                  <td className={styles.td} style={{ textAlign: 'center' }}>
                    <div className={styles.actionButtons}>
                      <button className={styles.btnAction} title="Editar" onClick={() => handleOpenModal(u)}>
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.btnAction} title="Eliminar" onClick={() => handleAbrirConfirm(u)}>
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <UbicacionFormModal
          ubicacion={ubicacionEditar}
          departamentos={departamentos}
          onClose={() => setModalAbierto(false)}
          onSave={handleSave}
        />
      )}

      {modalConfirm.isOpen && (
        <ConfirmModal
          titulo="Eliminar Ubicación"
          mensaje={`¿Seguro que deseas eliminar la ubicación "${modalConfirm.item?.NOM_UBI}"? Esta acción no se puede deshacer y puede fallar si está en uso.`}
          onConfirm={handleConfirmarEliminar}
          onCancel={handleCerrarConfirm}
        />
      )}

      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={() => setToast(null)}
        />
      )}
    </div>
  );
}
