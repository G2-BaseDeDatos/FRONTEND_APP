import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, CheckCircle, Wrench } from 'lucide-react';
import styles from './MantenimientoPage.module.css';
import { fetchMantenimientosActivos, registrarMantenimiento, finalizarMantenimiento } from '../../services/mantenimientosService';
import { fetchArticulos } from '../../services/articulosService';
import MantenimientoFormModal from './MantenimientoFormModal';
import FinalizarMantenimientoModal from './FinalizarMantenimientoModal';

export default function MantenimientoPage() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState({ isOpen: false, mantenimiento: null });

  // Toast
  const [toast, setToast] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataMant, dataArticulos] = await Promise.all([
        fetchMantenimientosActivos(),
        fetchArticulos({ estado: 'Disponible' }) // Solo equipos que se pueden reparar
      ]);
      setMantenimientos(dataMant);
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

  const mantenimientosFiltrados = useMemo(() => {
    return mantenimientos.filter(m => {
      const matchTexto = 
        m.COD_ART?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.NOM_ART?.toLowerCase().includes(busqueda.toLowerCase());
      const matchTipo = filtroTipo ? m.TIP_MAN === filtroTipo : true;
      return matchTexto && matchTipo;
    });
  }, [mantenimientos, busqueda, filtroTipo]);

  // Manejadores Registrar (Nuevo)
  const handleGuardarForm = async (formData) => {
    try {
      await registrarMantenimiento(formData);
      mostrarToast('Equipo enviado a mantenimiento exitosamente');
      setModalFormOpen(false);
      cargarDatos();
    } catch (error) {
      throw error;
    }
  };

  // Manejadores Finalizar (Cierre)
  const handleConfirmarFinalizar = async (id_man, id_art, notas) => {
    try {
      await finalizarMantenimiento(id_man, { id_art, notas_adicionales: notas });
      mostrarToast('Mantenimiento finalizado. Equipo liberado.');
      setModalFinalizar({ isOpen: false, mantenimiento: null });
      cargarDatos();
    } catch (error) {
      throw error;
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
            <Wrench size={28} color="#F59E0B" />
            Mantenimiento de Equipos
          </h1>
          <p className={styles.subtitle}>
            Registre y gestione los equipos que requieren reparación o revisión técnica.
          </p>
        </div>
        <button className={styles.btnNuevo} onClick={() => setModalFormOpen(true)}>
          <Plus size={18} />
          Registrar Mantenimiento
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por código o nombre de equipo..."
            className={styles.searchInput}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select 
          className={styles.filterSelect}
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los Tipos</option>
          <option value="Preventivo">Preventivo</option>
          <option value="Correctivo">Correctivo</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de mantenimientos activos">
          <thead>
            <tr>
              <th className={styles.th}>ID Man.</th>
              <th className={styles.th}>Equipo</th>
              <th className={styles.th}>Tipo</th>
              <th className={styles.th}>Fecha Ingreso</th>
              <th className={styles.th}>Descripción / Motivo</th>
              <th className={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={6}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : mantenimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>
                    <Wrench size={48} color="#CBD5E1" />
                    <p>No hay equipos en mantenimiento actualmente.</p>
                  </div>
                </td>
              </tr>
            ) : (
              mantenimientosFiltrados.map((m) => (
                <tr key={m.ID_MAN} className={styles.tr}>
                  <td className={styles.td}>#{m.ID_MAN}</td>
                  <td className={styles.td}>
                    <strong>{m.COD_ART}</strong>
                    <div className={styles.tdSecundario}>{m.NOM_ART}</div>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.badgeTipo} ${styles[m.TIP_MAN] || ''}`}>
                      {m.TIP_MAN}
                    </span>
                  </td>
                  <td className={styles.td}>{formateaFecha(m.FEC_MAN)}</td>
                  <td className={styles.td}>
                    <div className={styles.descContainer} title={m.DES_MAN}>
                      {m.DES_MAN}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <button 
                      className={styles.btnAccionSuccess}
                      onClick={() => setModalFinalizar({ isOpen: true, mantenimiento: m })}
                      title="Marcar como reparado y liberar equipo"
                    >
                      <CheckCircle size={16} />
                      Finalizar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalFormOpen && (
        <MantenimientoFormModal
          articulos={articulosDisponibles}
          onClose={() => setModalFormOpen(false)}
          onSave={handleGuardarForm}
        />
      )}

      {modalFinalizar.isOpen && (
        <FinalizarMantenimientoModal
          mantenimiento={modalFinalizar.mantenimiento}
          onClose={() => setModalFinalizar({ isOpen: false, mantenimiento: null })}
          onConfirm={handleConfirmarFinalizar}
        />
      )}

      {toast && (
        <div className={`${styles.toast} ${styles[toast.tipo]}`}>
          <p className={styles.toastTitle}>{toast.mensaje}</p>
        </div>
      )}
    </div>
  );
}
