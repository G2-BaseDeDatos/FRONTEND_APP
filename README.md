# Frontend - Proyecto Base de Datos

Este es el cliente frontend para el Proyecto de Base de Datos, construido con **React** y **Vite**. Sigue una estructura modular estándar para facilitar el mantenimiento y la escalabilidad.

## 🚀 Tecnologías Utilizadas

- **React**: Biblioteca para construir interfaces de usuario.
- **Vite**: Herramienta de construcción (build tool) ultra rápida para desarrollo moderno.
- **CSS Vanilla**: Estilos personalizados sin frameworks externos.
- **Fetch API**: Para la comunicación con el servidor backend.

## 🏗️ Estructura de Carpetas

- `src/assets/`: Imágenes, iconos y archivos estáticos.
- `src/components/`: Componentes de UI reutilizables (Botones, Formularios, Navbars).
- `src/pages/`: Vistas principales de la aplicación (Home, Login, Inventario).
- `src/services/`: Lógica de comunicación con el Backend (Clientes de API).
- `App.jsx`: Componente raíz que orquesta la aplicación.
- `main.jsx`: Punto de entrada que renderiza React en el DOM.

## 🛠️ Instalación y Configuración

### 1. Requisitos previos
- Tener instalado [Node.js](https://nodejs.org/).

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (`.env`)
Vite requiere que las variables de entorno comiencen con el prefijo `VITE_`. Crea un archivo `.env` en la raíz de la carpeta `FRONTEND_APP`:

```env
VITE_API_URL=http://localhost:3006
```

## 🏃 Ejecución

- **Modo Desarrollo:**
  ```bash
  npm run dev
  ```
- **Construir para Producción:**
  ```bash
  npm run build
  ```

La aplicación se abrirá por defecto en: `http://localhost:5173`

## 🔗 Comunicación con el Backend
El archivo `src/services/apiClient.js` contiene un cliente base configurado para usar la URL definida en el `.env`. Para usarlo en tus componentes:

```javascript
import { apiClient } from '../services/apiClient';

// Ejemplo de uso:
const data = await apiClient.get('/ruta-ejemplo');
```
