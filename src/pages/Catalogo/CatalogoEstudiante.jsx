import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import EquipmentCard, { EquipmentCardSkeleton } from '../../components/EquipmentCard/EquipmentCard';
import Toast from '../../components/Toast/Toast';
import { fetchArticulos, fetchCategorias } from '../../services/studentService';

export default function CatalogoEstudiante() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catQuery = searchParams.get('categoria') || '';

  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Filtros locales
  const [busqueda, setBusqueda] = useState('');
  const [catSeleccionada, setCatSeleccionada] = useState(catQuery);
  const [soloDisponibles, setSoloDisponibles] = useState(true);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [dataArt, dataCat] = await Promise.all([
        fetchArticulos(), // Trae todos o base
        fetchCategorias()
      ]);
      setArticulos(dataArt);
      setCategorias(dataCat);
    } catch (err) {
      setError('Error al cargar el catálogo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (catQuery !== catSeleccionada) {
      setCatSeleccionada(catQuery);
    }
  }, [catQuery]);

  const articulosFiltrados = useMemo(() => {
    return articulos.filter(a => {
      if (soloDisponibles && a.EST_ART !== 'Disponible') return false;
      if (catSeleccionada && a.ID_CAT?.toString() !== catSeleccionada.toString()) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        return (
          a.NOM_ART?.toLowerCase().includes(q) ||
          a.COD_ART?.toLowerCase().includes(q) ||
          a.NOM_CAT?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [articulos, soloDisponibles, catSeleccionada, busqueda]);

  const handleVerDetalle = (id) => {
    navigate(`/dashboard/estudiante/articulo/${id}`);
  };

  const handleSolicitar = (id) => {
    setToast({ mensaje: 'Funcionalidad de solicitud Próximamente', tipo: 'info' });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#1E3A8A', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package /> Catálogo de Equipos
        </h1>
        <p style={{ color: '#64748B', margin: 0 }}>
          Explora los equipos disponibles para préstamo en la institución.
        </p>
      </header>

      {/* Filtros */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#FFF', 
        padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' 
      }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%', padding: '10px 12px 10px 36px', 
              borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' 
            }}
          />
        </div>
        <div style={{ flex: '0 1 200px' }}>
          <select
            value={catSeleccionada}
            onChange={(e) => {
              setCatSeleccionada(e.target.value);
              if (e.target.value) setSearchParams({ categoria: e.target.value });
              else setSearchParams({});
            }}
            style={{ 
              width: '100%', padding: '10px 12px', 
              borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', background: '#FFF' 
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.ID_CAT} value={c.ID_CAT}>{c.NOM_CAT}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input 
              type="checkbox" 
              checked={soloDisponibles}
              onChange={(e) => setSoloDisponibles(e.target.checked)}
            />
            Solo disponibles
          </label>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
          <button onClick={cargarDatos} style={{ background: 'none', border: 'none', color: '#B91C1C', cursor: 'pointer', textDecoration: 'underline' }}>Reintentar</button>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {cargando ? (
          Array.from({ length: 8 }).map((_, i) => <EquipmentCardSkeleton key={i} />)
        ) : articulosFiltrados.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#F8FAFC', borderRadius: '12px' }}>
            <Filter size={48} color="#CBD5E1" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>No se encontraron equipos</h3>
            <p style={{ margin: 0, color: '#94A3B8' }}>Intenta ajustar tus filtros o buscar otro término.</p>
          </div>
        ) : (
          articulosFiltrados.map((art, idx) => (
            <EquipmentCard
              key={art.ID_ART}
              articulo={art}
              cardIdx={idx}
              onSolicitar={() => handleSolicitar(art.ID_ART)}
            />
          ))
        )}
      </div>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  );
}
