// =========================
// PRODUCTOS - LISTAR
// =========================

const productosContainer =
    document.getElementById('productos-container');

if (productosContainer) {
    cargarProductos();
}


async function cargarProductos() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await fetch(
            'http://127.0.0.1:8000/api/productos/',
            {
                method: 'GET',

                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );


        if (response.status === 401) {

            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            window.location.href = 'login.html';

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        const productos = await response.json();


        productosContainer.innerHTML = '';


        if (productos.length === 0) {

            productosContainer.innerHTML = `
                <tr>
                    <td colspan="7">
                        No hay productos registrados.
                    </td>
                </tr>
            `;

            return;
        }


        productos.forEach(producto => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${producto.id}</td>

                <td>${producto.codigo || ''}</td>

                <td>
                    <strong>${producto.nombre}</strong>
                </td>

                <td>${producto.marca || ''}</td>

                <td>${producto.unidad}</td>

                <td>${producto.descripcion || ''}</td>

                <td class="actions">

                    <button
                        class="btn-edit-producto"
                        data-id="${producto.id}">
                        ✏️
                    </button>

                    <button
                        class="btn-delete-producto"
                        data-id="${producto.id}">
                        🗑️
                    </button>

                </td>
            `;

            productosContainer.appendChild(fila);

        });


    } catch (error) {

        console.error(error);

        productosContainer.innerHTML = `
            <tr>
                <td colspan="7">
                    No se pudieron cargar los productos.
                </td>
            </tr>
        `;

    }

}


// =========================
// PRODUCTOS - FORMULARIO
// =========================

const btnNuevoProducto =
    document.getElementById('btn-nuevo-producto');

const productoFormContainer =
    document.getElementById('producto-form-container');

const productoForm =
    document.getElementById('producto-form');

const btnCancelarProducto =
    document.getElementById('btn-cancelar-producto');

const productoFormMessage =
    document.getElementById('producto-form-message');


// ID del producto que estamos editando.
// Si es null, significa que estamos creando uno nuevo.

let productoEditandoId = null;


// =========================
// NUEVO PRODUCTO
// =========================

if (btnNuevoProducto) {

    btnNuevoProducto.addEventListener('click', function () {

        productoEditandoId = null;

        productoForm.reset();

        productoFormContainer.style.display = 'block';

        btnNuevoProducto.style.display = 'none';

        document.getElementById(
            'producto-form-title'
        ).textContent = 'Nuevo producto';

        document.getElementById(
            'btn-guardar-producto'
        ).textContent = '💾 Guardar producto';

        productoFormMessage.textContent = '';

    });

}


// =========================
// CANCELAR PRODUCTO
// =========================

if (btnCancelarProducto) {

    btnCancelarProducto.addEventListener('click', function () {

        productoForm.reset();

        productoEditandoId = null;

        productoFormContainer.style.display = 'none';

        btnNuevoProducto.style.display = 'block';

        document.getElementById(
            'producto-form-title'
        ).textContent = 'Nuevo producto';

        document.getElementById(
            'btn-guardar-producto'
        ).textContent = '💾 Guardar producto';

        productoFormMessage.textContent = '';

    });

}


// =========================
// PRODUCTOS - CREAR / EDITAR
// =========================

if (productoForm) {

    productoForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();

            const token = localStorage.getItem('access_token');

            if (!token) {
                window.location.href = 'login.html';
                return;
            }


            const producto = {

                codigo:
                    document.getElementById(
                        'producto-codigo'
                    ).value,

                nombre:
                    document.getElementById(
                        'producto-nombre'
                    ).value,

                marca:
                    document.getElementById(
                        'producto-marca'
                    ).value,

                unidad:
                    document.getElementById(
                        'producto-unidad'
                    ).value,

                descripcion:
                    document.getElementById(
                        'producto-descripcion'
                    ).value

            };


            productoFormMessage.textContent =
                productoEditandoId
                    ? 'Guardando cambios...'
                    : 'Guardando producto...';


            try {

                const url = productoEditandoId
                    ? `http://127.0.0.1:8000/api/productos/${productoEditandoId}/`
                    : 'http://127.0.0.1:8000/api/productos/';


                const method = productoEditandoId
                    ? 'PATCH'
                    : 'POST';


                const response = await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify(producto)
                    }
                );


                const data = await response.json();


                if (response.status === 401) {

                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');

                    window.location.href = 'login.html';

                    return;
                }


                if (response.ok) {

                    productoFormMessage.textContent =
                        productoEditandoId
                            ? '✅ Producto actualizado correctamente.'
                            : '✅ Producto creado correctamente.';


                    productoForm.reset();

                    productoEditandoId = null;


                    document.getElementById(
                        'producto-form-title'
                    ).textContent = 'Nuevo producto';


                    document.getElementById(
                        'btn-guardar-producto'
                    ).textContent = '💾 Guardar producto';


                    productoFormContainer.style.display = 'none';

                    btnNuevoProducto.style.display = 'block';


                    cargarProductos();


                } else {

                    console.error(data);

                    productoFormMessage.textContent =
                        data.detail ||
                        'No se pudo guardar el producto.';

                }


            } catch (error) {

                console.error(error);

                productoFormMessage.textContent =
                    'No se pudo conectar con el servidor.';

            }

        }
    );

}


// =========================
// PRODUCTOS - EDITAR
// =========================

document.addEventListener(
    'click',
    async function (event) {

        const button =
            event.target.closest('.btn-edit-producto');

        if (!button) {
            return;
        }


        const productoId = button.dataset.id;

        const token =
            localStorage.getItem('access_token');


        if (!token) {
            window.location.href = 'login.html';
            return;
        }


        try {

            const response = await fetch(
                `http://127.0.0.1:8000/api/productos/${productoId}/`,
                {
                    method: 'GET',

                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );


            if (response.status === 401) {

                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                window.location.href = 'login.html';

                return;
            }


            if (!response.ok) {

                throw new Error(
                    `Error HTTP: ${response.status}`
                );

            }


            const producto =
                await response.json();


            productoEditandoId =
                producto.id;


            document.getElementById(
                'producto-codigo'
            ).value =
                producto.codigo || '';


            document.getElementById(
                'producto-nombre'
            ).value =
                producto.nombre || '';


            document.getElementById(
                'producto-marca'
            ).value =
                producto.marca || '';


            document.getElementById(
                'producto-unidad'
            ).value =
                producto.unidad || '';


            document.getElementById(
                'producto-descripcion'
            ).value =
                producto.descripcion || '';


            productoFormContainer.style.display =
                'block';

            btnNuevoProducto.style.display =
                'none';


            document.getElementById(
                'producto-form-title'
            ).textContent =
                'Editar producto';


            document.getElementById(
                'btn-guardar-producto'
            ).textContent =
                '💾 Guardar cambios';


            productoFormMessage.textContent =
                '';

        } catch (error) {

            console.error(error);

            alert(
                'No se pudo cargar el producto.'
            );

        }

    }
);

// =========================
// PRODUCTOS - ELIMINAR
// =========================

document.addEventListener(
    'click',
    async function (event) {

        const button =
            event.target.closest('.btn-delete-producto');

        if (!button) {
            return;
        }


        const productoId = button.dataset.id;


        const confirmar = confirm(
            '¿Estás seguro de que deseas eliminar este producto?'
        );


        if (!confirmar) {
            return;
        }


        const token =
            localStorage.getItem('access_token');


        if (!token) {
            window.location.href = 'login.html';
            return;
        }


        try {

            const response = await fetch(
                `http://127.0.0.1:8000/api/productos/${productoId}/`,
                {
                    method: 'DELETE',

                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );


            if (response.status === 401) {

                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                window.location.href = 'login.html';

                return;
            }


            if (response.ok) {

                alert(
                    '✅ Producto eliminado correctamente.'
                );

                cargarProductos();

            } else {

                const data =
                    await response.json();

                console.error(data);

                alert(
                    'No se pudo eliminar el producto.'
                );

            }


        } catch (error) {

            console.error(error);

            alert(
                'No se pudo conectar con el servidor.'
            );

        }

    }
);