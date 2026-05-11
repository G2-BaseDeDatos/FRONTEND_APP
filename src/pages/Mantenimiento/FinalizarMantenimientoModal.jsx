import { useState } from 'react';
import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import styles from './MantenimientoPage.module.css';

export default function FinalizarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!mantenimiento) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onConfirm(mantenimiento.ID_MAN, mantenimiento.ID_ART, notasAdicionales);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al finalizar el mantenimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={22} color="#10B981" />
            Finalizar Mantenimiento
          </h2>
          <button className={styles.btnClose} onClick={onClose} disabled={loading}>
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

            <p style={{ fontSize: 14, color: '#475569', marginBottom: 20, lineHeight: 1.5 }}>
              Estás a punto de liberar el equipo <strong>{mantenimiento.COD_ART} - {mantenimiento.NOM_ART}</strong>. 
              Su estado volverá a ser "Disponible" en el inventario general.
            </p>

            <div className={styles.formGroup}>
              <label htmlFor="notas" className={styles.formLabel}>
                Notas Técnicas de Cierre (Opcional)
              </label>
              <textarea
                id="notas"
                className={styles.formTextarea}
                placeholder="Ej. Se reemplazó el disco duro y se instaló un SSD nuevo..."
                value={notasAdicionales}
                onChange={(e) => setNotasAdicionales(e.target.value)}
                maxLength={300}
              />
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
                Estas notas se agregarán a la descripción original del mantenimiento.
              </p>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={`${styles.btnSubmit} ${styles.btnSubmitSuccess}`} disabled={loading}>
              {loading && <Loader2 size={16} className="spin" />}
              {loading ? 'Procesando...' : 'Confirmar y Liberar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
