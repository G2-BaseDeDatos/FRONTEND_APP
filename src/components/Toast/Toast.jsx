import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import styles from './Toast.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// Toast.jsx — Notificación efímera en esquina inferior derecha
//
// Props:
//   mensaje   — texto a mostrar
//   tipo      — 'exito' | 'error' | 'info'
//   onCerrar  — callback al cerrar
//   duracion  — ms antes de auto-cerrar (default 4000)
// ──────────────────────────────────────────────────────────────────────────────

export default function Toast({ mensaje, tipo = 'exito', onCerrar, duracion = 4000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para activar la animación de entrada
    const tEntrada = setTimeout(() => setVisible(true), 20);
    const tSalida  = setTimeout(() => {
      setVisible(false);
      setTimeout(onCerrar, 300); // esperar animación de salida
    }, duracion);

    return () => { clearTimeout(tEntrada); clearTimeout(tSalida); };
  }, [duracion, onCerrar]);

  const iconos = {
    exito: <CheckCircle2 size={20} aria-hidden="true" />,
    success: <CheckCircle2 size={20} aria-hidden="true" />,
    error: <X            size={20} aria-hidden="true" />,
    info:  <CheckCircle2 size={20} aria-hidden="true" />,
  };

  const clases = {
    exito: styles.exito,
    success: styles.exito,
    error: styles.error,
    info:  styles.info,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${styles.toast} ${clases[tipo]} ${visible ? styles.visible : ''}`}
    >
      <span className={styles.icon}>{iconos[tipo]}</span>
      <span className={styles.mensaje}>{mensaje}</span>
      <button
        className={styles.cerrarBtn}
        onClick={() => { setVisible(false); setTimeout(onCerrar, 300); }}
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  );
}
