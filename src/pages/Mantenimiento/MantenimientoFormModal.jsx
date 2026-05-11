import { useState, useMemo } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import styles from './MantenimientoPage.module.css';

export default function MantenimientoFormModal({ articulos, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id_art: '',
    tip_man: 'Preventivo',
    fec_man: new Date().toISOString().split('T')[0],
    des_man: '',
  });

  const [busquedaArt, setBusquedaArt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.id_art) return setError('Seleccione un artículo.');
    if (!formData.des_man.trim()) return setError('La descripción es obligatoria.');

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el registro.');
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
    <div className={styles.modalOverlay} role="dialog">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Enviar a Mantenimiento</h2>
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
              <label htmlFor="id_art" className={styles.formLabel}>
                Equipo (Búsqueda rápida)
              </label>
              <input
                type="text"
                placeholder="Escribe el código o nombre..."
                className={styles.formInput}
                style={{ marginBottom: 8 }}
                value={busquedaArt}
                onChange={(e) => setBusquedaArt(e.target.value)}
              />
              <select
                id="id_art"
                name="id_art"
                className={styles.formSelect}
                value={formData.id_art}
                onChange={handleChange}
                required
                size="4"
                style={{ height: 'auto', padding: 4 }}
              >
                {artsFiltrados.length === 0 ? (
                  <option disabled>No hay equipos disponibles</option>
                ) : (
                  artsFiltrados.map(a => (
                    <option key={a.ID_ART} value={a.ID_ART} style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>
                      {a.COD_ART} - {a.NOM_ART}
                    </option>
                  ))
                )}
              </select>
              <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                Solo se muestran equipos en estado "Disponible".
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tip_man" className={styles.formLabel}>Tipo de Mantenimiento *</label>
              <select
                id="tip_man"
                name="tip_man"
                className={styles.formSelect}
                value={formData.tip_man}
                onChange={handleChange}
                required
              >
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fec_man" className={styles.formLabel}>Fecha de Ingreso *</label>
              <input
                type="date"
                id="fec_man"
                name="fec_man"
                className={styles.formInput}
                value={formData.fec_man}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="des_man" className={styles.formLabel}>Motivo / Descripción *</label>
              <textarea
                id="des_man"
                name="des_man"
                className={styles.formTextarea}
                placeholder="Detalle el motivo por el cual ingresa a mantenimiento..."
                value={formData.des_man}
                onChange={handleChange}
                required
                maxLength={500}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading && <Loader2 size={16} className="spin" />}
              {loading ? 'Guardando...' : 'Registrar Mantenimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
