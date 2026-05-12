# Changelog

## 2.1.0

### Agregado
- Guía técnica en `docs/CODE_GUIDE.md`.
- Atajo `Ctrl + K` / `Cmd + K` para enfocar búsqueda.
- Validación de elementos requeridos del DOM.
- JSDoc para documentar el modelo `User`.

### Mejorado
- `script.js` reorganizado por capas: configuración, storage, estado, acciones, render y eventos.
- Estado centralizado en un objeto `state`.
- Helpers reutilizables para fechas, JSON, debounce, IDs y búsqueda.
- Manejo más seguro de `localStorage`.
- Migración limpia de usuarios antiguos con `nombre` a usuarios nuevos con `name`.

## 2.0.0

### Agregado
- Nueva interfaz visual con glassmorphism, gradientes y diseño responsive.
- Animaciones de entrada, fondo flotante, ripple en botones, toasts y modal.
- Búsqueda en vivo por nombre o email.
- Estadísticas de usuarios, dominios únicos y último cambio.
- Exportación e importación JSON.
- Modo oscuro/claro con preferencia guardada.
- Carga de usuarios demo.
- Modal de confirmación para acciones destructivas.

### Mejorado
- Compatibilidad con datos anteriores guardados como `nombre` y `email`.
- Renderizado seguro de usuarios usando nodos DOM y `textContent`.
- README más completo y visual.
