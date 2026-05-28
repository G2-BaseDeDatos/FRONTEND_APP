import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUsuario } from '../../services/authService';
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import styles from './Login.module.css';

// ──────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE DOMINIOS INSTITUCIONALES
// Si los dominios cambian, editar únicamente este objeto.
// El campo "label" es lo que se muestra al usuario; "tipo" se usa para aplicar
// el estilo de color correspondiente (admin | docente | estudiante | neutro).
// ──────────────────────────────────────────────────────────────────────────────
const DOMINIOS_INSTITUCIONALES = [
  {
    patron: /@admin\./i,
    label:  'Administrador',
    tipo:   'admin',
  },
  {
    patron: /@docente\./i,
    label:  'Docente',
    tipo:   'docente',
  },
  {
    patron: /@estudiante\./i,
    label:  'Estudiante',
    tipo:   'estudiante',
  },
  // Agrega más dominios aquí según las políticas institucionales
];

/**
 * Detecta el rol preliminar a partir del dominio del correo.
 * @param {string} correo
 * @returns {{ label: string, tipo: string } | null}
 */
function detectarRolPorDominio(correo) {
  if (!correo.includes('@')) return null;
  for (const { patron, label, tipo } of DOMINIOS_INSTITUCIONALES) {
    if (patron.test(correo)) return { label, tipo };
  }
  return { label: 'Rol no identificado', tipo: 'neutro' };
}

/**
 * Valida formato de correo electrónico (RFC 5322 simplificado).
 */
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ──────────────────────────────────────────────────────────────────────────────
// Rutas de redirección por rol (deben coincidir con las rutas en App.jsx)
// ──────────────────────────────────────────────────────────────────────────────
const RUTAS_POR_ROL = {
  Administrador: '/dashboard/admin',
  Docente:       '/dashboard/docente',
  Estudiante:    '/dashboard/estudiante',
  // fallback para roles desconocidos
  default:       '/dashboard',
};

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate          = useNavigate();
  const { guardarSesion } = useAuth();

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [correo,      setCorreo]      = useState('');
  const [contrasena,  setContrasena]  = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);

  // ── Estado de UX ───────────────────────────────────────────────────────────
  const [rolDetectado,   setRolDetectado]   = useState(null);
  const [errorCorreo,    setErrorCorreo]    = useState('');
  const [errorGeneral,   setErrorGeneral]   = useState('');
  const [cargando,       setCargando]       = useState(false);
  const [shakeError,     setShakeError]     = useState(false);
  const [tarjetaVisible, setTarjetaVisible] = useState(false);
  const [formVisible,    setFormVisible]    = useState(false);

  const correoRef    = useRef(null);
  const contrasenaRef = useRef(null);

  // Animación de entrada escalonada
  useEffect(() => {
    const t1 = setTimeout(() => setTarjetaVisible(true), 50);
    const t2 = setTimeout(() => setFormVisible(true), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Detección de rol en tiempo real mientras escribe ───────────────────────
  const handleCorreoChange = useCallback((e) => {
    const valor = e.target.value;
    setCorreo(valor);
    setErrorCorreo('');
    setErrorGeneral('');
    setRolDetectado(valor.length > 3 ? detectarRolPorDominio(valor) : null);
  }, []);

  // ── Validación al perder el foco (onBlur) ─────────────────────────────────
  const handleCorreoBlur = useCallback(() => {
    if (correo && !REGEX_EMAIL.test(correo)) {
      setErrorCorreo('Ingresa un correo electrónico válido');
    }
  }, [correo]);

  // ── Disparar animación de shake + mensaje de error ─────────────────────────
  const mostrarError = useCallback((msg) => {
    setErrorGeneral(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  }, []);

  // ── Submit del formulario ──────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!REGEX_EMAIL.test(correo)) {
        setErrorCorreo('Ingresa un correo electrónico válido');
        correoRef.current?.focus();
        return;
      }
      if (!contrasena.trim()) {
        mostrarError('La contraseña no puede estar vacía');
        contrasenaRef.current?.focus();
        return;
      }

      setCargando(true);
      setErrorGeneral('');

      try {
        const { token, usuario } = await loginUsuario(correo, contrasena);
        guardarSesion(token, usuario);
        const ruta = RUTAS_POR_ROL[usuario.rol] || RUTAS_POR_ROL.default;
        navigate(ruta, { replace: true });
      } catch (err) {
        const status  = err?.status;
        const mensaje = err?.message || 'Error de conexión, inténtalo de nuevo';

        if (status === 401) {
          mostrarError('Correo o contraseña incorrectos');
        } else if (status === 400) {
          mostrarError('Datos inválidos. Verifica el formato del correo');
        } else {
          mostrarError('Error de conexión, inténtalo de nuevo');
        }
      } finally {
        setCargando(false);
      }
    },
    [correo, contrasena, guardarSesion, navigate, mostrarError]
  );

  // ── Placeholder "Solicitar acceso" ─────────────────────────────────────────
  const handleSolicitarAcceso = useCallback(() => {
    alert(
      'Para solicitar acceso al Sistema de Inventario Académico GITT, ' +
      'comunícate con el administrador del sistema o envía tu solicitud al ' +
      'correo: soporte@gitt.edu'
    );
  }, []);

  // ── Clases dinámicas ───────────────────────────────────────────────────────
  const tarjetaClase = [
    styles.tarjeta,
    tarjetaVisible ? styles.tarjetaVisible : '',
  ].join(' ');

  const errorClase = [
    styles.errorGeneral,
    shakeError ? styles.shake : '',
  ].join(' ');

  // ── Renderizado ────────────────────────────────────────────────────────────
  return (
    <div className={styles.fondo}>
      <div className={tarjetaClase} role="main">

        {/* ── Cabecera ──────────────────────────────────────────────────── */}
        <div className={styles.cabecera}>
          <div className={styles.iconoWrapper} aria-hidden="true">
            <GraduationCap size={28} className={styles.iconoAcademico} />
          </div>
          <h1 className={styles.titulo}>Sistema de Inventario Académico</h1>
          <p className={styles.subtitulo}>Inicio de Sesión</p>
        </div>

        {/* ── Formulario ────────────────────────────────────────────────── */}
        <form
          className={styles.formulario}
          onSubmit={handleSubmit}
          noValidate
          aria-label="Formulario de inicio de sesión"
          style={{
            opacity: formVisible ? 1 : 0,
            transform: formVisible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {/* Campo Correo */}
          <div className={styles.campoGrupo}>
            <label htmlFor="correo" className={styles.etiqueta}>
              Correo electrónico
            </label>
            <input
              id="correo"
              ref={correoRef}
              type="email"
              className={`${styles.input} ${errorCorreo ? styles.inputError : ''}`}
              placeholder="usuario@institucion.edu"
              value={correo}
              onChange={handleCorreoChange}
              onBlur={handleCorreoBlur}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              disabled={cargando}
              aria-describedby={errorCorreo ? 'error-correo' : 'rol-detectado'}
            />

            {/* Etiqueta de rol detectado */}
            {rolDetectado && (
              <span
                id="rol-detectado"
                className={`${styles.etiquetaRol} ${styles[`rol-${rolDetectado.tipo}`]}`}
                aria-live="polite"
              >
                <span className={styles.puntito} aria-hidden="true">●</span>
                Rol: {rolDetectado.label}
              </span>
            )}

            {/* Error de formato */}
            {errorCorreo && (
              <span id="error-correo" className={styles.errorCampo} role="alert">
                {errorCorreo}
              </span>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className={styles.campoGrupo}>
            <label htmlFor="contrasena" className={styles.etiqueta}>
              Contraseña
            </label>
            <div className={styles.contrasenaWrapper}>
              <input
                id="contrasena"
                ref={contrasenaRef}
                type={mostrarPass ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => { setContrasena(e.target.value); setErrorGeneral(''); }}
                autoComplete="current-password"
                disabled={cargando}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <button
                type="button"
                className={styles.botonOjo}
                onClick={() => setMostrarPass((v) => !v)}
                tabIndex={0}
                aria-label={mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={cargando}
              >
                {mostrarPass ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Error general (credenciales / red) */}
          {errorGeneral && (
            <div className={errorClase} role="alert" aria-live="assertive">
              <AlertCircle size={18} className={styles.iconoError} />
              {errorGeneral}
            </div>
          )}

          {/* Botón Iniciar Sesión */}
          <button
            id="btn-iniciar-sesion"
            type="submit"
            className={`${styles.botonPrimario} ${!cargando && correo && contrasena ? styles.botonPulse : ''}`}
            disabled={cargando}
            aria-busy={cargando}
          >
            {cargando ? (
              <span className={styles.estadoCarga}>
                <Loader2 size={20} className={styles.spinner} aria-hidden="true" />
                Ingresando…
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Enlaces Footer */}
          <div className={styles.enlacesFooter}>
            <button
              type="button"
              className={styles.enlaceTexto}
              onClick={handleSolicitarAcceso}
              tabIndex={0}
              aria-label="Recuperar contraseña"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <span className={styles.separador} aria-hidden="true">|</span>
            <button
              type="button"
              className={styles.enlaceTexto}
              onClick={handleSolicitarAcceso}
              tabIndex={0}
              aria-label="Solicitar cuenta de acceso"
            >
              Solicitar acceso
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
