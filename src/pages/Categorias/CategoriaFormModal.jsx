import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import styles from './CategoriasPage.module.css';

export default function CategoriaFormModal({ categoria, onClose, onSave }) {
  const [formData, setFormData] = useState({ nom_cat: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const esEdicion = !!categoria;

  useEffect(() => {
    if (categoria) {
      setFormData({
        nom_cat: categoria.NOM_CAT || ''
      });
    }
  }, [categoria]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nom_cat.trim()) {
      return setError('El nombre de la categoría es obligatorio.');
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
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
              <label htmlFor="nom_cat" className={styles.formLabel}>
                Nombre de Categoría *
              </label>
              <input
                type="text"
                id="nom_cat"
                name="nom_cat"
                className={styles.formInput}
                value={formData.nom_cat}
                onChange={handleChange}
                placeholder="Ej. Computadoras, Accesorios, etc."
                maxLength={50}
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
              {loading ? 'Guardando...' : (esEdicion ? 'Guardar Cambios' : 'Crear Categoría')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
