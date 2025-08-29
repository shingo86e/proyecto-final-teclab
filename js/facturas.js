document.getElementById('formFactura').addEventListener('submit', function(e) {
    e.preventDefault();
    const cliente = document.getElementById('cliente').value;
    const producto = document.getElementById('producto').value;
    const cantidad = document.getElementById('cantidad').value;
    const factura = { cliente, producto, cantidad, fecha: new Date().toLocaleString() };

    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    facturas.push(factura);
    localStorage.setItem('facturas', JSON.stringify(facturas));

    mostrarFacturas();
    this.reset();
});

function mostrarFacturas() {
    const lista = document.getElementById('listaFacturas');
    lista.innerHTML = '';
    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    facturas.forEach(f => {
        let li = document.createElement('li');
        li.textContent = `Cliente: ${f.cliente} | Producto: ${f.producto} | Cantidad: ${f.cantidad} | Fecha: ${f.fecha}`;
        lista.appendChild(li);
    });
}
mostrarFacturas();
