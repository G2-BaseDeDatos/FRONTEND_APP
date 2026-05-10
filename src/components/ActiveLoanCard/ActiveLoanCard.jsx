import { Laptop, AlertTriangle, Cpu } from 'lucide-react';
import styles from './ActiveLoanCard.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// ActiveLoanCard.jsx
//
// Muestra un artículo asignado al docente como tarjeta de "préstamo activo".
// Fuente de datos real: GET /api/articulos?responsable={id_usu}
// Campos usados: NOM_ART, EST_ART, NOM_CAT, NOM_UBI, COD_ART, VAL_ART
//
// Cuando el módulo de préstamos exista, el prop `prestamo` incluirá
// fec_ini_pre y fec_fin_pre. Por ahora se simula con la fecha actual
// más un offset para demostrar los estados visuales de urgencia.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el estado de urgencia de la fecha de devolución.
 * @param {Date|null} fechaDevolucion
 * @returns {'vencido'|'urgente'|'normal'|'sinFecha'}
 */
function calcularUrgencia(fechaDevolucion) {
  if (!fechaDevolucion) return 'sinFecha';
  const hoy    = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fdev   = new Date(fechaDevolucion);
  fdev.setHours(0, 0, 0, 0);
  const diff   = Math.ceil((fdev - hoy) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return 'vencido';
  if (diff <= 3) return 'urgente';
  return 'normal';
}

/**
 * Formatea una fecha a texto legible en español.
 */
function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha asignada';
  return new Date(fecha).toLocaleDateString('es-EC', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
}

/** Icono del placeholder según categoría del artículo */
function IconoEquipo({ categoria }) {
  const cat = (categoria || '').toLowerCase();
  if (cat.includes('laptop') || cat.includes('comput')) return <Laptop size={36} />;
  if (cat.includes('tablet') || cat.includes('celul'))  return <Cpu    size={36} />;
  return <Cpu size={36} />;
}

export default function ActiveLoanCard({ prestamo, onClick }) {
  // El "préstamo" es en realidad un artículo asignado.
  // fec_fin_pre estará disponible cuando exista el módulo real de préstamos.
  const urgencia      = calcularUrgencia(prestamo?.fec_fin_pre || null);
  const fechaDisplay  = formatearFecha(prestamo?.fec_fin_pre || null);

  const urgenciaClase = {
    vencido:  styles.chipVencido,
    urgente:  styles.chipUrgente,
    normal:   styles.chipNormal,
    sinFecha: styles.chipSinFecha,
  }[urgencia];

  return (
    <article
      className={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={`Artículo: ${prestamo?.NOM_ART}`}
    >
      {/* Placeholder de imagen */}
      <div className={styles.imgWrapper} aria-hidden="true">
        <IconoEquipo categoria={prestamo?.NOM_CAT} />
      </div>

      {/* Información */}
      <div className={styles.info}>
        <p className={styles.categoria}>{prestamo?.NOM_CAT || 'Sin categoría'}</p>
        <h3 className={styles.nombre}>{prestamo?.NOM_ART}</h3>
        <p className={styles.codigo}>Cód: {prestamo?.COD_ART}</p>
        <p className={styles.ubicacion}>📍 {prestamo?.NOM_UBI}</p>

        {/* Chip de fecha de devolución */}
        <div className={`${styles.chip} ${urgenciaClase}`}>
          {(urgencia === 'vencido' || urgencia === 'urgente') && (
            <AlertTriangle size={12} aria-hidden="true" />
          )}
          <span>
            {urgencia === 'sinFecha'
              ? 'Fecha de devolución pendiente'
              : `Devolver: ${fechaDisplay}`
            }
          </span>
        </div>
      </div>
    </article>
  );
}

/** Skeleton de carga */
export function ActiveLoanCardSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando artículo…">
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonInfo}>
        <div className={`${styles.skeletonLine} ${styles.skeletonShort}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLong}`}  />
        <div className={`${styles.skeletonLine} ${styles.skeletonMedium}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonChip}`}  />
      </div>
    </div>
  );
}
