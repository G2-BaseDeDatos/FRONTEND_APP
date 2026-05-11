import { useState, useEffect, useRef } from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// useCountdown.js — Hook personalizado para cuenta regresiva
//
// Uso:
//   const { dias, horas, minutos, urgencia, texto } = useCountdown(fechaObjetivo);
//
// urgencia: 'normal' | 'urgente' | 'vencido' | 'sinFecha'
//
// Actualiza cada 60 segundos. Se limpia al desmontar.
// ──────────────────────────────────────────────────────────────────────────────

export default function useCountdown(fechaObjetivo) {
  const calcular = () => {
    if (!fechaObjetivo) return { dias: null, horas: null, minutos: null, urgencia: 'sinFecha', texto: 'Sin fecha asignada' };

    const ahora = Date.now();
    const objetivo = new Date(fechaObjetivo).getTime();
    const diff = objetivo - ahora; // ms restantes (negativo = vencido)

    if (diff <= 0) {
      // Calcular cuánto tiempo ha pasado desde el vencimiento
      const vencidoMs = Math.abs(diff);
      const diasVencido = Math.floor(vencidoMs / (1000 * 60 * 60 * 24));
      return {
        dias:     -diasVencido,
        horas:    0,
        minutos:  0,
        urgencia: 'vencido',
        texto:    diasVencido === 0
          ? '¡Vence hoy!'
          : `Vencido hace ${diasVencido} día${diasVencido !== 1 ? 's' : ''}`,
      };
    }

    const dias     = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas    = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let urgencia = 'normal';
    if (dias === 0 && horas === 0) urgencia = 'vencido';
    else if (dias <= 1)            urgencia = 'vencido';
    else if (dias <= 3)            urgencia = 'urgente';

    let texto = '';
    if (dias > 0) texto = `Faltan ${dias} día${dias !== 1 ? 's' : ''}`;
    else if (horas > 0) texto = `Faltan ${horas} hora${horas !== 1 ? 's' : ''}`;
    else texto = `Faltan ${minutos} min`;

    return { dias, horas, minutos, urgencia, texto };
  };

  const [estado, setEstado] = useState(calcular);

  useEffect(() => {
    if (!fechaObjetivo) return;
    // Recalcular cada 60 segundos
    const id = setInterval(() => setEstado(calcular()), 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaObjetivo]);

  return estado;
}
