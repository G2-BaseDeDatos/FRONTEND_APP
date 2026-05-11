import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  type = 'warning', // 'warning' | 'danger' | 'success'
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'danger':
        return <XCircle size={28} className={styles.iconRed} />;
      case 'success':
        return <CheckCircle size={28} className={styles.iconGreen} />;
      case 'warning':
      default:
        return <AlertTriangle size={28} className={styles.iconYellow} />;
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={`${styles.modalIcon} ${styles[`bg${type}`]}`}>
          {renderIcon()}
        </div>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalBody}>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`${styles.btnConfirm} ${styles[`btn${type}`]}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
