const loginForm = document.getElementById('login-form');

if (loginForm) {
    const loginMessage = document.getElementById('login-message');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        loginMessage.textContent = 'Iniciando sesión...';

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/usuarios/login/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);

                loginMessage.textContent = '¡Inicio de sesión exitoso!';

                window.location.href = 'index.html';
            } else {
                loginMessage.textContent =
                    data.detail || 'Usuario o contraseña incorrectos.';
            }

        } catch (error) {
            console.error(error);

            loginMessage.textContent =
                'No se pudo conectar con el servidor.';
        }
    });
}

const clientesContainer = document.getElementById('clientes-container');

if (clientesContainer) {
    cargarClientes();
}

async function cargarClientes() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await fetch(
            'http://127.0.0.1:8000/api/clientes/',
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


        const clientes = await response.json();


        clientesContainer.innerHTML = '';


        if (clientes.length === 0) {

            clientesContainer.innerHTML = `
                <tr>
                    <td colspan="7">
                        No hay clientes registrados.
                    </td>
                </tr>
            `;

            return;
        }


        clientes.forEach(cliente => {

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${cliente.id}</td>

                <td>
                    <strong>${cliente.razon_social}</strong>
                </td>

                <td>${cliente.ruc}</td>

                <td>${cliente.telefono}</td>

                <td>${cliente.correo}</td>

                <td>${cliente.direccion}</td>

                <td class="actions">

                    <button
                        class="btn-edit"
                        data-id="${cliente.id}">
                        ✏️
                    </button>

                    <button
                        class="btn-delete"
                        data-id="${cliente.id}">
                        🗑️
                    </button>

                </td>
            `;

            clientesContainer.appendChild(fila);

        });


    } catch (error) {

        console.error(error);

        clientesContainer.innerHTML = `
            <tr>
                <td colspan="7">
                    No se pudieron cargar los clientes.
                </td>
            </tr>
        `;

    }
}


const btnNuevoCliente = document.getElementById('btn-nuevo-cliente');
const clienteFormContainer = document.getElementById('cliente-form-container');
const clienteForm = document.getElementById('cliente-form');
const btnCancelarCliente = document.getElementById('btn-cancelar-cliente');
const clienteFormMessage = document.getElementById('cliente-form-message');


if (btnNuevoCliente) {

    btnNuevoCliente.addEventListener('click', function () {

        clienteFormContainer.style.display = 'block';

        btnNuevoCliente.style.display = 'none';

    });

}


if (btnCancelarCliente) {

    btnCancelarCliente.addEventListener('click', function () {

        clienteForm.reset();

        clienteFormContainer.style.display = 'none';

        btnNuevoCliente.style.display = 'block';

        clienteFormMessage.textContent = '';

    });

}


if (clienteForm) {

    clienteForm.addEventListener('submit', async function (event) {

        event.preventDefault();

        const token = localStorage.getItem('access_token');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const cliente = {

            razon_social:
                document.getElementById('razon_social').value,

            ruc:
                document.getElementById('ruc').value,

            telefono:
                document.getElementById('telefono').value,

            correo:
                document.getElementById('correo').value,

            direccion:
                document.getElementById('direccion').value

        };

        clienteFormMessage.textContent = 'Guardando...';

        try {

            let url = 'http://127.0.0.1:8000/api/clientes/';
            let method = 'POST';

            if (clienteEditandoId !== null) {

                url =
                    `http://127.0.0.1:8000/api/clientes/${clienteEditandoId}/`;

                method = 'PATCH';

            }

            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(cliente)
                }
            );

            const data = await response.json();

            if (response.ok) {

                if (clienteEditandoId !== null) {

                    clienteFormMessage.textContent =
                        '✅ Cliente actualizado correctamente.';

                } else {

                    clienteFormMessage.textContent =
                        '✅ Cliente creado correctamente.';

                }

                clienteForm.reset();

                clienteFormContainer.style.display = 'none';

                btnNuevoCliente.style.display = 'block';

                clienteEditandoId = null;

                document.getElementById('form-title').textContent =
                    'Nuevo cliente';

                cargarClientes();

            } else {

                console.error(data);

                clienteFormMessage.textContent =
                    JSON.stringify(data);

            }

        } catch (error) {

            console.error(error);

            clienteFormMessage.textContent =
                'No se pudo conectar con el servidor.';

        }

    });

}

// =========================
// ELIMINAR CLIENTE
// =========================

document.addEventListener('click', async function (event) {

    const button = event.target.closest('.btn-delete');

    if (!button) {
        return;
    }

    const clienteId = button.dataset.id;

    const confirmar = confirm(
        '¿Estás seguro de que deseas eliminar este cliente?'
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
            `http://127.0.0.1:8000/api/clientes/${clienteId}/`,
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

            alert('No se pudo eliminar el cliente.');

            return;
        }


        alert('✅ Cliente eliminado correctamente.');

        cargarClientes();


    } catch (error) {

        console.error(error);

        alert('No se pudo conectar con el servidor.');

    }

});

// =========================
// EDITAR CLIENTE
// =========================

let clienteEditandoId = null;

document.addEventListener('click', async function (event) {

    const button = event.target.closest('.btn-edit');

    if (!button) {
        return;
    }

    const clienteId = button.dataset.id;

    const token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/api/clientes/${clienteId}/`,
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

        const cliente = await response.json();

        clienteEditandoId = cliente.id;

        document.getElementById('razon_social').value =
            cliente.razon_social;

        document.getElementById('ruc').value =
            cliente.ruc;

        document.getElementById('telefono').value =
            cliente.telefono;

        document.getElementById('correo').value =
            cliente.correo;

        document.getElementById('direccion').value =
            cliente.direccion;

        document.getElementById('form-title').textContent =
            'Editar cliente';

        clienteFormContainer.style.display = 'block';

        btnNuevoCliente.style.display = 'none';

        clienteFormMessage.textContent = '';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    } catch (error) {

        console.error(error);

        alert('No se pudo cargar el cliente.');

    }

});

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
            'http://127.0.0.1:8000/api/proveedores/',
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
                ? `http://127.0.0.1:8000/api/proveedores/${proveedorEditandoId}/`
                : 'http://127.0.0.1:8000/api/proveedores/';

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
            `http://127.0.0.1:8000/api/proveedores/${proveedorId}/`,
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
            `http://127.0.0.1:8000/api/proveedores/${proveedorId}/`,
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

