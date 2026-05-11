import { useState } from 'react';
import { CheckCircle, XCircle, ClipboardList, AlertCircle } from 'lucide-react';
import { ESTADO_COLORES } from '../../constants/theme';
import styles from './PendingRequestsTable.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// PendingRequestsTable.jsx
//
// Datos alimentados por: GET /api/prestamos?estado=Pendiente (futuro)
// Acciones:  PUT /api/prestamos/:id/aprobar   (futuro)
//            PUT /api/prestamos/:id/rechazar  (futuro)
//
// Por ahora muestra la lista de solicitudes con modal de confirmación.
// Cuando el backend tenga el módulo de préstamos, cambiar dashboardService.js
// únicamente — este componente ya está preparado para recibir los datos reales.
// ──────────────────────────────────────────────────────────────────────────────

// Columnas de la tabla
const COLUMNAS = [
  { id: 'id',            label: '#',              sortable: true  },
  { id: 'usuario',       label: 'Usuario',        sortable: true  },
  { id: 'equipo',        label: 'Artículo',       sortable: false },
  { id: 'fechaSolicitud',label: 'Fecha Solicitud',sortable: true  },
  { id: 'estado',        label: 'Estado',         sortable: false },
  { id: 'acciones',      label: 'Acciones',       sortable: false },
];

/** Modal de confirmación reutilizable */
function ConfirmModal({ tipo, prestamo, onConfirm, onCancel }) {
  const esAprobar = tipo === 'aprobar';
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={`${styles.modalIcon} ${esAprobar ? styles.iconGreen : styles.iconRed}`}>
          {esAprobar
            ? <CheckCircle size={28} />
            : <XCircle    size={28} />
          }
        </div>
        <h2 className={styles.modalTitle}>
          {esAprobar ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?'}
        </h2>
        <p className={styles.modalBody}>
          {esAprobar
            ? `Se aprobará el préstamo de "${prestamo?.equipo}" a ${prestamo?.usuario}. Esta acción marcará el artículo como "Prestado".`
            : `Se rechazará el préstamo de "${prestamo?.equipo}" a ${prestamo?.usuario}. Esta acción no puede deshacerse.`
          }
        </p>
        <div className={styles.modalActions}>
          <button className={styles.btnCancelar} onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={esAprobar ? styles.btnAprobar : styles.btnRechazar}
            onClick={onConfirm}
          >
            {esAprobar ? 'Sí, aprobar' : 'Sí, rechazar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Badge de estado del préstamo */
function EstadoBadge({ estado }) {
  const colores = ESTADO_COLORES[estado] || { bg: '#F1F5F9', text: '#475569' };
  return (
    <span
      className={styles.estadoBadge}
      style={{ background: colores.bg, color: colores.text }}
    >
      {estado}
    </span>
  );
}

export default function PendingRequestsTable({
  solicitudes,
  cargando,
  onAprobar,
  onRechazar,
}) {
  const [sortCol,   setSortCol]   = useState('fechaSolicitud');
  const [sortDir,   setSortDir]   = useState('desc');
  const [modal,     setModal]     = useState(null); // { tipo: 'aprobar'|'rechazar', prestamo }
  const [accionando, setAccionando] = useState(null); // id en proceso

  // ── Ordenamiento ───────────────────────────────────────────────────────────
  const handleSort = (col) => {
    if (!COLUMNAS.find((c) => c.id === col)?.sortable) return;
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sorted = [...(solicitudes || [])].sort((a, b) => {
    const va = a[sortCol] ?? '';
    const vb = b[sortCol] ?? '';
    const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // ── Confirmar acción ───────────────────────────────────────────────────────
  const confirmarAccion = async () => {
    if (!modal) return;
    const { tipo, prestamo } = modal;
    setModal(null);
    setAccionando(prestamo.id);
    try {
      if (tipo === 'aprobar') await onAprobar(prestamo.id);
      else                    await onRechazar(prestamo.id);
    } finally {
      setAccionando(null);
    }
  };

  // ── Estado vacío ───────────────────────────────────────────────────────────
  if (!cargando && (!solicitudes || solicitudes.length === 0)) {
    return (
      <section className={styles.wrapper}>
        <h2 className={styles.sectionTitle}>
          <ClipboardList size={20} aria-hidden="true" />
          Solicitudes Pendientes
        </h2>
        <div className={styles.emptyState} aria-live="polite">
          <ClipboardList size={48} color="#CBD5E1" aria-hidden="true" />
          <p className={styles.emptyTitle}>Próximamente: Aprobación de Préstamos</p>
          <p className={styles.emptySubtitle}>
            Actualmente los préstamos se crean como activos directamente. El flujo de aprobación con estado "Pendiente" está en desarrollo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>
        <ClipboardList size={20} aria-hidden="true" />
        Solicitudes Pendientes
        {solicitudes?.length > 0 && (
          <span className={styles.countBadge}>{solicitudes.length}</span>
        )}
      </h2>

      {/* Modal de confirmación */}
      {modal && (
        <ConfirmModal
          tipo={modal.tipo}
          prestamo={modal.prestamo}
          onConfirm={confirmarAccion}
          onCancel={() => setModal(null)}
        />
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Tabla de solicitudes pendientes">
          <thead>
            <tr>
              {COLUMNAS.map((col) => (
                <th
                  key={col.id}
                  className={`${styles.th} ${col.sortable ? styles.thSortable : ''}`}
                  onClick={() => col.sortable && handleSort(col.id)}
                  aria-sort={
                    col.sortable && sortCol === col.id
                      ? sortDir === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  {col.label}
                  {col.sortable && (
                    <span className={styles.sortIcon} aria-hidden="true">
                      {sortCol === col.id
                        ? sortDir === 'asc' ? ' ↑' : ' ↓'
                        : ' ⇅'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cargando
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className={styles.skeletonRow}>
                    {COLUMNAS.map((c) => (
                      <td key={c.id} className={styles.td}>
                        <div className={styles.skeletonCell} />
                      </td>
                    ))}
                  </tr>
                ))
              : sorted.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={`${styles.tr} ${accionando === s.id ? styles.trProcessing : ''}`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td className={styles.td}>{s.id}</td>
                    <td className={styles.td}>{s.usuario}</td>
                    <td className={styles.td}>{s.equipo}</td>
                    <td className={styles.td}>{s.fechaSolicitud}</td>
                    <td className={styles.td}>
                      <EstadoBadge estado={s.estado || 'Pendiente'} />
                    </td>
                    <td className={styles.td}>
                      <div className={styles.acciones}>
                        <button
                          className={styles.btnAprobar}
                          onClick={() => setModal({ tipo: 'aprobar', prestamo: s })}
                          disabled={accionando === s.id}
                          aria-label={`Aprobar solicitud de ${s.usuario}`}
                        >
                          <CheckCircle size={14} aria-hidden="true" />
                          Aprobar
                        </button>
                        <button
                          className={styles.btnRechazar}
                          onClick={() => setModal({ tipo: 'rechazar', prestamo: s })}
                          disabled={accionando === s.id}
                          aria-label={`Rechazar solicitud de ${s.usuario}`}
                        >
                          <XCircle size={14} aria-hidden="true" />
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </section>
  );
}
