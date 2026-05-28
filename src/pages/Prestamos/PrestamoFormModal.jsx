import { useState, useMemo } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import styles from './PrestamosPage.module.css';

export default function PrestamoFormModal({ usuarios, articulos, preselectedArticleId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id_usu: '',
    fsa_pre: new Date().toISOString().split('T')[0], // Hoy
    fpr_pre: '',
  });

  const [articulosSeleccionados, setArticulosSeleccionados] = useState(
    preselectedArticleId ? [preselectedArticleId] : []
  );
  const [busquedaArt, setBusquedaArt] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleArticulo = (id_art) => {
    setArticulosSeleccionados(prev => {
      if (prev.includes(id_art)) return prev.filter(id => id !== id_art);
      return [...prev, id_art];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.id_usu) return setError('Seleccione un usuario.');
    if (!formData.fsa_pre || !formData.fpr_pre) return setError('Ingrese las fechas del préstamo.');
    if (new Date(formData.fpr_pre) < new Date(formData.fsa_pre)) {
      return setError('La fecha de devolución no puede ser anterior a la de salida.');
    }
    if (articulosSeleccionados.length === 0) {
      return setError('Seleccione al menos un artículo disponible para prestar.');
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        articulos_ids: articulosSeleccionados
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error al guardar el préstamo.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const artsFiltrados = useMemo(() => {
    return articulos.filter(a => 
      a.COD_ART.toLowerCase().includes(busquedaArt.toLowerCase()) ||
      a.NOM_ART.toLowerCase().includes(busquedaArt.toLowerCase())
    );
  }, [articulos, busquedaArt]);

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Registrar Nuevo Préstamo</h2>
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

            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label htmlFor="id_usu" className={styles.formLabel}>Usuario / Estudiante *</label>
                <select
                  id="id_usu"
                  name="id_usu"
                  className={styles.formSelect}
                  value={formData.id_usu}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map(u => (
                    <option key={u.ID_USU} value={u.ID_USU}>
                      {u.NOM_USU} ({u.COR_USU}) - {u.NOM_ROL}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="fsa_pre" className={styles.formLabel}>Fecha de Salida *</label>
                <input
                  type="date"
                  id="fsa_pre"
                  name="fsa_pre"
                  className={styles.formInput}
                  value={formData.fsa_pre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="fpr_pre" className={styles.formLabel}>Fecha de Retorno Estimada *</label>
                <input
                  type="date"
                  id="fpr_pre"
                  name="fpr_pre"
                  className={styles.formInput}
                  value={formData.fpr_pre}
                  min={formData.fsa_pre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.formLabel}>
                  Artículos Disponibles (Seleccionados: {articulosSeleccionados.length}) *
                </label>
                <input
                  type="text"
                  placeholder="Buscar equipo..."
                  className={styles.formInput}
                  style={{ marginBottom: 8 }}
                  value={busquedaArt}
                  onChange={(e) => setBusquedaArt(e.target.value)}
                />
                <div className={styles.articlesList}>
                  {artsFiltrados.length === 0 ? (
                    <p style={{ margin: 10, fontSize: 13, color: '#94A3B8' }}>No hay equipos disponibles con ese criterio.</p>
                  ) : (
                    artsFiltrados.map(a => (
                      <label key={a.ID_ART} className={styles.articleItem}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={articulosSeleccionados.includes(a.ID_ART)}
                          onChange={() => handleToggleArticulo(a.ID_ART)}
                        />
                        <span style={{ fontSize: 14, color: '#334155' }}>
                          <strong>{a.COD_ART}</strong> - {a.NOM_ART}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading && <Loader2 size={16} className="spin" />}
              {loading ? 'Guardando...' : 'Registrar Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
