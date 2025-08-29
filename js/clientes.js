document.getElementById('formCliente').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const cliente = { nombre, email, telefono };

    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    mostrarClientes();
    this.reset();
});

function mostrarClientes() {
    const lista = document.getElementById('listaClientes');
    lista.innerHTML = '';
    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    clientes.forEach(c => {
        let li = document.createElement('li');
        li.textContent = `${c.nombre} - ${c.email} - ${c.telefono}`;
        lista.appendChild(li);
    });
}
mostrarClientes();
