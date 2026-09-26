# Luz Fácil · Precio de la luz (PVPC) en lenguaje claro

Aplicación minimalista que muestra el precio de la luz de hoy en España (tarifa PVPC) y lo traduce a decisiones cotidianas: cuándo poner la lavadora, cuándo esperar.

**Stack:** React 19 · TypeScript · Vite · Gemini API · Cloudflare Pages Functions

## Cómo funciona

- **Datos:** precios horarios de la API de ESIOS (Red Eléctrica), con varios respaldos: un espejo público, un proxy CORS y, si todo falla, una curva estimada para que la app siga funcionando sin conexión.
- **Clasificación:** cada hora se marca como barata, media o cara según los percentiles 30 y 70 del día.
- **Explicación con IA:** Gemini genera una frase corta y comprensible sobre el precio actual (`/api/insight`), con un mensaje de respaldo si la IA no responde.

## Arquitectura y seguridad

```
Navegador (React + Vite)  ──fetch /api/*──►  Cloudflare Pages Functions  ──►  API de Gemini
       sin clave                              GEMINI_API_KEY (variable de entorno)
```

- La clave de Gemini **nunca llega al navegador**. La primera versión, generada con Google AI Studio, la incrustaba en el JavaScript público mediante `define` en `vite.config.ts`. La he movido a funciones de servidor.
- Cada endpoint hace **una sola tarea**, con un prompt fijo y entradas validadas (tipo, longitud, rangos). No es un proxy abierto a Gemini.
- Límite de tamaño en las peticiones y errores genéricos hacia el cliente (el detalle queda en los logs del servidor).

## Ejecutar en local

```bash
npm install
echo "GEMINI_API_KEY=tu_clave" > .dev.vars      # no se sube al repo (.gitignore)
npm run build && npx wrangler pages dev dist     # app + funciones en :8788
```

## Despliegue

Cloudflare Pages: build `npm run build`, salida `dist`, y `GEMINI_API_KEY` como variable de entorno cifrada.
