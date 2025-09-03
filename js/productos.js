let productos = [];
let idActual = 1;
const rutaProductosAPI = 'http://localhost:3000/productos';

async function cargarProductosDesdeServidor() {
  try {
    const response = await fetch(rutaProductosAPI);
    if (response.ok) {
      productos = await response.json();
      idActual = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;
      actualizarListaProductos();
    }
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

function actualizarListaProductos(lista = productos) {
  const tablaBody = document.querySelector('#tablaProductos tbody');
  tablaBody.innerHTML = '';

  lista.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><input type="checkbox" data-id="${producto.id}"></td>
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td>${producto.precio}</td>
      <td>${producto.stock}</td>
      <td>${producto.imagen ? `<img src="${producto.imagen}" style="width:50px;height:50px;">` : 'Sin imagen'}</td>
    `;
    tablaBody.appendChild(fila);
  });

  document.getElementById('mensajeSinResultados').style.display = lista.length === 0 ? 'block' : 'none';
}

document.getElementById('formProducto').addEventListener('submit', async function (event) {
  event.preventDefault();

  const nombre = document.getElementById('nombreProducto').value.trim();
  const precio = parseFloat(document.getElementById('precioProducto').value);
  const stock = parseInt(document.getElementById('stockProducto').value);
  const imagenInput = document.getElementById('imagenProducto');

  if (!nombre || isNaN(precio) || isNaN(stock)) {
    alert('Completa todos los campos obligatorios.');
    return;
  }

  const imagenBase64 = await new Promise(resolve => {
    if (imagenInput.files && imagenInput.files[0]) {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(imagenInput.files[0]);
    } else {
      resolve('');
    }
  });

  const nuevoProducto = {
    id: idActual,
    nombre,
    precio,
    stock,
    imagen: imagenBase64
  };

  productos.push(nuevoProducto);
  idActual++;
  actualizarListaProductos();

  await fetch(rutaProductosAPI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoProducto)
  });

  document.getElementById('formProducto').reset();
});

document.getElementById('buscarProductoInput').addEventListener('input', function () {
  const texto = this.value.toLowerCase();
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
  actualizarListaProductos(filtrados);
});

document.getElementById('eliminarProducto').addEventListener('click', async function () {
  const seleccionados = Array.from(document.querySelectorAll('#tablaProductos input[type="checkbox"]:checked'));
  const idsAEliminar = seleccionados.map(cb => parseInt(cb.dataset.id));

  if (idsAEliminar.length === 0) {
    alert('Selecciona al menos un producto para eliminar.');
    return;
  }

  productos = productos.filter(p => !idsAEliminar.includes(p.id));
  actualizarListaProductos();

  await fetch(rutaProductosAPI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productos)
  });
});

document.addEventListener('DOMContentLoaded', cargarProductosDesdeServidor);
