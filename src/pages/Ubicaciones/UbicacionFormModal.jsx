import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import styles from './UbicacionesPage.module.css';

export default function UbicacionFormModal({ ubicacion, departamentos, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id_dep: '',
    nom_ubi: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const esEdicion = !!ubicacion;

  useEffect(() => {
    if (ubicacion) {
      setFormData({
        id_dep: ubicacion.ID_DEP || '',
        nom_ubi: ubicacion.NOM_UBI || ''
      });
    } else if (departamentos.length > 0) {
      // Valor por defecto para id_dep
      setFormData(prev => ({ ...prev, id_dep: departamentos[0].ID_DEP }));
    }
  }, [ubicacion, departamentos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.id_dep) {
      return setError('Debes seleccionar un departamento.');
    }
    if (!formData.nom_ubi.trim()) {
      return setError('El nombre de la ubicación es obligatorio.');
    }

    setLoading(true);
    try {
      // Convertir id_dep a numérico antes de enviar
      await onSave({ ...formData, id_dep: parseInt(formData.id_dep, 10) });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la ubicación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {esEdicion ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </h2>
          <button className={styles.btnClose} onClick={onClose}>
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
              <label htmlFor="id_dep" className={styles.formLabel}>
                Departamento (Facultad) *
              </label>
              <select
                id="id_dep"
                name="id_dep"
                className={styles.formSelect}
                value={formData.id_dep}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Seleccione un departamento</option>
                {departamentos.map(d => (
                  <option key={d.ID_DEP} value={d.ID_DEP}>
                    {d.NOM_DEP}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nom_ubi" className={styles.formLabel}>
                Nombre de Ubicación *
              </label>
              <input
                type="text"
                id="nom_ubi"
                name="nom_ubi"
                className={styles.formInput}
                value={formData.nom_ubi}
                onChange={handleChange}
                placeholder="Ej. Laboratorio 101, Biblioteca..."
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading && <Loader2 size={16} className="spin" />}
              {loading ? 'Guardando...' : (esEdicion ? 'Guardar Cambios' : 'Crear Ubicación')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
