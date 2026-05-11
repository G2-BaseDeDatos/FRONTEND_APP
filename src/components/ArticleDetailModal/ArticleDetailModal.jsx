import { X, Calendar, Package, MapPin, Tag, Box } from 'lucide-react';
import styles from './ArticleDetailModal.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// ArticleDetailModal.jsx
// Modal para mostrar detalles de un artículo (ya sea desde préstamos o catálogo).
// ──────────────────────────────────────────────────────────────────────────────

export default function ArticleDetailModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Package size={32} />
          </div>
          <div>
            <h2 id="modal-title" className={styles.title}>{article.NOM_ART}</h2>
            <div className={styles.badge}>{article.COD_ART}</div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><Tag size={18} /></div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Categoría</span>
              <span className={styles.infoValue}>{article.NOM_CAT || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><MapPin size={18} /></div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Ubicación</span>
              <span className={styles.infoValue}>{article.NOM_UBI || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoIcon}><Box size={18} /></div>
            <div className={styles.infoContent}>
              <span className={styles.infoLabel}>Estado</span>
              <span className={styles.infoValue}>{article.EST_ART || article.EST_PRE || 'N/A'}</span>
            </div>
          </div>

          {article.fec_ini_pre && (
            <div className={styles.infoRow}>
              <div className={styles.infoIcon}><Calendar size={18} /></div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Fecha de Préstamo</span>
                <span className={styles.infoValue}>
                  {new Date(article.fec_ini_pre).toLocaleDateString('es-EC')}
                </span>
              </div>
            </div>
          )}

          {article.fec_fin_pre && (
            <div className={styles.infoRow}>
              <div className={styles.infoIcon}><Calendar size={18} /></div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Fecha de Devolución</span>
                <span className={styles.infoValue}>
                  {new Date(article.fec_fin_pre).toLocaleDateString('es-EC')}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
