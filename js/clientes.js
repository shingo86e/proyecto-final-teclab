

let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let idActual = clientes.length > 0 ? clientes[clientes.length - 1].id + 1 : 1;
let editandoIdx = null;

document.getElementById('formCliente').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreCliente').value.trim();
    const apellido = document.getElementById('apellidoCliente').value.trim();
    const celular = document.getElementById('celularCliente').value.trim();

    if (nombre && apellido) {
        if (editandoIdx !== null) {
            // Modo edición
            clientes[editandoIdx] = {
                id: clientes[editandoIdx].id,
                nombre,
                apellido,
                celular
            };
            editandoIdx = null;
            mostrarMensaje('Cliente editado correctamente.');
        } else {
            // Modo alta
            const nuevoCliente = {
                id: idActual,
                nombre,
                apellido,
                celular
            };
            clientes.push(nuevoCliente);
            idActual++;
            mostrarMensaje('Cliente agregado correctamente.');
        }
        localStorage.setItem('clientes', JSON.stringify(clientes));
        actualizarListaClientes();
        this.reset();
    } else {
        alert('Por favor, completa nombre y apellido.');
    }
});

// Mostrar mensaje de confirmación
function mostrarMensaje(texto) {
    let div = document.getElementById('mensajeConfirmacion');
    if (!div) {
        div = document.createElement('div');
        div.id = 'mensajeConfirmacion';
        div.style.position = 'fixed';
        div.style.top = '50%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.background = '#4caf50';
        div.style.color = 'white';
        div.style.padding = '16px 32px';
        div.style.borderRadius = '12px';
        div.style.zIndex = '1000';
        div.style.fontSize = '1.2rem';
        div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        document.body.appendChild(div);
    }
    div.textContent = texto;
    if (texto.toLowerCase().includes('eliminado')) {
        div.style.background = '#f44336'; // rojo
    } else {
        div.style.background = '#4caf50'; // verde
    }
    div.style.display = 'block';
    setTimeout(() => {
        div.style.display = 'none';
    }, 2000);
}

function actualizarListaClientes() {
    clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const tablaBody = document.querySelector('#tablaClientes tbody');
    tablaBody.innerHTML = '';
    clientes.forEach((cliente, idx) => {
        const fila = document.createElement('tr');
        const celdaId = document.createElement('td');
        celdaId.textContent = cliente.id;
        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = cliente.nombre;
        const celdaApellido = document.createElement('td');
        celdaApellido.textContent = cliente.apellido;
        const celdaCelular = document.createElement('td');
        celdaCelular.textContent = cliente.celular || '';

        // Botón editar
        const celdaEditar = document.createElement('td');
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.className = 'cancelar_eliminar';
        btnEditar.onclick = function() {
            editarCliente(idx);
        };
        celdaEditar.appendChild(btnEditar);

        // Botón eliminar
        const celdaEliminar = document.createElement('td');
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.className = 'cancelar_eliminar';
        btnEliminar.onclick = function() {
            eliminarCliente(idx);
        };
        celdaEliminar.appendChild(btnEliminar);

        fila.appendChild(celdaId);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaApellido);
        fila.appendChild(celdaCelular);
        fila.appendChild(celdaEditar);
        fila.appendChild(celdaEliminar);
        tablaBody.appendChild(fila);
    });
// Editar cliente
function editarCliente(idx) {
    const cliente = clientes[idx];
    document.getElementById('nombreCliente').value = cliente.nombre;
    document.getElementById('apellidoCliente').value = cliente.apellido;
    document.getElementById('celularCliente').value = cliente.celular;

    // Al guardar, reemplazar el cliente editado
    editandoIdx = idx;
}

// Eliminar cliente
function eliminarCliente(idx) {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
        clientes.splice(idx, 1);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        actualizarListaClientes();
        mostrarMensaje('Cliente eliminado correctamente.');
    }
}
    // Aplicar filtro si hay texto en el input
    const filtro = document.getElementById('buscarClienteInput').value.toLowerCase();
    filtrarClientes(filtro);
}

document.getElementById('buscarClienteInput').addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    filtrarClientes(filtro);
});

function filtrarClientes(filtro) {
    const filas = document.querySelectorAll('#tablaClientes tbody tr');
    let coincidencias = 0;
    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        const coincide = textoFila.includes(filtro);
        fila.style.display = coincide ? '' : 'none';
        if (coincide) coincidencias++;
    });
}

document.addEventListener('DOMContentLoaded', actualizarListaClientes);
