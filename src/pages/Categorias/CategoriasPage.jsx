import { useState, useEffect, useMemo } from 'react';
import { Search, Tags, Plus, Edit2, Trash2 } from 'lucide-react';
import styles from './CategoriasPage.module.css';
import { fetchCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../../services/catalogosService';
import Toast from '../../components/Toast/Toast';
import CategoriaFormModal from './CategoriaFormModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Modales y Toast
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, item: null });
  const [toast, setToast] = useState(null);

  const cargar = async () => {
    try {
      setCargando(true);
      const data = await fetchCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías', error);
      setToast({ mensaje: 'Error al cargar categorías', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleOpenModal = (cat = null) => {
    setCategoriaEditar(cat);
    setModalAbierto(true);
  };

  const handleSave = async (formData) => {
    if (categoriaEditar) {
      await actualizarCategoria(categoriaEditar.ID_CAT, formData);
      setToast({ mensaje: 'Categoría actualizada correctamente', tipo: 'success' });
    } else {
      await crearCategoria(formData);
      setToast({ mensaje: 'Categoría creada correctamente', tipo: 'success' });
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
      await eliminarCategoria(modalConfirm.item.ID_CAT);
      setToast({ mensaje: 'Categoría eliminada', tipo: 'success' });
      handleCerrarConfirm();
      cargar();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar la categoría';
      setToast({ mensaje: msg, tipo: 'error' });
      handleCerrarConfirm();
    }
  };

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
        <button className={styles.btnAdd} onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de categorías">
          <thead>
            <tr>
              <th className={styles.th} style={{ width: '100px' }}>ID</th>
              <th className={styles.th}>Nombre de Categoría</th>
              <th className={styles.th} style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={3}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : categoriasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={3}>
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
                  <td className={styles.td} style={{ textAlign: 'center' }}>
                    <div className={styles.actionButtons}>
                      <button className={styles.btnAction} title="Editar" onClick={() => handleOpenModal(c)}>
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.btnAction} title="Eliminar" onClick={() => handleAbrirConfirm(c)}>
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
        <CategoriaFormModal
          categoria={categoriaEditar}
          onClose={() => setModalAbierto(false)}
          onSave={handleSave}
        />
      )}

      {modalConfirm.isOpen && (
        <ConfirmModal
          titulo="Eliminar Categoría"
          mensaje={`¿Seguro que deseas eliminar la categoría "${modalConfirm.item?.NOM_CAT}"? Esta acción no se puede deshacer y puede fallar si está en uso.`}
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
