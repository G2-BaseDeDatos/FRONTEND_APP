import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import styles from './HeroSearch.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// HeroSearch.jsx — Buscador central con debounce y dropdown de resultados
//
// Búsqueda 100% LOCAL sobre el array `articulos` ya cargado.
// No requiere endpoint adicional del backend (GET /api/equipos/buscar no existe).
// El debounce de 300ms previene filtrados excesivos durante la escritura.
//
// Props:
//   articulos       — Array completo de artículos disponibles
//   onResultClick   — Callback cuando el usuario selecciona un resultado del dropdown
//   onSearchChange  — Callback con el texto de búsqueda (para filtrar el grid)
// ──────────────────────────────────────────────────────────────────────────────

export default function HeroSearch({ articulos = [], onResultClick, onSearchChange }) {
  const [query,      setQuery]      = useState('');
  const [resultados, setResultados] = useState([]);
  const [abierto,    setAbierto]    = useState(false);
  const [selIdx,     setSelIdx]     = useState(-1); // navegación por teclado
  const inputRef    = useRef(null);
  const wrapperRef  = useRef(null);
  const debounceRef = useRef(null);

  // Auto-focus al montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cierre al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Búsqueda local con debounce 300ms
  const buscarLocal = useCallback((texto) => {
    const q = texto.trim().toLowerCase();
    onSearchChange?.(q);

    if (!q) {
      setResultados([]);
      setAbierto(false);
      return;
    }

    const encontrados = articulos
      .filter(a =>
        a.NOM_ART?.toLowerCase().includes(q) ||
        a.NOM_CAT?.toLowerCase().includes(q)  ||
        a.COD_ART?.toLowerCase().includes(q)
      )
      .slice(0, 6); // máximo 6 en el dropdown

    setResultados(encontrados);
    setAbierto(encontrados.length > 0);
    setSelIdx(-1);
  }, [articulos, onSearchChange]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscarLocal(val), 300);
  };

  const limpiar = () => {
    setQuery('');
    setResultados([]);
    setAbierto(false);
    onSearchChange?.('');
    inputRef.current?.focus();
  };

  // Navegación por teclado dentro del dropdown
  const handleKeyDown = (e) => {
    if (!abierto) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelIdx(i => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selIdx >= 0) {
      e.preventDefault();
      onResultClick?.(resultados[selIdx]);
      setAbierto(false);
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  };

  const handleResultClick = (art) => {
    setQuery(art.NOM_ART);
    setAbierto(false);
    onResultClick?.(art);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={`${styles.inputContainer} ${abierto ? styles.inputOpen : ''}`}>
        <Search size={20} className={styles.lupaIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          id="busqueda-equipos"
          type="search"
          role="combobox"
          aria-expanded={abierto}
          aria-autocomplete="list"
          aria-controls="busqueda-resultados"
          aria-activedescendant={selIdx >= 0 ? `resultado-${selIdx}` : undefined}
          className={styles.input}
          placeholder="Buscar laptops, proyectores, kits de robótica…"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => resultados.length > 0 && setAbierto(true)}
          autoComplete="off"
        />
        {query && (
          <button
            className={styles.limpiarBtn}
            onClick={limpiar}
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {abierto && resultados.length > 0 && (
        <ul
          id="busqueda-resultados"
          className={styles.dropdown}
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          {resultados.map((art, idx) => (
            <li
              key={art.ID_ART}
              id={`resultado-${idx}`}
              role="option"
              aria-selected={idx === selIdx}
              className={`${styles.dropdownItem} ${idx === selIdx ? styles.dropdownItemSel : ''}`}
              onMouseDown={() => handleResultClick(art)}
            >
              <div className={styles.dropdownAvatar} aria-hidden="true">
                {art.NOM_CAT?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className={styles.dropdownInfo}>
                <span className={styles.dropdownNombre}>{art.NOM_ART}</span>
                <span className={styles.dropdownCat}>{art.NOM_CAT}</span>
              </div>
              <span className={styles.dropdownDisp}>Disponible</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
