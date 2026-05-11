import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Tag, MapPin, Box, Info } from 'lucide-react';
import { fetchArticuloById } from '../../services/studentService';

export default function DetalleArticuloEstudiante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const data = await fetchArticuloById(id);
        if (data) setArticulo(data);
        else setError('Artículo no encontrado.');
      } catch (err) {
        setError('Error al cargar los detalles del equipo.');
      } finally {
        setCargando(false);
      }
    };
    cargarDetalle();
  }, [id]);

  if (cargando) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Cargando detalle...</div>;
  }

  if (error || !articulo) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#EF4444' }}>{error}</p>
        <button 
          onClick={() => navigate('/dashboard/estudiante/catalogo')}
          style={{ padding: '8px 16px', background: '#3B82F6', color: '#FFF', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <button 
        onClick={() => navigate('/dashboard/estudiante/catalogo')}
        style={{ background: 'none', border: 'none', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', padding: 0 }}
      >
        <ArrowLeft size={18} /> Volver al catálogo
      </button>

      <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ width: '80px', height: '80px', background: '#EFF6FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
            <Package size={40} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0F172A' }}>{articulo.NOM_ART}</h1>
            <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 12px', borderRadius: '999px', fontSize: '14px', fontWeight: 500 }}>
              Código: {articulo.COD_ART}
            </span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '8px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Tag size={20} color="#64748B" />
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 500 }}>{articulo.NOM_CAT || 'N/A'}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={20} color="#64748B" />
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ubicación</p>
              <p style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 500 }}>{articulo.NOM_UBI || 'N/A'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box size={20} color="#64748B" />
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</p>
              <p style={{ margin: 0, fontSize: '16px', color: articulo.EST_ART === 'Disponible' ? '#10B981' : '#F59E0B', fontWeight: 500 }}>
                {articulo.EST_ART || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {articulo.VAL_ART && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '8px 0' }} />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={20} color="#64748B" style={{ marginTop: '2px' }} />
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                  {articulo.VAL_ART}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
