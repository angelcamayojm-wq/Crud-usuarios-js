# ⚡ CRUD de Usuarios Pro

<p align="center">
  <img src="assets/preview.svg" alt="Vista previa del CRUD de Usuarios Pro" width="900">
</p>

<p align="center">
  <img alt="HTML" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="CSS" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111">
  <img alt="LocalStorage" src="https://img.shields.io/badge/localStorage-ready-8B5CF6?style=for-the-badge">
</p>

Aplicación web para gestionar usuarios con operaciones **CRUD**: crear, leer, actualizar y eliminar.

Está hecha con **HTML, CSS y JavaScript puro**, sin frameworks, con una interfaz moderna, animaciones suaves y persistencia en el navegador usando `localStorage`.

## 🌐 Demo

🔗 **Demo actual:** https://crud-usuarios-js-angeldev.netlify.app/

📦 **Repositorio:** https://github.com/angelcamayojm-wq/Crud-usuarios-js

## ✨ Mejoras principales

| Área | Mejora |
|---|---|
| UI | Diseño tipo glassmorphism, hero section, tarjetas, gradientes y layout responsive |
| Animaciones | Entrada suave, orbes flotantes, botones con ripple, filas animadas, modal y toasts |
| CRUD | Crear, editar, eliminar, cancelar edición y limpiar todos los datos |
| Experiencia | Búsqueda en vivo, estadísticas, usuarios demo, modo oscuro/claro y atajo `Ctrl + K` |
| Datos | Persistencia en `localStorage`, exportación e importación JSON |
| Código | Estado centralizado, helpers reutilizables, validaciones, JSDoc y renderizado seguro |

## 🧠 Funcionalidades

- ➕ Crear usuarios con nombre y correo.
- 🔎 Buscar por nombre o email en tiempo real.
- ✏️ Editar registros sin perder contexto.
- 🗑️ Eliminar con modal de confirmación.
- 🧼 Limpiar todos los usuarios guardados.
- 📤 Exportar usuarios a un archivo `.json`.
- 📥 Importar usuarios desde un archivo `.json`.
- 🌗 Cambiar entre tema oscuro y claro.
- 📊 Ver estadísticas rápidas: total de usuarios, dominios únicos y último cambio.
- 🪄 Cargar usuarios demo para probar la app rápido.
- ⌨️ Usar `Ctrl + K` o `Cmd + K` para enfocar la búsqueda.

## 🧼 Código mejorado

El archivo `script.js` fue reorganizado para que sea más fácil de entender y mantener:

```txt
1. Configuración y helpers
2. Adaptador de almacenamiento
3. Estado de la aplicación
4. Acciones de negocio
5. Renderizado de interfaz
6. Eventos y animaciones
```

También se agregó una guía en [`docs/CODE_GUIDE.md`](docs/CODE_GUIDE.md).

## 🛠️ Tecnologías

```txt
HTML5
CSS3 moderno
JavaScript ES6+
localStorage
```

## 📁 Estructura del proyecto

```txt
Crud-usuarios-js/
├── assets/
│   ├── favicon.svg
│   └── preview.svg
├── docs/
│   └── CODE_GUIDE.md
├── index.html
├── style.css
├── script.js
├── CHANGELOG.md
├── .gitignore
└── README.md
```

## 🚀 Cómo ejecutar el proyecto

No necesitas instalar dependencias. Es un proyecto estático.

```bash
git clone https://github.com/angelcamayojm-wq/Crud-usuarios-js.git
cd Crud-usuarios-js
```

Luego abre `index.html` en tu navegador.

También puedes usar una extensión como **Live Server** en VS Code para verlo con recarga automática.

## 💾 Persistencia

Los usuarios se guardan en el navegador con la clave:

```js
localStorage.getItem("usuarios")
```

Eso significa que los datos quedan guardados en tu navegador, aunque cierres la pestaña.

## 🎨 Animaciones incluidas

- `reveal`: entrada animada de secciones.
- `floatOrb`: movimiento de luces de fondo.
- `ripple`: efecto de onda en botones.
- `rowIn`: aparición de filas en la tabla.
- `modalIn`: entrada del modal.
- `toastIn` y `toastOut`: notificaciones flotantes.
- `spark`: mini celebración al crear usuarios.

## 🧪 Datos para importar

Puedes importar un JSON con esta forma:

```json
[
  {
    "name": "Angel Rivera",
    "email": "angel@dev.com"
  },
  {
    "nombre": "Laura Gómez",
    "email": "laura@studio.com"
  }
]
```

La app acepta `name` o `nombre`, así conserva compatibilidad con versiones anteriores.

## 🧭 Roadmap sugerido

- [ ] Agregar paginación.
- [ ] Añadir ordenamiento por nombre, email o fecha.
- [ ] Conectar con una API real.
- [ ] Agregar autenticación.
- [ ] Publicar una nueva captura real de la interfaz.

## 👨‍💻 Autor

**Angel Rivera**

Desarrollador en formación 🚀

---

Hecho con JavaScript, café imaginario y una cantidad sospechosa de gradientes. ☕✨
