/**
 * theme.js — Constantes globales de diseño GITT
 * Paleta de azules institucionales. Usar como referencia
 * única para mantener coherencia visual en todos los módulos.
 */

export const COLORS = {
  // ── Fondos ────────────────────────────────────────────────────────────────
  bgPage:          '#F0F4FF',   // Fondo general de página
  bgCard:          '#FFFFFF',   // Tarjetas y modales
  bgSidebar:       '#0F172A',   // Sidebar oscuro
  bgSidebarActive: '#1E3A8A',   // Ítem activo en sidebar
  bgTableHeader:   '#1E3A8A',   // Cabecera de tablas
  bgTableAlt:      '#F8FAFC',   // Fila alterna de tabla

  // ── Azules ────────────────────────────────────────────────────────────────
  blue900: '#1E3A8A',  // Primario (títulos, fondo de navbar activo)
  blue700: '#1D4ED8',  // Hover de enlaces
  blue500: '#3B82F6',  // Acciones, bordes en foco
  blue400: '#60A5FA',  // Iconos, elementos secundarios
  blue100: '#DBEAFE',  // Fondos de etiquetas/badges
  blue50:  '#EFF6FF',  // Fondos muy claros

  // ── Texto ─────────────────────────────────────────────────────────────────
  textPrimary:    '#1E293B',
  textSecondary:  '#475569',
  textMuted:      '#64748B',
  textSidebarItem:'#94A3B8',
  textWhite:      '#FFFFFF',

  // ── Bordes ────────────────────────────────────────────────────────────────
  borderDefault: '#CBD5E1',
  borderTable:   '#E2E8F0',

  // ── Estados ───────────────────────────────────────────────────────────────
  green:  '#10B981',  // Disponible / Aprobar
  red:    '#EF4444',  // Baja / Rechazar
  amber:  '#F59E0B',  // Mantenimiento
  purple: '#8B5CF6',  // Prestado
};

export const SHADOWS = {
  card:    '0px 4px 12px rgba(0, 0, 0, 0.06)',
  cardHover: '0px 8px 20px rgba(0, 0, 0, 0.10)',
  navbar:  '0px 4px 12px rgba(0, 0, 0, 0.05)',
  button:  '0px 4px 12px rgba(30, 58, 138, 0.30)',
  buttonHover: '0px 6px 18px rgba(30, 58, 138, 0.40)',
  focus:   '0 0 0 3px rgba(59, 130, 246, 0.20)',
};

/**
 * Mapa de color de badge según estado de artículo.
 * Clave: valor exacto devuelto por Oracle (EST_ART).
 */
export const ESTADO_COLORES = {
  Disponible:    { bg: '#DCFCE7', text: '#15803D' },
  Prestado:      { bg: '#EDE9FE', text: '#6D28D9' },
  Mantenimiento: { bg: '#FEF3C7', text: '#B45309' },
  Baja:          { bg: '#FEE2E2', text: '#B91C1C' },
};
