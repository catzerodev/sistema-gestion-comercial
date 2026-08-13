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

