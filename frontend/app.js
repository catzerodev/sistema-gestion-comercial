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


        clienteFormMessage.textContent = 'Guardando cliente...';


        try {

            const response = await fetch(
                'http://127.0.0.1:8000/api/clientes/',
                {
                    method: 'POST',

                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(cliente)
                }
            );


            const data = await response.json();


            if (response.ok) {

                clienteFormMessage.textContent =
                    '✅ Cliente creado correctamente.';

                clienteForm.reset();

                clienteFormContainer.style.display = 'none';

                btnNuevoCliente.style.display = 'block';

                cargarClientes();

            } else {

                console.error(data);

                clienteFormMessage.textContent =
                    data.detail ||
                    'No se pudo crear el cliente.';

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