import { Package, CheckCircle, ArrowLeftRight, Wrench } from 'lucide-react';
import styles from './KPICards.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// KPICards.jsx
// Datos alimentados por GET /api/articulos → contados por EST_ART en dashboardService.js
// ──────────────────────────────────────────────────────────────────────────────

const KPI_CONFIG = [
  {
    key:     'total',
    label:   'Total Artículos',
    icon:    Package,
    color:   '#3B82F6',
    bgIcon:  '#EFF6FF',
  },
  {
    key:     'disponibles',
    label:   'Disponibles',
    icon:    CheckCircle,
    color:   '#10B981',
    bgIcon:  '#ECFDF5',
  },
  {
    key:     'prestados',
    label:   'Prestados',
    icon:    ArrowLeftRight,
    color:   '#8B5CF6',
    bgIcon:  '#F5F3FF',
  },
  {
    key:     'enMantenimiento',
    label:   'En Mantenimiento',
    icon:    Wrench,
    color:   '#F59E0B',
    bgIcon:  '#FFFBEB',
  },
];

function SkeletonCard() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Cargando KPI…">
      <div className={styles.skeletonIcon} />
      <div className={styles.skeletonNumber} />
      <div className={styles.skeletonLabel} />
    </div>
  );
}

export default function KPICards({ stats, cargando }) {
  if (cargando) {
    return (
      <div className={styles.grid}>
        {KPI_CONFIG.map((k) => <SkeletonCard key={k.key} />)}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {KPI_CONFIG.map(({ key, label, icon: Icon, color, bgIcon }, idx) => (
        <div
          key={key}
          className={styles.card}
          style={{ '--accent': color, animationDelay: `${idx * 90}ms` }}
          aria-label={`${label}: ${stats?.[key] ?? 0}`}
        >
          {/* Franja lateral de color */}
          <div className={styles.accentBar} />

          {/* Icono */}
          <div
            className={styles.iconWrapper}
            style={{ background: bgIcon }}
            aria-hidden="true"
          >
            <Icon size={22} color={color} />
          </div>

          {/* Número + etiqueta */}
          <div className={styles.textArea}>
            <span className={styles.number}>
              {stats?.[key] ?? 0}
            </span>
            <span className={styles.label}>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
