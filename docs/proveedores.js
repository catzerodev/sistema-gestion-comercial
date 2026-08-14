
// =========================
// PROVEEDORES - LISTAR
// =========================

const proveedoresContainer =
    document.getElementById('proveedores-container');

if (proveedoresContainer) {
    cargarProveedores();
}

async function cargarProveedores() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/proveedores/`,
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

        const proveedores = await response.json();

        proveedoresContainer.innerHTML = '';

        if (proveedores.length === 0) {

            proveedoresContainer.innerHTML = `
                <tr>
                    <td colspan="7">
                        No hay proveedores registrados.
                    </td>
                </tr>
            `;

            return;
        }

        proveedores.forEach(proveedor => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${proveedor.id}</td>

                <td>
                    <strong>${proveedor.razon_social}</strong>
                </td>

                <td>${proveedor.ruc}</td>

                <td>${proveedor.telefono || '-'}</td>

                <td>${proveedor.correo || '-'}</td>

                <td>${proveedor.direccion || '-'}</td>

                <td class="actions">

                    <button
                        class="btn-edit-proveedor"
                        data-id="${proveedor.id}">
                        ✏️
                    </button>

                    <button
                        class="btn-delete-proveedor"
                        data-id="${proveedor.id}">
                        🗑️
                    </button>

                </td>
            `;

            proveedoresContainer.appendChild(fila);

        });

    } catch (error) {

        console.error(error);

        proveedoresContainer.innerHTML = `
            <tr>
                <td colspan="7">
                    No se pudieron cargar los proveedores.
                </td>
            </tr>
        `;

    }
}

// =========================
// PROVEEDORES - FORMULARIO
// =========================

const btnNuevoProveedor =
    document.getElementById('btn-nuevo-proveedor');

const proveedorFormContainer =
    document.getElementById('proveedor-form-container');

const proveedorForm =
    document.getElementById('proveedor-form');

const btnCancelarProveedor =
    document.getElementById('btn-cancelar-proveedor');

const proveedorFormMessage =
    document.getElementById('proveedor-form-message');


// MOSTRAR FORMULARIO

if (btnNuevoProveedor) {

    btnNuevoProveedor.addEventListener('click', function () {

        proveedorFormContainer.style.display = 'block';

        btnNuevoProveedor.style.display = 'none';

    });

}


// CANCELAR

if (btnCancelarProveedor) {

    btnCancelarProveedor.addEventListener('click', function () {

        proveedorForm.reset();

        proveedorFormContainer.style.display = 'none';

        btnNuevoProveedor.style.display = 'block';

        proveedorFormMessage.textContent = '';

    });

}

// =========================
// PROVEEDORES - CREAR / EDITAR
// =========================

let proveedorEditandoId = null;

if (proveedorForm) {

    proveedorForm.addEventListener('submit', async function (event) {

        event.preventDefault();

        const token = localStorage.getItem('access_token');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const proveedor = {

            razon_social:
                document.getElementById('proveedor-razon_social').value,

            ruc:
                document.getElementById('proveedor-ruc').value,

            telefono:
                document.getElementById('proveedor-telefono').value,

            correo:
                document.getElementById('proveedor-correo').value,

            direccion:
                document.getElementById('proveedor-direccion').value

        };

        const esEdicion = proveedorEditandoId !== null;

        proveedorFormMessage.textContent =
            esEdicion
                ? 'Guardando cambios...'
                : 'Guardando proveedor...';

        try {

            const url = esEdicion
                ? `${API_URL}/api/proveedores/${proveedorEditandoId}/`
                : `${API_URL}/api/proveedores/`;

            const method = esEdicion
                ? 'PATCH'
                : 'POST';

            const response = await fetch(url, {

                method: method,

                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(proveedor)

            });

            const data = await response.json();

            if (response.ok) {

                proveedorFormMessage.textContent =
                    esEdicion
                        ? '✅ Proveedor actualizado correctamente.'
                        : '✅ Proveedor creado correctamente.';

                proveedorForm.reset();

                proveedorFormContainer.style.display = 'none';

                btnNuevoProveedor.style.display = 'block';

                proveedorEditandoId = null;

                document.getElementById(
                    'proveedor-form-title'
                ).textContent = 'Nuevo proveedor';

                document.getElementById(
                    'btn-guardar-proveedor'
                ).textContent = '💾 Guardar proveedor';

                cargarProveedores();

            } else {

                console.error(data);

                proveedorFormMessage.textContent =
                    data.detail ||
                    'No se pudo guardar el proveedor.';

            }

        } catch (error) {

            console.error(error);

            proveedorFormMessage.textContent =
                'No se pudo conectar con el servidor.';

        }

    });

}


// =========================
// PROVEEDORES - EDITAR
// =========================

document.addEventListener('click', async function (event) {

    const button = event.target.closest('.btn-edit-proveedor');

    if (!button) {
        return;
    }

    const proveedorId = button.dataset.id;

    const token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/proveedores/${proveedorId}/`,
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
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const proveedor = await response.json();

        proveedorEditandoId = proveedor.id;

        document.getElementById(
            'proveedor-razon_social'
        ).value = proveedor.razon_social;

        document.getElementById(
            'proveedor-ruc'
        ).value = proveedor.ruc;

        document.getElementById(
            'proveedor-telefono'
        ).value = proveedor.telefono || '';

        document.getElementById(
            'proveedor-correo'
        ).value = proveedor.correo || '';

        document.getElementById(
            'proveedor-direccion'
        ).value = proveedor.direccion || '';

        document.getElementById(
            'proveedor-form-title'
        ).textContent = 'Editar proveedor';

        document.getElementById(
            'btn-guardar-proveedor'
        ).textContent = '💾 Guardar cambios';

        proveedorFormContainer.style.display = 'block';

        btnNuevoProveedor.style.display = 'none';

        proveedorFormMessage.textContent = '';

    } catch (error) {

        console.error(error);

        alert('No se pudo cargar el proveedor.');

    }

});

// =========================
// PROVEEDORES - ELIMINAR
// =========================

document.addEventListener('click', async function (event) {

    const button = event.target.closest('.btn-delete-proveedor');

    if (!button) {
        return;
    }

    const proveedorId = button.dataset.id;

    const confirmar = confirm(
        '¿Estás seguro de que deseas eliminar este proveedor?'
    );

    if (!confirmar) {
        return;
    }

    const token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/proveedores/${proveedorId}/`,
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

        if (!response.ok) {

            const data = await response.json();

            console.error(data);

            alert('No se pudo eliminar el proveedor.');

            return;
        }

        alert('✅ Proveedor eliminado correctamente.');

        cargarProveedores();

    } catch (error) {

        console.error(error);

        alert('No se pudo conectar con el servidor.');

    }

});