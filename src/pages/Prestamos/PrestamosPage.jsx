import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, CheckCircle, Clock } from 'lucide-react';
import styles from './PrestamosPage.module.css';
import { fetchPrestamos, crearPrestamo, devolverPrestamo } from '../../services/prestamosService';
import { fetchUsuarios } from '../../services/usuariosService';
import { fetchArticulos } from '../../services/articulosService';
import PrestamoFormModal from './PrestamoFormModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros Locales
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Modales
  const [modalForm, setModalForm] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, prestamo: null });

  // Toast
  const [toast, setToast] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataPrestamos, dataUsuarios, dataArticulos] = await Promise.all([
        fetchPrestamos(),
        fetchUsuarios(),
        fetchArticulos({ estado: 'Disponible' }) // Solo los que se pueden prestar
      ]);
      setPrestamos(dataPrestamos);
      setUsuarios(dataUsuarios);
      setArticulosDisponibles(dataArticulos);
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

  const prestamosFiltrados = useMemo(() => {
    return prestamos.filter(p => {
      const matchTexto = 
        p.NOM_USU?.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.ID_PRE) === busqueda;
      const matchEst = filtroEstado ? p.EST_PRE === filtroEstado : true;
      return matchTexto && matchEst;
    });
  }, [prestamos, busqueda, filtroEstado]);

  // Manejadores Formulario (Creación)
  const handleGuardarForm = async (formData) => {
    try {
      await crearPrestamo(formData);
      mostrarToast('Préstamo registrado exitosamente');
      setModalForm(false);
      cargarDatos();
    } catch (error) {
      throw error;
    }
  };

  // Manejadores Devolución
  const handleAbrirConfirm = (prestamo) => {
    setModalConfirm({ isOpen: true, prestamo });
  };

  const handleConfirmarDevolucion = async () => {
    try {
      await devolverPrestamo(modalConfirm.prestamo.ID_PRE);
      mostrarToast('Devolución registrada correctamente');
      setModalConfirm({ isOpen: false, prestamo: null });
      cargarDatos(); // Refresca las listas de préstamos y artículos disponibles
    } catch (error) {
      mostrarToast(error.response?.data?.message || 'Error al procesar devolución', 'error');
      setModalConfirm({ isOpen: false, prestamo: null });
    }
  };

  const formateaFecha = (fechaISO) => {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-EC');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Clock size={28} color="#8B5CF6" />
            Gestión de Préstamos
          </h1>
          <p className={styles.subtitle}>
            Administre las asignaciones de equipos a docentes y estudiantes.
          </p>
        </div>
        <button className={styles.btnNuevo} onClick={() => setModalForm(true)}>
          <Plus size={18} />
          Nuevo Préstamo
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre de usuario o ID..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select 
          className={styles.filterSelect}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los Estados</option>
          <option value="Activo">Activo</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Devuelto">Devuelto</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de préstamos globales">
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Usuario</th>
              <th className={styles.th}>Fecha Préstamo</th>
              <th className={styles.th}>Fecha Devolución</th>
              <th className={styles.th}>Estado</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={6}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : prestamosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>
                    <Clock size={48} color="#CBD5E1" />
                    <p>No se encontraron préstamos</p>
                  </div>
                </td>
              </tr>
            ) : (
              prestamosFiltrados.map((p) => {
                const isDevuelto = p.EST_PRE === 'Devuelto' || p.EST_PRE === 'Rechazado';
                return (
                  <tr key={p.ID_PRE} className={styles.tr}>
                    <td className={styles.td}>#{p.ID_PRE}</td>
                    <td className={styles.td}>
                      {p.NOM_USU} <br/>
                      <span className={styles.tdSecundario}>{p.COR_USU}</span>
                    </td>
                    <td className={styles.td}>{formateaFecha(p.FSA_PRE)}</td>
                    <td className={styles.td}>{formateaFecha(p.FPR_PRE)}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badgeEstado} ${styles[p.EST_PRE] || ''}`}>
                        {p.EST_PRE}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <button 
                        className={styles.btnAccionSuccess}
                        onClick={() => handleAbrirConfirm(p)}
                        disabled={isDevuelto}
                        title={isDevuelto ? "Este préstamo ya está inactivo" : "Marcar como devuelto"}
                      >
                        <CheckCircle size={16} />
                        Recibir
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalForm && (
        <PrestamoFormModal
          usuarios={usuarios}
          articulos={articulosDisponibles}
          onClose={() => setModalForm(false)}
          onSave={handleGuardarForm}
        />
      )}

      <ConfirmModal
        isOpen={modalConfirm.isOpen}
        title="Confirmar Devolución"
        message={`¿Estás seguro de marcar el préstamo #${modalConfirm.prestamo?.ID_PRE} a nombre de ${modalConfirm.prestamo?.NOM_USU} como Devuelto? Los equipos vinculados pasarán a estar Disponibles nuevamente.`}
        confirmText="Sí, recibir devolución"
        type="success"
        onConfirm={handleConfirmarDevolucion}
        onCancel={() => setModalConfirm({ isOpen: false, prestamo: null })}
      />

      {toast && (
        <div className={`${styles.toast} ${styles[toast.tipo]}`}>
          <p className={styles.toastTitle}>{toast.mensaje}</p>
        </div>
      )}
    </div>
  );
}
