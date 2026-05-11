import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import styles from './InventarioPage.module.css';
import { 
  fetchArticulos, 
  fetchCategorias, 
  fetchUbicaciones, 
  crearArticulo, 
  actualizarArticulo, 
  eliminarArticulo, 
  subirImagenArticulo 
} from '../../services/articulosService';
import ArticuloFormModal from './ArticuloFormModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { ESTADO_COLORES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export default function InventarioPage() {
  const { usuario } = useAuth();
  
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Filtros Locales
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Modales
  const [modalForm, setModalForm] = useState({ isOpen: false, articulo: null });
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, articulo: null });
  
  // Toast
  const [toast, setToast] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataArticulos, dataCats, dataUbis] = await Promise.all([
        fetchArticulos(), // Trae todos
        fetchCategorias(),
        fetchUbicaciones()
      ]);
      setArticulos(dataArticulos);
      setCategorias(dataCats);
      setUbicaciones(dataUbis);
    } catch (error) {
      mostrarToast('Error al cargar datos del servidor', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // Filtrado local en memoria
  const articulosFiltrados = useMemo(() => {
    return articulos.filter(a => {
      const matchTexto = 
        a.NOM_ART?.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.COD_ART?.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchCat = filtroCategoria ? String(a.ID_CAT) === String(filtroCategoria) : true;
      const matchUbi = filtroUbicacion ? String(a.ID_UBI) === String(filtroUbicacion) : true;
      const matchEst = filtroEstado ? a.EST_ART === filtroEstado : true;

      return matchTexto && matchCat && matchUbi && matchEst;
    });
  }, [articulos, busqueda, filtroCategoria, filtroUbicacion, filtroEstado]);

  // Manejadores Formulario
  const handleAbrirForm = (articulo = null) => {
    setModalForm({ isOpen: true, articulo });
  };

  const handleCerrarForm = () => {
    setModalForm({ isOpen: false, articulo: null });
  };

  const handleGuardarForm = async (formData, archivoImagen) => {
    try {
      let idArticuloGenerado = null;

      if (modalForm.articulo) {
        // Actualizar
        idArticuloGenerado = modalForm.articulo.ID_ART;
        await actualizarArticulo(idArticuloGenerado, formData);
        mostrarToast('Artículo actualizado exitosamente');
      } else {
        // Crear
        const response = await crearArticulo(formData);
        idArticuloGenerado = response.data?.newId || response.newId; 
        // El backend retorna un field ID dependiendo de la estructura
        if(!idArticuloGenerado && response.data && typeof response.data === 'object' && response.data.ID_ART){
          idArticuloGenerado = response.data.ID_ART;
        }
        mostrarToast('Artículo creado exitosamente');
      }

      // Si hay imagen y tenemos el ID, la subimos
      if (archivoImagen && idArticuloGenerado) {
        try {
          await subirImagenArticulo(idArticuloGenerado, archivoImagen);
          mostrarToast('Imagen subida correctamente');
        } catch (imgErr) {
          mostrarToast('Artículo guardado, pero hubo un error al subir la imagen.', 'error');
        }
      }

      handleCerrarForm();
      cargarDatos(); // Refrescar
    } catch (error) {
      throw error; 
    }
  };

  // Manejadores Eliminación (Baja)
  const handleAbrirConfirm = (articulo) => {
    setModalConfirm({ isOpen: true, articulo });
  };

  const handleCerrarConfirm = () => {
    setModalConfirm({ isOpen: false, articulo: null });
  };

  const handleConfirmarEliminar = async () => {
    try {
      await eliminarArticulo(modalConfirm.articulo.ID_ART);
      mostrarToast('Artículo dado de baja exitosamente');
      handleCerrarConfirm();
      cargarDatos();
    } catch (error) {
      mostrarToast(error.response?.data?.message || 'Error al dar de baja', 'error');
      handleCerrarConfirm();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Package size={28} color="#3B82F6" />
            Inventario de Artículos
          </h1>
          <p className={styles.subtitle}>
            Gestione los equipos y bienes disponibles en la institución.
          </p>
        </div>
        <button className={styles.btnNuevo} onClick={() => handleAbrirForm()}>
          <Plus size={18} />
          Nuevo Artículo
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <select 
          className={styles.filterSelect}
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas las Categorías</option>
          {categorias.map(c => (
            <option key={c.ID_CAT} value={c.ID_CAT}>{c.NOM_CAT}</option>
          ))}
        </select>

        <select 
          className={styles.filterSelect}
          value={filtroUbicacion}
          onChange={(e) => setFiltroUbicacion(e.target.value)}
        >
          <option value="">Todas las Ubicaciones</option>
          {ubicaciones.map(u => (
            <option key={u.ID_UBI} value={u.ID_UBI}>{u.NOM_UBI}</option>
          ))}
        </select>

        <select 
          className={styles.filterSelect}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los Estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Prestado">Prestado</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de inventario">
          <thead>
            <tr>
              <th className={styles.th}>Img</th>
              <th className={styles.th}>Código</th>
              <th className={styles.th}>Nombre</th>
              <th className={styles.th}>Categoría</th>
              <th className={styles.th}>Ubicación</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Valor</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={8}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : articulosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <Package size={48} color="#CBD5E1" />
                    <p>No se encontraron artículos</p>
                  </div>
                </td>
              </tr>
            ) : (
              articulosFiltrados.map((a) => {
                const colores = ESTADO_COLORES[a.EST_ART] || { bg: '#F1F5F9', text: '#475569' };
                return (
                  <tr key={a.ID_ART} className={styles.tr}>
                    <td className={styles.td}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={18} color="#94A3B8" />
                      </div>
                    </td>
                    <td className={styles.td}>{a.COD_ART}</td>
                    <td className={styles.td}>{a.NOM_ART}</td>
                    <td className={`${styles.td} ${styles.tdSecundario}`}>{a.NOM_CAT}</td>
                    <td className={`${styles.td} ${styles.tdSecundario}`}>{a.NOM_UBI}</td>
                    <td className={styles.td}>
                      <span 
                        className={styles.badgeEstado} 
                        style={{ background: colores.bg, color: colores.text }}
                      >
                        {a.EST_ART}
                      </span>
                    </td>
                    <td className={styles.td}>${Number(a.VAL_ART || 0).toLocaleString('es-EC', { minimumFractionDigits: 2 })}</td>
                    <td className={styles.td}>
                      <div className={styles.acciones}>
                        <button 
                          className={styles.btnAccion} 
                          onClick={() => handleAbrirForm(a)}
                          aria-label="Editar artículo"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={`${styles.btnAccion} ${styles.btnAccionDelete}`}
                          onClick={() => handleAbrirConfirm(a)}
                          aria-label="Dar de baja artículo"
                          disabled={a.EST_ART === 'Baja'}
                          style={{ opacity: a.EST_ART === 'Baja' ? 0.3 : 1, cursor: a.EST_ART === 'Baja' ? 'not-allowed' : 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalForm.isOpen && (
        <ArticuloFormModal 
          articulo={modalForm.articulo}
          categorias={categorias}
          ubicaciones={ubicaciones}
          usuarioLogueado={usuario}
          onClose={handleCerrarForm}
          onSave={handleGuardarForm}
        />
      )}

      <ConfirmModal
        isOpen={modalConfirm.isOpen}
        title="Dar de baja"
        message={`¿Estás seguro de que deseas dar de baja el artículo "${modalConfirm.articulo?.NOM_ART}" (${modalConfirm.articulo?.COD_ART})? Esto cambiará su estado a "Baja".`}
        confirmText="Sí, dar de baja"
        type="danger"
        onConfirm={handleConfirmarEliminar}
        onCancel={handleCerrarConfirm}
      />

      {toast && (
        <div className={`${styles.toast} ${styles[toast.tipo]}`}>
          <p className={styles.toastTitle}>{toast.mensaje}</p>
        </div>
      )}
    </div>
  );
}
