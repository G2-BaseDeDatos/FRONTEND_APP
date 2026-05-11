import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import useCountdown from '../../hooks/useCountdown';
import styles from './ActiveLoanAlert.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// ActiveLoanAlert.jsx — Alerta prominente de préstamos activos
//
// Datos: GET /api/articulos?estado=Prestado&responsable={id_usu}
// Cuando el módulo de préstamos exista, el campo fec_fin_pre vendrá
// del backend. Por ahora se muestra la info del artículo asignado.
//
// Muestra:
//   - Sin préstamos → estado apacible (verde)
//   - Con préstamos → tarjeta del más urgente + contador de días/horas
//   - Color dinámico: azul (normal) → ámbar (≤3 días) → rojo (vencido)
// ──────────────────────────────────────────────────────────────────────────────

/** Contador interno que usa el hook useCountdown */
function Contador({ fechaDevolucion }) {
  const { texto, urgencia } = useCountdown(fechaDevolucion || null);

  const claseUrgencia = {
    normal:   styles.countNormal,
    urgente:  styles.countUrgente,
    vencido:  styles.countVencido,
    sinFecha: styles.countSinFecha,
  }[urgencia] ?? styles.countNormal;

  return (
    <span className={`${styles.contador} ${claseUrgencia}`}>
      {texto}
    </span>
  );
}

export default function ActiveLoanAlert({ prestamos = [], cargando }) {
  if (cargando) {
    return (
      <div className={styles.skeleton} aria-busy="true">
        <div className={styles.skeletonLine} style={{ width: '40%' }} />
        <div className={styles.skeletonLine} style={{ width: '60%', height: '28px' }} />
        <div className={styles.skeletonLine} style={{ width: '30%' }} />
      </div>
    );
  }

  // Sin préstamos activos
  if (!prestamos || prestamos.length === 0) {
    return (
      <div className={`${styles.card} ${styles.cardOk}`}>
        <div className={styles.iconWrap} style={{ background: '#DCFCE7', color: '#10B981' }}>
          <CheckCircle2 size={24} aria-hidden="true" />
        </div>
        <div className={styles.info}>
          <p className={styles.titulo}>Sin préstamos activos</p>
          <p className={styles.subtitulo}>
            No tienes equipos prestados actualmente. ¡Explora el catálogo y solicita lo que necesites!
          </p>
        </div>
      </div>
    );
  }

  // Ordenar por urgencia: priorizar los que tienen fecha más próxima
  const ordenados = [...prestamos].sort((a, b) => {
    const fa = a.fec_fin_pre ? new Date(a.fec_fin_pre).getTime() : Infinity;
    const fb = b.fec_fin_pre ? new Date(b.fec_fin_pre).getTime() : Infinity;
    return fa - fb;
  });

  const masUrgente = ordenados[0];
  const resto      = ordenados.slice(1);

  // Determinar variante de color de la tarjeta según urgencia del más próximo
  const diffDias = masUrgente.fec_fin_pre
    ? Math.ceil((new Date(masUrgente.fec_fin_pre) - Date.now()) / (1000 * 60 * 60 * 24))
    : 99;
  const variante = diffDias <= 1 ? 'vencido' : diffDias <= 3 ? 'urgente' : 'normal';

  const claseCard = {
    normal:  styles.cardNormal,
    urgente: styles.cardUrgente,
    vencido: styles.cardVencido,
  }[variante];

  return (
    <div className={`${styles.card} ${claseCard}`}>
      <div
        className={styles.iconWrap}
        style={{
          background: variante === 'vencido' ? '#FEE2E2' : variante === 'urgente' ? '#FEF3C7' : '#DBEAFE',
          color:      variante === 'vencido' ? '#DC2626'  : variante === 'urgente' ? '#B45309' : '#1E3A8A',
        }}
        aria-hidden="true"
      >
        {variante === 'normal'
          ? <Clock         size={24} />
          : <AlertTriangle size={24} />
        }
      </div>

      <div className={styles.info}>
        <p className={styles.titulo}>
          {prestamos.length === 1
            ? 'Tienes 1 equipo por devolver'
            : `Tienes ${prestamos.length} equipos por devolver`
          }
        </p>
        <p className={styles.equipoNombre}>{masUrgente.NOM_ART}</p>
        <Contador fechaDevolucion={masUrgente.fec_fin_pre} />
        {resto.length > 0 && (
          <p className={styles.masEquipos}>
            + {resto.length} equipo{resto.length > 1 ? 's' : ''} más
          </p>
        )}
      </div>
    </div>
  );
}
