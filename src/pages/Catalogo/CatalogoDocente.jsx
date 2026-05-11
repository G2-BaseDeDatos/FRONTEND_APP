import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, PackageOpen, Filter, X } from 'lucide-react';
import styles from './CatalogoDocente.module.css';
import { fetchArticulos } from '../../services/articulosService';
import ArticleDetailModal from '../../components/ArticleDetailModal/ArticleDetailModal';

export default function CatalogoDocente() {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para el modal de detalles
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraer categoría de la URL si existe: ?categoria=1&nombre=Laptops
  const queryParams = new URLSearchParams(location.search);
  const categoriaId = queryParams.get('categoria');
  const categoriaNombre = queryParams.get('nombre');

  useEffect(() => {
    const cargarArticulos = async () => {
      try {
        // En el backend actual de articulosRoutes, GET /api/articulos permite a Docente ver todos.
        const data = await fetchArticulos();
        setArticulos(data);
      } catch (error) {
        console.error('Error al cargar catálogo:', error);
      } finally {
        setCargando(false);
      }
    };
    cargarArticulos();
  }, []);

  const articulosFiltrados = useMemo(() => {
    if (!categoriaId) return articulos;
    return articulos.filter(a => String(a.ID_CAT) === String(categoriaId));
  }, [articulos, categoriaId]);

  const handleLimpiarFiltro = () => {
    navigate('/dashboard/docente/catalogo', { replace: true });
  };

  const handleSolicitarPrestamo = (e, art) => {
    e.stopPropagation(); // Evitar que se abra el modal de detalle
    // Navegar a Préstamos con el ID del artículo preseleccionado en el state
    navigate('/dashboard/docente/prestamos', { 
      state: { preselectArticleId: art.ID_ART } 
    });
  };

  const handleCardClick = (art) => {
    setSelectedArticle(art);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <LayoutGrid size={28} color="#3B82F6" />
          Catálogo de Equipos
        </h1>
        <p className={styles.subtitle}>
          Explora todos los equipos disponibles en el inventario de la facultad.
        </p>
      </div>

      {categoriaNombre && (
        <div className={styles.filtros}>
          <div className={styles.badgeFiltro}>
            <Filter size={16} />
            Filtrando por: {categoriaNombre}
            <button className={styles.btnLimpiar} onClick={handleLimpiarFiltro} title="Quitar filtro">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {cargando ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))
        ) : articulosFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <PackageOpen size={48} color="#CBD5E1" />
            <p>No se encontraron equipos {categoriaNombre ? 'en esta categoría' : ''}.</p>
          </div>
        ) : (
          articulosFiltrados.map(art => {
            const isDisponible = art.EST_ART === 'Disponible';
            return (
              <div 
                key={art.ID_ART} 
                className={styles.card}
                onClick={() => handleCardClick(art)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <PackageOpen size={24} color={isDisponible ? '#10B981' : '#64748B'} />
                  </div>
                  <span className={`${styles.badgeEstado} ${styles[art.EST_ART] || ''}`}>
                    {art.EST_ART}
                  </span>
                </div>
                
                <h3 className={styles.cardTitle} title={art.NOM_ART}>
                  {art.NOM_ART.length > 40 ? art.NOM_ART.substring(0, 40) + '...' : art.NOM_ART}
                </h3>
                <p className={styles.cardCode}>{art.COD_ART}</p>
                
                <button 
                  className={styles.btnSolicitar}
                  disabled={!isDisponible}
                  onClick={(e) => handleSolicitarPrestamo(e, art)}
                >
                  {isDisponible ? 'Solicitar Préstamo' : 'No Disponible'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedArticle(null);
          }}
        />
      )}
    </div>
  );
}
