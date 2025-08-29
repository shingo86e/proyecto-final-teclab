document.getElementById('formProducto').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const producto = { nombre, precio, stock };

    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.push(producto);
    localStorage.setItem('productos', JSON.stringify(productos));

    mostrarProductos();
    this.reset();
});

function mostrarProductos() {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = '';
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.forEach(p => {
        let li = document.createElement('li');
        li.textContent = `${p.nombre} - $${p.precio} - Stock: ${p.stock}`;
        lista.appendChild(li);
    });
}
mostrarProductos();
