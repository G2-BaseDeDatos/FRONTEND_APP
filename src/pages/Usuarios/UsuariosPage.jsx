import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import styles from './UsuariosPage.module.css';
import { useAuth } from '../../context/AuthContext';
import { fetchUsuarios, fetchRoles, crearUsuario, actualizarUsuario, eliminarUsuario } from '../../services/usuariosService';
import UsuarioFormModal from './UsuarioFormModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'Administrador';
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  // Modales
  const [modalForm, setModalForm] = useState({ isOpen: false, usuario: null });
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, usuario: null });
  
  // Toast
  const [toast, setToast] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [dataUsuarios, dataRoles] = await Promise.all([
        fetchUsuarios(),
        fetchRoles()
      ]);
      setUsuarios(dataUsuarios);
      setRoles(dataRoles);
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

  // Filtrado local
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchTexto = 
        u.NOM_USU?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.CED_USU?.includes(busqueda) ||
        u.COR_USU?.toLowerCase().includes(busqueda.toLowerCase());
      
      const matchRol = filtroRol ? u.NOM_ROL === filtroRol : true;
      return matchTexto && matchRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  // Manejadores de Formularios
  const handleAbrirForm = (usuario = null) => {
    setModalForm({ isOpen: true, usuario });
  };

  const handleCerrarForm = () => {
    setModalForm({ isOpen: false, usuario: null });
  };

  const handleGuardarForm = async (formData) => {
    try {
      if (modalForm.usuario) {
        // Actualizar
        const updateData = { ...formData };
        if (!updateData.pas_usu) {
          delete updateData.pas_usu;
        }
        await actualizarUsuario(modalForm.usuario.ID_USU, updateData);
        mostrarToast('Usuario actualizado exitosamente');
      } else {
        // Crear
        await crearUsuario(formData);
        mostrarToast('Usuario creado exitosamente');
      }
      handleCerrarForm();
      cargarDatos(); // Refrescar lista
    } catch (error) {
      throw error; // Lanzamos para que el modal lo capture
    }
  };

  // Manejadores de Eliminación
  const handleAbrirConfirm = (usuario) => {
    setModalConfirm({ isOpen: true, usuario });
  };

  const handleCerrarConfirm = () => {
    setModalConfirm({ isOpen: false, usuario: null });
  };

  const handleConfirmarEliminar = async () => {
    try {
      await eliminarUsuario(modalConfirm.usuario.ID_USU);
      mostrarToast('Usuario eliminado exitosamente');
      handleCerrarConfirm();
      cargarDatos();
    } catch (error) {
      mostrarToast(error.response?.data?.message || 'Error al eliminar usuario', 'error');
      handleCerrarConfirm();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            <Users size={28} color="#3B82F6" />
            Gestión de Usuarios
          </h1>
          <p className={styles.subtitle}>
            Administra docentes, estudiantes y otros administradores del sistema.
          </p>
        </div>
        {esAdmin && (
          <button className={styles.btnNuevo} onClick={() => handleAbrirForm()}>
            <Plus size={18} />
            Nuevo Usuario
          </button>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o correo..."
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
          <option value="">Todos los roles</option>
          {roles.map(r => (
            <option key={r.ID_ROL} value={r.NOM_ROL}>{r.NOM_ROL}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de usuarios">
          <thead>
            <tr>
              <th className={styles.th}>Cédula</th>
              <th className={styles.th}>Nombre</th>
              <th className={styles.th}>Correo Institucional</th>
              <th className={styles.th}>Rol</th>
              {esAdmin && <th className={styles.th}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  <td colSpan={5}><div className={styles.skeletonCell} /></td>
                </tr>
              ))
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.emptyState}>
                    <Users size={48} color="#CBD5E1" />
                    <p>No se encontraron usuarios</p>
                  </div>
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => (
                <tr key={u.ID_USU} className={styles.tr}>
                  <td className={styles.td}>{u.CED_USU}</td>
                  <td className={styles.td}>
                    {u.NOM_USU}
                  </td>
                  <td className={`${styles.td} ${styles.tdSecundario}`}>{u.COR_USU}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badgeRol} ${styles[u.NOM_ROL]}`}>
                      {u.NOM_ROL}
                    </span>
                  </td>
                  {esAdmin && (
                    <td className={styles.td}>
                      <div className={styles.acciones}>
                        <button 
                          className={styles.btnAccion} 
                          onClick={() => handleAbrirForm(u)}
                          aria-label="Editar usuario"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={`${styles.btnAccion} ${styles.btnAccionDelete}`}
                          onClick={() => handleAbrirConfirm(u)}
                          aria-label="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {modalForm.isOpen && (
        <UsuarioFormModal 
          usuario={modalForm.usuario}
          roles={roles}
          onClose={handleCerrarForm}
          onSave={handleGuardarForm}
        />
      )}

      <ConfirmModal
        isOpen={modalConfirm.isOpen}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${modalConfirm.usuario?.NOM_USU}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        type="danger"
        onConfirm={handleConfirmarEliminar}
        onCancel={handleCerrarConfirm}
      />

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.tipo]}`}>
          <p className={styles.toastTitle}>{toast.mensaje}</p>
        </div>
      )}
    </div>
  );
}
