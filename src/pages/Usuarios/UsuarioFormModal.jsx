import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import styles from './UsuariosPage.module.css';

export default function UsuarioFormModal({ usuario, roles, onClose, onSave }) {
  const isEditing = !!usuario;
  
  const [formData, setFormData] = useState({
    id_rol: '',
    ced_usu: '',
    nom_usu: '',
    cor_usu: '',
    pas_usu: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      // El backend retorna NOM_ROL o podemos mapearlo, pero necesitamos el ID del rol para el select.
      // Si el backend no envía el ID_ROL, tenemos que buscarlo por NOM_ROL.
      let roleId = usuario.ID_ROL;
      if (!roleId && usuario.NOM_ROL) {
        const found = roles.find(r => r.NOM_ROL === usuario.NOM_ROL);
        if (found) roleId = found.ID_ROL;
      }
      
      setFormData({
        id_rol: roleId || '',
        ced_usu: usuario.CED_USU || '',
        nom_usu: usuario.NOM_USU || '',
        cor_usu: usuario.COR_USU || '',
        pas_usu: '', // Vacío por defecto, oculto en modo edición
      });
    }
  }, [usuario, roles, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación de contraseñas si no es edición
    if (!isEditing && formData.pas_usu.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      // Mostrar mensaje del backend
      const errMsg = err.response?.data?.message || err.message || 'Error desconocido al guardar usuario.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button className={styles.btnClose} onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="id_rol" className={styles.formLabel}>Rol *</label>
              <select
                id="id_rol"
                name="id_rol"
                className={styles.formSelect}
                value={formData.id_rol}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un rol...</option>
                {roles.map(r => (
                  <option key={r.ID_ROL} value={r.ID_ROL}>
                    {r.NOM_ROL}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ced_usu" className={styles.formLabel}>Cédula *</label>
              <input
                type="text"
                id="ced_usu"
                name="ced_usu"
                className={styles.formInput}
                value={formData.ced_usu}
                onChange={handleChange}
                required
                maxLength={10}
                placeholder="1234567890"
              />
              <span className={styles.formHint}>Debe tener 10 dígitos numéricos.</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nom_usu" className={styles.formLabel}>Nombre Completo *</label>
              <input
                type="text"
                id="nom_usu"
                name="nom_usu"
                className={styles.formInput}
                value={formData.nom_usu}
                onChange={handleChange}
                required
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cor_usu" className={styles.formLabel}>Correo Institucional *</label>
              <input
                type="email"
                id="cor_usu"
                name="cor_usu"
                className={styles.formInput}
                value={formData.cor_usu}
                onChange={handleChange}
                required
                placeholder="ejemplo@uta.edu.ec"
              />
              <span className={styles.formHint}>
                Para estudiantes: inicial del nombre + apellido + últimos 4 dígitos de cédula @uta.edu.ec
              </span>
            </div>

            {!isEditing && (
              <div className={styles.formGroup}>
                <label htmlFor="pas_usu" className={styles.formLabel}>Contraseña *</label>
                <input
                  type="password"
                  id="pas_usu"
                  name="pas_usu"
                  className={styles.formInput}
                  value={formData.pas_usu}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
