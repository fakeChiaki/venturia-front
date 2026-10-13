# Venturia — Frontend

Interfaz web del proyecto **Venturia**, una plataforma tipo *kickstarter* que conecta creadores de proyectos, desarrolladores y empresas financistas.

Consume la API de Venturia (repositorio `venturia-back`) y adapta la experiencia según el tipo de usuario:

- **Creador**: crea y publica proyectos, negocia ofertas de financiamiento y gestiona su equipo.
- **Empresa**: explora proyectos y realiza ofertas de financiamiento (con barra de progreso hacia la meta).
- **Desarrollador**: explora proyectos que buscan equipo y postula a los roles según su perfil.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite |
| Estado | Pinia |
| Ruteo | Vue Router |
| Estilos | Tailwind CSS |
| HTTP | Axios |
| Gestor de paquetes | **pnpm** |

## Requisitos previos

- Node.js 20+
- pnpm
- El backend de Venturia (`venturia-back`) corriendo (por defecto en `http://localhost:3000`)

## Puesta en marcha local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Ejecutar en modo desarrollo
pnpm run dev
```

La app queda en `http://localhost:5173`.

Por defecto apunta al backend en `http://localhost:3000`. Para usar otra URL de API, define la variable `VITE_API_URL` (por ejemplo en un archivo `.env`):

```bash
VITE_API_URL=http://localhost:3000
```

En producción se compila con `VITE_API_URL=/api`, de modo que las llamadas son relativas y nginx las enruta al backend.

## Comandos

```bash
pnpm run dev        # servidor de desarrollo (Vite)
pnpm run build      # compila a dist/
pnpm run preview    # sirve el build de producción localmente
```

## Estructura

```
src/
├── views/        # páginas (Feed, Login, Register, Perfil, Proyectos, Funding, ...)
├── components/   # componentes reutilizables (cards, layout, comunes)
├── stores/       # stores de Pinia (auth, profile, catalogs)
├── services/     # wrappers de la API (axios)
├── router/       # definición de rutas
└── data/         # constantes y etiquetas
```

## Despliegue

Despliegue continuo vía GitLab CI (`.gitlab-ci.yml`) sobre dos hosts (EC2 y VPS). El pipeline compila el `dist` y lo sirve mediante nginx (con HTTPS), que también actúa como reverse proxy hacia la API en `/api`.
