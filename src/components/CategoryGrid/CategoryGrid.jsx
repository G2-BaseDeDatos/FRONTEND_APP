import { useNavigate } from 'react-router-dom';
import {
  Monitor, Cpu, Tablet, Cable, Camera, Package,
  Projector, Headphones, Printer, Wifi,
} from 'lucide-react';
import styles from './CategoryGrid.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// CategoryGrid.jsx
//
// Renderiza la cuadrícula de categorías de equipos.
// Datos: GET /api/categorias → [{ ID_CAT, NOM_CAT }]
//
// El mapa de íconos relaciona el NOM_CAT con un icono de lucide-react.
// Si el nombre de la categoría no coincide con ningún patrón, usa Package.
// Ajustar ICON_MAP si las categorías en la BD tienen nombres distintos.
// ──────────────────────────────────────────────────────────────────────────────

/** Mapa de nombre de categoría → icono de lucide-react */
const ICON_MAP = [
  { patron: /laptop|portátil|portatil|computador/i,  Icon: Monitor    },
  { patron: /tablet|tableta/i,                        Icon: Tablet     },
  { patron: /proyector/i,                             Icon: Projector  },
  { patron: /cable|conector|hdmi/i,                   Icon: Cable      },
  { patron: /cámara|camara|fotograf/i,                Icon: Camera     },
  { patron: /auricular|headset|headphone/i,           Icon: Headphones },
  { patron: /impresora|print/i,                       Icon: Printer    },
  { patron: /red|router|switch|wifi/i,                Icon: Wifi       },
  { patron: /cpu|computador de escritorio|desktop/i,  Icon: Cpu        },
];

function getIcono(nomCat) {
  for (const { patron, Icon } of ICON_MAP) {
    if (patron.test(nomCat)) return Icon;
  }
  return Package; // fallback
}

/** Paleta de colores rotativos para los íconos de categoría */
const PALETA = [
  { bg: '#EFF6FF', color: '#3B82F6' },
  { bg: '#F5F3FF', color: '#8B5CF6' },
  { bg: '#ECFDF5', color: '#10B981' },
  { bg: '#FEF3C7', color: '#F59E0B' },
  { bg: '#FEE2E2', color: '#EF4444' },
  { bg: '#F0FDFB', color: '#14B8A6' },
];

function SkeletonCat() {
  return (
    <div className={styles.skeleton} aria-busy="true">
      <div className={styles.skeletonIcon} />
      <div className={styles.skeletonLabel} />
    </div>
  );
}

export default function CategoryGrid({ categorias, cargando, onSeleccionar }) {
  if (cargando) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCat key={i} />)}
      </div>
    );
  }

  if (!categorias || categorias.length === 0) {
    return (
      <div className={styles.empty}>
        <Package size={40} color="#CBD5E1" aria-hidden="true" />
        <p>No hay categorías disponibles</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {categorias.map((cat, idx) => {
        const Icon    = getIcono(cat.NOM_CAT);
        const paleta  = PALETA[idx % PALETA.length];

        return (
          <button
            key={cat.ID_CAT}
            className={styles.cell}
            onClick={() => onSeleccionar?.(cat)}
            style={{ '--icon-bg': paleta.bg, '--icon-color': paleta.color, animationDelay: `${idx * 60}ms` }}
            aria-label={`Explorar categoría: ${cat.NOM_CAT}`}
          >
            <div className={styles.iconWrapper} aria-hidden="true">
              <Icon size={28} />
            </div>
            <span className={styles.label}>{cat.NOM_CAT}</span>
          </button>
        );
      })}
    </div>
  );
}
