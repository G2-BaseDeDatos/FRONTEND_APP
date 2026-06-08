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
              <div 
                className={styles.listContainer} 
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '6px',
                  backgroundColor: '#fff'
                }}
              >
                {artsFiltrados.length === 0 ? (
                  <div style={{ padding: '10px', color: '#64748B', textAlign: 'center' }}>
                    No hay equipos disponibles
                  </div>
                ) : (
                  artsFiltrados.map(a => (
                    <div
                      key={a.ID_ART}
                      onClick={() => setFormData(prev => ({ ...prev, id_art: a.ID_ART }))}
                      style={{
                        padding: '10px 12px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        backgroundColor: formData.id_art === a.ID_ART ? '#e0f2fe' : 'transparent',
                        color: formData.id_art === a.ID_ART ? '#0284c7' : '#334155',
                        fontWeight: formData.id_art === a.ID_ART ? 600 : 400,
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      {a.COD_ART} - {a.NOM_ART}
                    </div>
                  ))
                )}
              </div>
              {/* input oculto para la validacion HTML required */}
              <input type="hidden" name="id_art" value={formData.id_art} required />
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
