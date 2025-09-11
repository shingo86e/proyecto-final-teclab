// Búsqueda dinámica de clientes
document.getElementById('busquedaCliente').addEventListener('input', function() {
    const filtro = this.value.trim().toLowerCase();
    const tablaBody = document.querySelector('#tablaClientes tbody');
    tablaBody.innerHTML = '';
    clientes.forEach(cliente => {
        const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`;
        if (
            nombreCompleto.toLowerCase().includes(filtro) ||
            (cliente.celular || '').toLowerCase().includes(filtro)
        ) {
            const fila = document.createElement('tr');
            const celdaCheckbox = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.id = cliente.id;
            celdaCheckbox.appendChild(checkbox);
            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = cliente.nombre || '';
            const celdaApellido = document.createElement('td');
            celdaApellido.textContent = cliente.apellido || '';
            const celdaCelular = document.createElement('td');
            celdaCelular.textContent = cliente.celular || '';
            fila.appendChild(celdaCheckbox);
            fila.appendChild(celdaNombre);
            fila.appendChild(celdaApellido);
            fila.appendChild(celdaCelular);
            tablaBody.appendChild(fila);
        }
    });
});
// Botón cancelar: limpia los campos del formulario y la búsqueda
document.getElementById('btnCancelarCliente').addEventListener('click', function() {
    document.getElementById('formCliente').reset();
    // Si tienes un campo de búsqueda, límpialo aquí (ajusta el id si es necesario)
    const busqueda = document.getElementById('busquedaCliente');
    if (busqueda) busqueda.value = '';
    clienteEditandoId = null;
    limpiarSeleccionCheckboxes && limpiarSeleccionCheckboxes();
});
// Usar la instancia global de Firestore creada en el HTML
let clientes = [];
let clienteEditandoId = null;

document.getElementById('formCliente').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreCliente').value.trim();
    const apellido = document.getElementById('apellidoCliente').value.trim();
    const celular = document.getElementById('celularCliente').value.trim();

    // Validación de celular: debe ser numérico y de 10 dígitos
    if (!/^\d{10}$/.test(celular)) {
        mostrarNotificacionCliente('El celular debe tener exactamente 10 dígitos numéricos.', 'error');
        return;
    }

    if (nombre && apellido && celular) {
        try {
            if (clienteEditandoId) {
                await db.collection('clientes').doc(clienteEditandoId).update({ nombre, apellido, celular });
                mostrarNotificacionCliente('Cliente editado exitosamente.', 'success');
                clienteEditandoId = null;
            } else {
                await db.collection('clientes').add({ nombre, apellido, celular });
                mostrarNotificacionCliente('Cliente registrado exitosamente.', 'success');
            }
            document.getElementById('formCliente').reset();
            limpiarSeleccionCheckboxes();
        } catch (error) {
            mostrarNotificacionCliente('Error al guardar el cliente: ' + error.message, 'error');
        }
    } else {
        mostrarNotificacionCliente('Por favor, completa todos los campos.', 'error');
    }
});

function actualizarListaClientes() {
    const tablaBody = document.querySelector('#tablaClientes tbody');
    tablaBody.innerHTML = '';
    clientes.forEach(cliente => {
        const fila = document.createElement('tr');
        const celdaCheckbox = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.dataset.id = cliente.id;
        celdaCheckbox.appendChild(checkbox);

        const celdaNombre = document.createElement('td');
        celdaNombre.textContent = cliente.nombre || '';
        const celdaApellido = document.createElement('td');
        celdaApellido.textContent = cliente.apellido || '';
        const celdaCelular = document.createElement('td');
        celdaCelular.textContent = cliente.celular || '';

        fila.appendChild(celdaCheckbox);
        fila.appendChild(celdaNombre);
        fila.appendChild(celdaApellido);
        fila.appendChild(celdaCelular);
        tablaBody.appendChild(fila);
    });
}

function limpiarSeleccionCheckboxes() {
    const checkboxes = document.querySelectorAll('#tablaClientes tbody input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}

document.getElementById('btnEditarCliente').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#tablaClientes tbody input[type="checkbox"]');
    const seleccionados = Array.from(checkboxes).filter(cb => cb.checked);
    if (seleccionados.length !== 1) {
        alert('Selecciona UN solo cliente para editar.');
        return;
    }
    checkboxes.forEach(cb => cb.checked = false);
    seleccionados[0].checked = true;
    const id = seleccionados[0].dataset.id;
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        document.getElementById('nombreCliente').value = cliente.nombre;
        document.getElementById('apellidoCliente').value = cliente.apellido;
        document.getElementById('celularCliente').value = cliente.celular;
        clienteEditandoId = cliente.id;
    }
});

document.getElementById('btnEliminarCliente').addEventListener('click', async function() {
    const checkboxes = document.querySelectorAll('#tablaClientes tbody input[type="checkbox"]:checked');
    const idsAEliminar = Array.from(checkboxes).map(cb => cb.dataset.id);
    if (idsAEliminar.length > 0) {
        const confirmar = confirm('¿Estás seguro que deseas eliminar el/los cliente(s) seleccionado(s)? Esta acción no se puede deshacer.');
        if (!confirmar) return;
        try {
            for (const id of idsAEliminar) {
                await db.collection('clientes').doc(id).delete();
            }
            mostrarNotificacionCliente('Cliente(s) eliminado(s) exitosamente.', 'error');
            limpiarSeleccionCheckboxes();
        } catch (error) {
            mostrarNotificacionCliente('Error al eliminar cliente(s): ' + error.message, 'error');
        }
    } else {
        mostrarNotificacionCliente('Selecciona al menos un cliente para eliminar.', 'error');
    }
});

function mostrarNotificacionCliente(mensaje, tipo = 'info') {
    const notificacion = document.getElementById('notificacionCliente');
    notificacion.textContent = mensaje;
    notificacion.style.display = 'block';
    notificacion.style.position = 'fixed';
    notificacion.style.top = '50%';
    notificacion.style.left = '50%';
    notificacion.style.transform = 'translate(-50%, -50%)';
    notificacion.style.zIndex = '9999';
    notificacion.style.padding = '20px 40px';
    notificacion.style.fontSize = '1.2em';
    notificacion.style.borderRadius = '8px';
    notificacion.style.fontWeight = 'bold';
    if (tipo === 'success') {
        notificacion.style.background = '#43a047';
        notificacion.style.color = '#fff';
    } else if (tipo === 'error') {
        notificacion.style.background = '#f44336';
        notificacion.style.color = '#fff';
    } else {
        notificacion.style.background = '#1976d2';
        notificacion.style.color = '#fff';
    }
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 2000);
}

// Restringir el input del campo celular a solo números y máximo 10 dígitos
const celularInput = document.getElementById('celularCliente');
celularInput.addEventListener('input', function() {
    // Eliminar cualquier caracter que no sea número
    this.value = this.value.replace(/[^\d]/g, '');
    // Limitar a 10 dígitos
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
    }
});

// Escuchar cambios en Firestore en tiempo real
db.collection('clientes').onSnapshot(snapshot => {
    clientes = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        clientes.push({
            id: doc.id,
            nombre: data.nombre,
            apellido: data.apellido,
            celular: data.celular
        });
    });
    actualizarListaClientes();
});
