import { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import styles from './InventarioPage.module.css';

export default function ArticuloFormModal({ articulo, categorias, ubicaciones, usuarioLogueado, onClose, onSave }) {
  const isEditing = !!articulo;
  
  const [formData, setFormData] = useState({
    id_cat: '',
    id_ubi: '',
    cod_art: '',
    nom_art: '',
    est_art: 'Disponible',
    val_art: '',
  });

  const [archivoImagen, setArchivoImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      setFormData({
        id_cat: articulo.ID_CAT || '',
        id_ubi: articulo.ID_UBI || '',
        cod_art: articulo.COD_ART || '',
        nom_art: articulo.NOM_ART || '',
        est_art: articulo.EST_ART || 'Disponible',
        val_art: articulo.VAL_ART || '',
      });
    }
  }, [articulo, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivoImagen(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.id_cat || !formData.id_ubi || !formData.cod_art || !formData.nom_art || !formData.val_art) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      // Agregar id_usu automáticamente del administrador logueado
      const dataToSave = {
        ...formData,
        id_usu: usuarioLogueado?.id_usu || usuarioLogueado?.ID_USU // Depende de la estructura del contexto
      };
      
      await onSave(dataToSave, archivoImagen);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error desconocido al guardar el artículo.';
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
            {isEditing ? 'Editar Artículo' : 'Nuevo Artículo'}
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

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="cod_art" className={styles.formLabel}>Código *</label>
                <input
                  type="text"
                  id="cod_art"
                  name="cod_art"
                  className={styles.formInput}
                  value={formData.cod_art}
                  onChange={handleChange}
                  required
                  placeholder="Ej. LAP-001"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="nom_art" className={styles.formLabel}>Nombre *</label>
                <input
                  type="text"
                  id="nom_art"
                  name="nom_art"
                  className={styles.formInput}
                  value={formData.nom_art}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Laptop Dell Vostro"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="id_cat" className={styles.formLabel}>Categoría *</label>
                <select
                  id="id_cat"
                  name="id_cat"
                  className={styles.formSelect}
                  value={formData.id_cat}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => (
                    <option key={c.ID_CAT} value={c.ID_CAT}>{c.NOM_CAT}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="id_ubi" className={styles.formLabel}>Ubicación *</label>
                <select
                  id="id_ubi"
                  name="id_ubi"
                  className={styles.formSelect}
                  value={formData.id_ubi}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {ubicaciones.map(u => (
                    <option key={u.ID_UBI} value={u.ID_UBI}>{u.NOM_UBI}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="val_art" className={styles.formLabel}>Valor (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="val_art"
                  name="val_art"
                  className={styles.formInput}
                  value={formData.val_art}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="est_art" className={styles.formLabel}>Estado *</label>
                <select
                  id="est_art"
                  name="est_art"
                  className={styles.formSelect}
                  value={formData.est_art}
                  onChange={handleChange}
                  required
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Prestado">Prestado</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <div className={styles.formGroupFull}>
                <label htmlFor="imagen" className={styles.formLabel}>
                  Imagen del Artículo (Opcional)
                </label>
                <input
                  type="file"
                  id="imagen"
                  name="imagen"
                  accept="image/*"
                  className={styles.formFileInput}
                  onChange={handleFileChange}
                />
                {archivoImagen && (
                  <span style={{ display: 'block', fontSize: 12, marginTop: 6, color: '#10B981' }}>
                    Archivo seleccionado: {archivoImagen.name}
                  </span>
                )}
              </div>
            </div>
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
              {loading && <Loader2 size={16} className="spin" />}
              {loading ? 'Guardando...' : 'Guardar Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
