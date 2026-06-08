import { useState } from 'react';
import { Laptop, Cpu, Tablet, Package, Loader2 } from 'lucide-react';
import styles from './EquipmentCard.module.css';

// URL base del backend (misma que axiosClient)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006';

/**
 * Normaliza la URL de imagen:
 * - Si ya es absoluta (http://...) la devuelve tal cual
 * - Si es relativa (/uploads/...) le agrega el host del backend
 */
function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// EquipmentCard.jsx — Tarjeta de equipo disponible
//
// Datos: GET /api/articulos?estado=Disponible
// Acción: POST /api/prestamos/solicitar (stub en studentService.js)
//
// Props:
//   articulo      — objeto del artículo { ID_ART, NOM_ART, NOM_CAT, ... }
//   yaSolicitado  — boolean: si ya se solicitó en esta sesión
//   onSolicitar   — callback async(idArticulo) → throws en error
// ──────────────────────────────────────────────────────────────────────────────

const ICON_MAP = [
  { patron: /laptop|portátil|portatil|computador/i, Icon: Laptop  },
  { patron: /tablet|tableta/i,                      Icon: Tablet  },
  { patron: /cpu|escritorio|desktop/i,              Icon: Cpu     },
];

function getIcono(nomCat = '') {
  for (const { patron, Icon } of ICON_MAP) {
    if (patron.test(nomCat)) return Icon;
  }
  return Package;
}

/** Paleta de fondos para el área de imagen según categoría */
const BG_PALETA = [
  'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
  'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
  'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
  'linear-gradient(135deg, #FEF3C7, #FDE68A)',
  'linear-gradient(135deg, #FEE2E2, #FECACA)',
];

function bgForIdx(idx) {
  return BG_PALETA[idx % BG_PALETA.length];
}

export default function EquipmentCard({ articulo, yaSolicitado, onSolicitar, cardIdx = 0 }) {
  const [cargando,  setCargando]  = useState(false);
  const [solicitado, setSolicitado] = useState(yaSolicitado || false);
  const [errorLocal, setErrorLocal] = useState('');

  const Icon = getIcono(articulo?.NOM_CAT);

  const handleSolicitar = async () => {
    if (cargando || solicitado) return;
    setErrorLocal('');
    setCargando(true);
    try {
      await onSolicitar?.(articulo.ID_ART);
      setSolicitado(true);
    } catch (err) {
      setErrorLocal(err?.message || 'Error al solicitar. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${cardIdx * 50}ms` }}
      aria-label={`Equipo: ${articulo?.NOM_ART}`}
    >
      {/* Área de imagen / placeholder */}
      <div
        className={styles.imgArea}
        style={{ background: bgForIdx(cardIdx) }}
        aria-hidden="true"
      >
        {resolveImageUrl(articulo.IMAGEN_URL) ? (
          <img 
            src={resolveImageUrl(articulo.IMAGEN_URL)} 
            alt={articulo.NOM_ART} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <Icon size={40} color="#3B82F6" />
        )}
      </div>

      {/* Contenido */}
      <div className={styles.body}>
        {/* Badge de categoría */}
        <span className={styles.catBadge}>{articulo?.NOM_CAT || 'Sin categoría'}</span>

        <h3 className={styles.nombre}>{articulo?.NOM_ART}</h3>
        <p className={styles.codigo}>Cód: {articulo?.COD_ART}</p>
        <p className={styles.ubicacion}>📍 {articulo?.NOM_UBI}</p>

        {/* Error local */}
        {errorLocal && (
          <p className={styles.errorMsg} role="alert">{errorLocal}</p>
        )}

        {/* Botón de solicitar */}
        <button
          className={`${styles.btnSolicitar} ${solicitado ? styles.btnSolicitado : ''}`}
          onClick={handleSolicitar}
          disabled={cargando || solicitado}
          aria-label={
            solicitado ? 'Equipo ya solicitado' :
            cargando   ? 'Procesando solicitud…' :
            `Solicitar ${articulo?.NOM_ART}`
          }
        >
          {cargando ? (
            <>
              <Loader2 size={15} className={styles.spinner} aria-hidden="true" />
              Procesando…
            </>
          ) : solicitado ? (
            '✓ Solicitud enviada'
          ) : (
            'Solicitar equipo'
          )}
        </button>
      </div>
    </article>
  );
}

/** Skeleton */
export function EquipmentCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skLine} ${styles.skShort}`} />
        <div className={`${styles.skLine} ${styles.skLong}`}  />
        <div className={`${styles.skLine} ${styles.skMedium}`} />
        <div className={`${styles.skLine} ${styles.skBtn}`}   />
      </div>
    </div>
  );
}
