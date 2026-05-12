# 🧼 Guía de código

Esta versión mantiene el proyecto en **HTML, CSS y JavaScript puro**, pero con una organización más profesional.

## 🧱 Capas del `script.js`

| Capa | Para qué sirve |
|---|---|
| Configuración | Claves de `localStorage`, tiempos, usuarios demo y selectores |
| Storage | Lee y guarda usuarios/tema en el navegador |
| Estado | Guarda usuarios, búsqueda, edición activa y confirmaciones |
| Acciones | Crear, actualizar, eliminar, importar, exportar y limpiar |
| Render | Dibuja tabla, estadísticas, toasts, modal y estados vacíos |
| Eventos | Escucha formularios, botones, teclado y acciones de tabla |

## ✅ Buenas prácticas aplicadas

- Se usa `textContent` para pintar datos del usuario y reducir riesgos al mostrar texto.
- Las acciones de tabla usan **event delegation**, así no se crean listeners repetidos.
- Los datos antiguos con `{ nombre, email }` se migran a `{ name, email }`.
- Las validaciones están separadas del render.
- Hay helpers reutilizables como `debounce`, `safeJsonParse`, `formatDate` y `createId`.
- El estado vive en un solo objeto `state`, evitando variables sueltas por toda la app.
- Se agregó JSDoc para documentar la forma de un usuario.

## ⌨️ Atajos

| Atajo | Acción |
|---|---|
| `Ctrl + K` | Enfocar la búsqueda |
| `Cmd + K` | Enfocar la búsqueda en Mac |
| `Escape` | Cancelar edición o cerrar modal |

## 🧪 Ideas para seguir mejorando

- Separar `script.js` en módulos cuando el proyecto crezca.
- Agregar tests unitarios para validaciones y normalización de usuarios.
- Conectar con una API real.
- Añadir paginación y ordenamiento.
