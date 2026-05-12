"use strict";

/**
 * CRUD Usuarios Pro
 * Arquitectura sencilla por capas dentro de un solo archivo:
 * 1. Configuración y helpers
 * 2. Adaptador de almacenamiento
 * 3. Estado de la app
 * 4. Acciones de negocio
 * 5. Renderizado de UI
 * 6. Eventos y animaciones
 *
 * Se mantiene en un solo archivo para que el proyecto siga siendo fácil de abrir
 * con doble clic o Live Server, sin bundlers ni dependencias.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} createdAt
 * @property {string} updatedAt
 */

const APP_CONFIG = Object.freeze({
  storageKey: "usuarios",
  themeKey: "crudUsuariosTheme",
  minNameLength: 2,
  searchDelay: 120,
  toastDuration: 3200,
  demoUsers: [
    { name: "Angel Rivera", email: "angel@dev.com" },
    { name: "Laura Gómez", email: "laura@studio.com" },
    { name: "Mateo Rojas", email: "mateo@cloud.io" },
    { name: "Sofía Torres", email: "sofia@frontend.dev" }
  ]
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit"
});

const selectors = {
  form: "#formUsuario",
  nombre: "#nombre",
  email: "#email",
  tabla: "#tablaUsuarios",
  buscar: "#buscar",
  emptyState: "#emptyState",
  formError: "#formError",
  formTitle: "#formTitle",
  formCard: ".form-card",
  btnGuardar: "#btnGuardar",
  btnCancelar: "#btnCancelar",
  btnDemo: "#btnDemo",
  btnExportar: "#btnExportar",
  btnImportar: "#btnImportar",
  btnLimpiar: "#btnLimpiar",
  archivoImportar: "#archivoImportar",
  themeToggle: "#themeToggle",
  themeIcon: "#themeIcon",
  totalUsuarios: "#totalUsuarios",
  totalDominios: "#totalDominios",
  ultimoCambio: "#ultimoCambio",
  confirmDialog: "#confirmDialog",
  confirmTitle: "#confirmTitle",
  confirmMessage: "#confirmMessage",
  btnDialogCancel: "#btnDialogCancel",
  btnDialogConfirm: "#btnDialogConfirm",
  toastContainer: "#toastContainer",
  panel: "#panel"
};

const $ = (selector, parent = document) => parent.querySelector(selector);

const elements = Object.fromEntries(
  Object.entries(selectors).map(([key, selector]) => [key, $(selector)])
);

const state = {
  /** @type {User[]} */
  users: [],
  editingId: null,
  searchTerm: "",
  pendingConfirmAction: null
};

const storage = {
  /**
   * Lee datos del navegador y migra usuarios antiguos con `{ nombre, email }`.
   * @returns {User[]}
   */
  loadUsers() {
    const parsed = safeJsonParse(localStorage.getItem(APP_CONFIG.storageKey), []);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((user, index) => normalizeUser(user, index))
      .filter(Boolean);
  },

  /**
   * Guarda usuarios en localStorage.
   * @param {User[]} users
   */
  saveUsers(users) {
    try {
      localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(users));
    } catch (error) {
      console.warn("No se pudieron guardar los usuarios:", error);
    }
  },

  loadTheme() {
    return localStorage.getItem(APP_CONFIG.themeKey);
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(APP_CONFIG.themeKey, theme);
    } catch (error) {
      console.warn("No se pudo guardar el tema:", error);
    }
  }
};

bootApp();

function bootApp() {
  assertRequiredElements();
  state.users = storage.loadUsers();
  initTheme();
  bindEvents();
  renderApp();
}

function assertRequiredElements() {
  const missing = Object.entries(elements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Faltan elementos en el HTML: ${missing.join(", ")}`);
  }
}

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);
  elements.nombre.addEventListener("input", clearFormError);
  elements.email.addEventListener("input", clearFormError);
  elements.btnCancelar.addEventListener("click", resetForm);
  elements.buscar.addEventListener("input", debounce(handleSearch, APP_CONFIG.searchDelay));
  elements.tabla.addEventListener("click", handleTableClick);
  elements.btnDemo.addEventListener("click", addDemoUsers);
  elements.btnExportar.addEventListener("click", exportUsers);
  elements.btnImportar.addEventListener("click", () => elements.archivoImportar.click());
  elements.archivoImportar.addEventListener("change", importUsers);
  elements.btnLimpiar.addEventListener("click", requestClearUsers);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.btnDialogCancel.addEventListener("click", closeConfirm);
  elements.btnDialogConfirm.addEventListener("click", confirmCurrentAction);

  document.addEventListener("pointerdown", createRipple);
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

/**
 * @param {SubmitEvent} event
 */
function handleSubmit(event) {
  event.preventDefault();

  const formData = getValidFormData();

  if (!formData) {
    return;
  }

  if (state.editingId) {
    updateUser(state.editingId, formData);
    return;
  }

  createUser(formData);
}

function getValidFormData() {
  const name = elements.nombre.value.trim();
  const email = elements.email.value.trim().toLowerCase();

  if (name.length < APP_CONFIG.minNameLength) {
    return showFormError(`El nombre debe tener mínimo ${APP_CONFIG.minNameLength} caracteres.`);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return showFormError("Escribe un email válido, sin inventos de villano 😅.");
  }

  const emailAlreadyExists = state.users.some(
    (user) => user.email === email && user.id !== state.editingId
  );

  if (emailAlreadyExists) {
    return showFormError("Ya existe un usuario con ese email.");
  }

  clearFormError();
  return { name, email };
}

/**
 * @param {{ name: string, email: string }} payload
 */
function createUser(payload) {
  const now = getCurrentIsoDate();
  const newUser = {
    id: createId(state.users.length),
    ...payload,
    createdAt: now,
    updatedAt: now
  };

  commitUsers([newUser, ...state.users]);
  resetForm();
  renderApp();
  showToast("Usuario creado correctamente 🚀", "success");
  celebrate(elements.btnGuardar);
}

/**
 * @param {string} id
 * @param {{ name: string, email: string }} payload
 */
function updateUser(id, payload) {
  const now = getCurrentIsoDate();
  const nextUsers = state.users.map((user) => {
    if (user.id !== id) {
      return user;
    }

    return {
      ...user,
      ...payload,
      updatedAt: now
    };
  });

  commitUsers(nextUsers);
  resetForm();
  renderApp();
  showToast("Usuario actualizado con flow profesional 😎", "success");
}

/**
 * @param {User[]} nextUsers
 */
function commitUsers(nextUsers) {
  state.users = nextUsers;
  storage.saveUsers(state.users);
}

function renderApp() {
  renderUsers();
  updateStats();
}

function renderUsers() {
  const filteredUsers = getFilteredUsers();

  elements.tabla.replaceChildren();
  elements.emptyState.hidden = filteredUsers.length > 0;

  const fragment = document.createDocumentFragment();

  filteredUsers.forEach((user) => {
    fragment.appendChild(createUserRow(user));
  });

  elements.tabla.appendChild(fragment);
}

function getFilteredUsers() {
  if (!state.searchTerm) {
    return [...state.users];
  }

  return state.users.filter((user) => {
    const searchableText = `${user.name} ${user.email}`.toLowerCase();
    return searchableText.includes(state.searchTerm);
  });
}

/**
 * @param {User} user
 */
function createUserRow(user) {
  const row = document.createElement("tr");
  row.className = "user-row";
  row.dataset.id = user.id;

  const userCell = createTableCell("Usuario");
  userCell.appendChild(createUserInfo(user));

  const emailCell = createTableCell("Email");
  emailCell.appendChild(createPill(user.email, "email-pill"));

  const updatedCell = createTableCell("Actualizado");
  updatedCell.appendChild(createPill(formatDate(user.updatedAt), "date-pill"));

  const actionsCell = createTableCell("Acciones");
  actionsCell.className = "actions-cell";
  actionsCell.append(
    createActionButton("edit", user.id, "Editar", "✏️"),
    createActionButton("delete", user.id, "Eliminar", "🗑️")
  );

  row.append(userCell, emailCell, updatedCell, actionsCell);
  return row;
}

function createTableCell(label) {
  const cell = document.createElement("td");
  cell.dataset.label = label;
  return cell;
}

/**
 * @param {User} user
 */
function createUserInfo(user) {
  const wrapper = document.createElement("div");
  wrapper.className = "user-cell";

  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = getInitials(user.name);

  const info = document.createElement("div");

  const name = document.createElement("span");
  name.className = "user-name";
  name.textContent = user.name;

  const id = document.createElement("span");
  id.className = "user-id";
  id.textContent = `ID ${user.id.slice(0, 8)}`;

  info.append(name, id);
  wrapper.append(avatar, info);

  return wrapper;
}

function createPill(text, className) {
  const pill = document.createElement("span");
  pill.className = className;
  pill.textContent = text;
  return pill;
}

function createActionButton(action, id, text, icon) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `table-action ${action}`;
  button.dataset.action = action;
  button.dataset.id = id;
  button.textContent = `${icon} ${text}`;
  return button;
}

/**
 * @param {PointerEvent | MouseEvent} event
 */
function handleTableClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  const actions = {
    edit: () => startEdit(button.dataset.id),
    delete: () => requestDeleteUser(button.dataset.id)
  };

  actions[button.dataset.action]?.();
}

function startEdit(id) {
  const user = findUserById(id);

  if (!user) {
    showToast("No encontré ese usuario. El duende del DOM hizo de las suyas.", "warning");
    return;
  }

  state.editingId = id;
  elements.nombre.value = user.name;
  elements.email.value = user.email;
  elements.formTitle.textContent = "Editando usuario";
  elements.btnGuardar.innerHTML = '<span aria-hidden="true">✨</span> Actualizar usuario';
  elements.btnCancelar.classList.remove("hidden");
  elements.formCard.classList.add("editing");
  elements.nombre.focus();
  elements.panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  clearFormError();
  elements.formTitle.textContent = "Nuevo usuario";
  elements.btnGuardar.innerHTML = '<span aria-hidden="true">💾</span> Guardar usuario';
  elements.btnCancelar.classList.add("hidden");
  elements.formCard.classList.remove("editing");
}

function requestDeleteUser(id) {
  const user = findUserById(id);

  if (!user) {
    return;
  }

  openConfirm({
    title: "Eliminar usuario",
    message: `Vas a eliminar a ${user.name}. Esta acción no se puede deshacer.`,
    confirmText: "Eliminar",
    onConfirm: () => {
      commitUsers(state.users.filter((item) => item.id !== id));
      renderApp();
      showToast("Usuario eliminado correctamente.", "danger");

      if (state.editingId === id) {
        resetForm();
      }
    }
  });
}

function requestClearUsers() {
  if (!state.users.length) {
    showToast("No hay usuarios para limpiar.", "warning");
    return;
  }

  openConfirm({
    title: "Limpiar todos los usuarios",
    message: "Se borrarán todos los registros guardados en este navegador.",
    confirmText: "Limpiar todo",
    onConfirm: () => {
      commitUsers([]);
      resetForm();
      renderApp();
      showToast("Directorio limpiado. Pantalla fresca 🧼", "warning");
    }
  });
}

function handleSearch() {
  state.searchTerm = elements.buscar.value.trim().toLowerCase();
  renderUsers();
}

function addDemoUsers() {
  const now = getCurrentIsoDate();
  const existingEmails = getEmailSet(state.users);

  const freshUsers = APP_CONFIG.demoUsers
    .filter((user) => !existingEmails.has(user.email.toLowerCase()))
    .map((user, index) => ({
      id: createId(`demo-${index}`),
      name: user.name,
      email: user.email.toLowerCase(),
      createdAt: now,
      updatedAt: now
    }));

  if (!freshUsers.length) {
    showToast("Los usuarios demo ya estaban cargados.", "warning");
    return;
  }

  commitUsers([...freshUsers, ...state.users]);
  renderApp();
  showToast(`${freshUsers.length} usuarios demo cargados.`, "success");
  celebrate(elements.btnDemo);
}

function exportUsers() {
  if (!state.users.length) {
    showToast("No hay datos para exportar.", "warning");
    return;
  }

  const blob = new Blob([JSON.stringify(state.users, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `usuarios-${getCurrentIsoDate().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  showToast("Archivo JSON exportado.", "success");
}

/**
 * @param {Event} event
 */
async function importUsers(event) {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  try {
    const importedUsers = await readUsersFromFile(file);

    if (!importedUsers.length) {
      showToast("No se encontraron usuarios nuevos válidos.", "warning");
      return;
    }

    commitUsers([...importedUsers, ...state.users]);
    renderApp();
    showToast(`${importedUsers.length} usuarios importados.`, "success");
  } catch (error) {
    showToast(error.message || "No se pudo importar el archivo.", "danger");
  } finally {
    elements.archivoImportar.value = "";
  }
}

/**
 * @param {File} file
 * @returns {Promise<User[]>}
 */
async function readUsersFromFile(file) {
  const content = await file.text();
  const parsed = safeJsonParse(content, null);

  if (!Array.isArray(parsed)) {
    throw new Error("El archivo debe contener un arreglo de usuarios.");
  }

  const existingEmails = getEmailSet(state.users);

  return parsed
    .map((user, index) => normalizeUser(user, `import-${index}`))
    .filter(Boolean)
    .filter((user) => {
      if (existingEmails.has(user.email)) {
        return false;
      }

      existingEmails.add(user.email);
      return true;
    });
}

function updateStats() {
  const domains = new Set(
    state.users
      .map((user) => user.email.split("@")[1])
      .filter(Boolean)
  );

  const updatedDates = state.users
    .map((user) => user.updatedAt)
    .sort();

  const latest = updatedDates[updatedDates.length - 1];

  elements.totalUsuarios.textContent = state.users.length;
  elements.totalDominios.textContent = domains.size;
  elements.ultimoCambio.textContent = latest ? formatDate(latest) : "Sin cambios";
}

function openConfirm({ title, message, confirmText, onConfirm }) {
  state.pendingConfirmAction = onConfirm;
  elements.confirmTitle.textContent = title;
  elements.confirmMessage.textContent = message;
  elements.btnDialogConfirm.textContent = confirmText;

  if (typeof elements.confirmDialog.showModal !== "function") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }

    return;
  }

  if (!elements.confirmDialog.open) {
    elements.confirmDialog.showModal();
  }
}

function closeConfirm() {
  state.pendingConfirmAction = null;

  if (elements.confirmDialog.open) {
    elements.confirmDialog.close();
  }
}

function confirmCurrentAction() {
  if (typeof state.pendingConfirmAction === "function") {
    state.pendingConfirmAction();
  }

  closeConfirm();
}

function showFormError(message) {
  elements.formError.textContent = message;
  elements.formCard.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-8px)" },
      { transform: "translateX(8px)" },
      { transform: "translateX(0)" }
    ],
    { duration: 280, easing: "ease-out" }
  );

  return null;
}

function clearFormError() {
  elements.formError.textContent = "";
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("leaving");
  }, APP_CONFIG.toastDuration - 400);

  window.setTimeout(() => {
    toast.remove();
  }, APP_CONFIG.toastDuration);
}

function celebrate(target) {
  const rect = target.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < 18; i += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 18;
    const distance = 44 + Math.random() * 46;

    spark.className = "spark";
    spark.style.setProperty("--left", `${originX}px`);
    spark.style.setProperty("--top", `${originY}px`);
    spark.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--y", `${Math.sin(angle) * distance}px`);

    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 820);
  }
}

/**
 * @param {PointerEvent} event
 */
function createRipple(event) {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest(".btn, .table-action");

  if (!button) {
    return;
  }

  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);

  ripple.className = "ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;

  button.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 650);
}

function handleKeyboardShortcuts(event) {
  const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

  if (isSearchShortcut) {
    event.preventDefault();
    elements.buscar.focus();
    return;
  }

  if (event.key === "Escape") {
    if (elements.confirmDialog.open) {
      closeConfirm();
      return;
    }

    if (state.editingId) {
      resetForm();
    }
  }
}

function initTheme() {
  const savedTheme = storage.loadTheme();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  setTheme(currentTheme === "dark" ? "light" : "dark");
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  storage.saveTheme(theme);
  elements.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function normalizeUser(user, index = 0) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const name = String(user.name || user.nombre || "").trim();
  const email = String(user.email || "").trim().toLowerCase();

  if (name.length < APP_CONFIG.minNameLength || !EMAIL_PATTERN.test(email)) {
    return null;
  }

  const now = getCurrentIsoDate();
  const createdAt = isValidDate(user.createdAt) ? user.createdAt : now;
  const updatedAt = isValidDate(user.updatedAt) ? user.updatedAt : createdAt;

  return {
    id: typeof user.id === "string" && user.id.trim() ? user.id : createId(index),
    name,
    email,
    createdAt,
    updatedAt
  };
}

function createId(seed = "") {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `user-${Date.now()}-${seed}-${Math.random().toString(16).slice(2)}`;
}

function findUserById(id) {
  return state.users.find((user) => user.id === id);
}

function getEmailSet(users) {
  return new Set(users.map((user) => user.email));
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!isValidDate(value)) {
    return "Ahora";
  }

  return dateFormatter.format(new Date(value));
}

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

function getCurrentIsoDate() {
  return new Date().toISOString();
}

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function debounce(callback, delay) {
  let timerId = null;

  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => callback(...args), delay);
  };
}
