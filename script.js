const formUsuario = document.getElementById("formUsuario");
const nombre = document.getElementById("nombre");
const email = document.getElementById("email");
const tablaUsuarios = document.getElementById("tablaUsuarios");

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let editandoIndex = null;

formUsuario.addEventListener("submit", function (event) {
  event.preventDefault();

  const nuevoUsuario = {
    nombre: nombre.value,
    email: email.value
  };

  if (editandoIndex !== null) {
    usuarios[editandoIndex] = nuevoUsuario;
    editandoIndex = null;
  } else {
    usuarios.push(nuevoUsuario);
  }

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  mostrarUsuarios();

  nombre.value = "";
  email.value = "";
});

function mostrarUsuarios() {
  tablaUsuarios.innerHTML = "";

  usuarios.forEach(function (usuario, index) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${usuario.nombre}</td>
      <td>${usuario.email}</td>
      <td>
        <button class="btn-editar" onclick="editarUsuario(${index})">Editar</button>
        <button class="btn-eliminar" onclick="eliminarUsuario(${index})">Eliminar</button>
      </td>
    `;

    tablaUsuarios.appendChild(fila);
  });
}

function editarUsuario(index) {
  const usuario = usuarios[index];

  nombre.value = usuario.nombre;
  email.value = usuario.email;

  editandoIndex = index;
}

function eliminarUsuario(index) {
  usuarios.splice(index, 1);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  mostrarUsuarios();
}

mostrarUsuarios();