import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUsuario } from '../../services/authService';
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
  const [rolDetectado,   setRolDetectado]   = useState(null);   // { label, tipo }
  const [errorCorreo,    setErrorCorreo]    = useState('');
  const [errorGeneral,   setErrorGeneral]   = useState('');
  const [cargando,       setCargando]       = useState(false);
  const [shakeError,     setShakeError]     = useState(false);
  const [tarjetaVisible, setTarjetaVisible] = useState(false);

  const correoRef    = useRef(null);
  const contrasenaRef = useRef(null);

  // Animación de entrada de la tarjeta
  useEffect(() => {
    const timer = setTimeout(() => setTarjetaVisible(true), 50);
    return () => clearTimeout(timer);
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

      // Validación local antes de llamar al backend
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
        // POST /api/auth/login → { cor_usu, pas_usu }
        const { token, usuario } = await loginUsuario(correo, contrasena);

        // Guardar sesión en contexto + localStorage
        guardarSesion(token, usuario);

        // Redirección según rol devuelto por el backend (usuario.rol)
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
    // TODO: reemplazar por modal o redirección al formulario de solicitud
    alert(
      '📋 Para solicitar acceso al Sistema de Inventario Académico GITT, ' +
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
            <svg viewBox="0 0 24 24" fill="none" className={styles.iconoAcademico}>
              <path d="M12 3L1 9l11 6 11-6-11-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M5 12v5c0 2 3 4 7 4s7-2 7-4v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="19" cy="9" r="1" fill="currentColor"/>
              <line x1="19" y1="10" x2="19" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
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
                  // Ojo tachado — contraseña visible
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Ojo abierto — contraseña oculta
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error general (credenciales / red) */}
          {errorGeneral && (
            <div className={errorClase} role="alert" aria-live="assertive">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.iconoError}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
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
                <span className={styles.spinner} aria-hidden="true" />
                Ingresando…
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Enlace Solicitar acceso */}
          <div className={styles.enlacesFooter}>
            <button
              type="button"
              className={styles.enlaceTexto}
              onClick={handleSolicitarAcceso}
              tabIndex={0}
              aria-label="Solicitar acceso al sistema"
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
