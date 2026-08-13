// =========================
// DOCUMENTOS - LISTAR
// =========================

const documentosContainer =
    document.getElementById('documentos-container');

let clientesDocumentos = [];

let proveedoresDocumentos = [];


if (documentosContainer) {
    inicializarDocumentos();
}


async function cargarDocumentos() {

    const token =
        localStorage.getItem('access_token');


    if (!token) {
        window.location.href = 'login.html';
        return;
    }


    try {

        const response = await fetch(
            'http://127.0.0.1:8000/api/documentos/',
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


        const documentos =
            await response.json();


        documentosContainer.innerHTML = '';


        if (documentos.length === 0) {

            documentosContainer.innerHTML = `
                <tr>
                    <td colspan="8">
                        No hay documentos registrados.
                    </td>
                </tr>
            `;

            return;
        }


        documentos.forEach(documento => {

            const fila =
                document.createElement('tr');


            fila.innerHTML = `
                <td>${documento.id}</td>

                <td>${documento.tipo}</td>

                <td>${documento.numero}</td>

                <td>${documento.fecha}</td>

                <td>${documento.moneda}</td>

                <td>
                    ${
                        clientesDocumentos.find(
                            cliente => cliente.id === documento.cliente
                        )?.razon_social || ''
                    }
                </td>

                <td>
                    ${
                        proveedoresDocumentos.find(
                            proveedor => proveedor.id === documento.proveedor
                        )?.razon_social || ''
                    }
                </td>

                <td class="actions">

                    <button
                        class="btn-edit-documento"
                        data-id="${documento.id}">
                        ✏️
                    </button>

                    <button
                        class="btn-delete-documento"
                        data-id="${documento.id}">
                        🗑️
                    </button>

                </td>
            `;


            documentosContainer.appendChild(fila);

        });


    } catch (error) {

        console.error(error);


        documentosContainer.innerHTML = `
            <tr>
                <td colspan="8">
                    No se pudieron cargar los documentos.
                </td>
            </tr>
        `;

    }

}


// =========================
// DOCUMENTOS - CARGAR CLIENTES
// =========================

const documentoCliente =
    document.getElementById('documento-cliente');


async function cargarClientesParaDocumento() {

    const token =
        localStorage.getItem('access_token');


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


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        const clientes =
            await response.json();


        clientesDocumentos = clientes;


        documentoCliente.innerHTML = `
            <option value="">
                Sin cliente
            </option>
        `;


        clientes.forEach(cliente => {

            const option =
                document.createElement('option');


            option.value =
                cliente.id;


            option.textContent =
                cliente.razon_social ||
                cliente.nombre ||
                `Cliente ${cliente.id}`;


            documentoCliente.appendChild(option);

        });


    } catch (error) {

        console.error(
            'Error cargando clientes:',
            error
        );

    }

}


// =========================
// DOCUMENTOS - CARGAR PROVEEDORES
// =========================

const documentoProveedor =
    document.getElementById('documento-proveedor');


async function cargarProveedoresParaDocumento() {

    const token =
        localStorage.getItem('access_token');


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


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        const proveedores =
            await response.json();


        proveedoresDocumentos = proveedores;


        documentoProveedor.innerHTML = `
            <option value="">
                Sin proveedor
            </option>
        `;


        proveedores.forEach(proveedor => {

            const option =
                document.createElement('option');


            option.value =
                proveedor.id;


            option.textContent =
                proveedor.razon_social ||
                `Proveedor ${proveedor.id}`;


            documentoProveedor.appendChild(option);

        });


    } catch (error) {

        console.error(
            'Error cargando proveedores:',
            error
        );

    }

}


// =========================
// DOCUMENTOS - FORMULARIO
// =========================

const btnNuevoDocumento =
    document.getElementById('btn-nuevo-documento');

const documentoFormContainer =
    document.getElementById('documento-form-container');

const documentoForm =
    document.getElementById('documento-form');

const btnCancelarDocumento =
    document.getElementById('btn-cancelar-documento');

const documentoFormMessage =
    document.getElementById('documento-form-message');


// =========================
// NUEVO DOCUMENTO
// =========================

if (btnNuevoDocumento) {

    btnNuevoDocumento.addEventListener(
        'click',
        function () {

            documentoEditandoId = null;


            documentoForm.reset();


            documentoFormContainer.style.display =
                'block';


            btnNuevoDocumento.style.display =
                'none';


            document.getElementById(
                'documento-form-title'
            ).textContent =
                'Nuevo documento';


            document.getElementById(
                'btn-guardar-documento'
            ).textContent =
                '💾 Guardar documento';


            documentoFormMessage.textContent =
                '';

        }
    );

}


// =========================
// CANCELAR DOCUMENTO
// =========================

if (btnCancelarDocumento) {

    btnCancelarDocumento.addEventListener(
        'click',
        function () {

            documentoEditandoId = null;


            documentoForm.reset();


            documentoFormContainer.style.display =
                'none';


            btnNuevoDocumento.style.display =
                'block';


            document.getElementById(
                'documento-form-title'
            ).textContent =
                'Nuevo documento';


            document.getElementById(
                'btn-guardar-documento'
            ).textContent =
                '💾 Guardar documento';


            documentoFormMessage.textContent =
                '';

        }
    );

}


// =========================
// DOCUMENTOS - CREAR / EDITAR
// =========================

if (documentoForm) {

    documentoForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();


            const token =
                localStorage.getItem('access_token');


            if (!token) {

                window.location.href =
                    'login.html';

                return;

            }


            const documento = {

                tipo:
                    document.getElementById(
                        'documento-tipo'
                    ).value,

                numero:
                    document.getElementById(
                        'documento-numero'
                    ).value,

                fecha:
                    document.getElementById(
                        'documento-fecha'
                    ).value,

                moneda:
                    document.getElementById(
                        'documento-moneda'
                    ).value,

                cliente:
                    document.getElementById(
                        'documento-cliente'
                    ).value || null,

                proveedor:
                    document.getElementById(
                        'documento-proveedor'
                    ).value || null,

                observaciones:
                    document.getElementById(
                        'documento-observaciones'
                    ).value

            };


            documentoFormMessage.textContent =
                'Guardando documento...';


            try {

                const url =
                    documentoEditandoId
                        ? `http://127.0.0.1:8000/api/documentos/${documentoEditandoId}/`
                        : 'http://127.0.0.1:8000/api/documentos/';


                const method =
                    documentoEditandoId
                        ? 'PATCH'
                        : 'POST';


                const response =
                    await fetch(
                        url,
                        {
                            method: method,

                            headers: {
                                'Authorization':
                                    `Bearer ${token}`,

                                'Content-Type':
                                    'application/json'
                            },

                            body:
                                JSON.stringify(documento)
                        }
                    );


                const data =
                    await response.json();


                if (response.status === 401) {

                    localStorage.removeItem(
                        'access_token'
                    );


                    localStorage.removeItem(
                        'refresh_token'
                    );


                    window.location.href =
                        'login.html';


                    return;

                }


                if (response.ok) {

                    documentoFormMessage.textContent =
                        documentoEditandoId
                            ? '✅ Documento actualizado correctamente.'
                            : '✅ Documento creado correctamente.';


                    documentoForm.reset();


                    documentoEditandoId = null;


                    documentoFormContainer.style.display =
                        'none';


                    btnNuevoDocumento.style.display =
                        'block';


                    document.getElementById(
                        'documento-form-title'
                    ).textContent =
                        'Nuevo documento';


                    document.getElementById(
                        'btn-guardar-documento'
                    ).textContent =
                        '💾 Guardar documento';


                    cargarDocumentos();


                } else {

                    console.error(data);


                    documentoFormMessage.textContent =
                        data.detail ||
                        'No se pudo guardar el documento.';

                }


            } catch (error) {

                console.error(error);


                documentoFormMessage.textContent =
                    'No se pudo conectar con el servidor.';

            }

        }
    );

}


// =========================
// DOCUMENTOS - INICIALIZAR
// =========================

async function inicializarDocumentos() {

    await cargarClientesParaDocumento();

    await cargarProveedoresParaDocumento();

    await cargarDocumentos();

}


// =========================
// DOCUMENTOS - EDITAR
// =========================

let documentoEditandoId = null;


document.addEventListener(
    'click',
    async function (event) {

        const button =
            event.target.closest(
                '.btn-edit-documento'
            );


        if (!button) {
            return;
        }


        const documentoId =
            button.dataset.id;


        const token =
            localStorage.getItem('access_token');


        if (!token) {

            window.location.href =
                'login.html';

            return;

        }


        try {

            const response =
                await fetch(
                    `http://127.0.0.1:8000/api/documentos/${documentoId}/`,
                    {
                        method: 'GET',

                        headers: {
                            'Authorization':
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                );


            if (response.status === 401) {

                localStorage.removeItem(
                    'access_token'
                );


                localStorage.removeItem(
                    'refresh_token'
                );


                window.location.href =
                    'login.html';


                return;

            }


            if (!response.ok) {

                throw new Error(
                    `Error HTTP: ${response.status}`
                );

            }


            const documento =
                await response.json();


            documentoEditandoId =
                documento.id;


            document.getElementById(
                'documento-tipo'
            ).value =
                documento.tipo || '';


            document.getElementById(
                'documento-numero'
            ).value =
                documento.numero || '';


            document.getElementById(
                'documento-fecha'
            ).value =
                documento.fecha || '';


            document.getElementById(
                'documento-moneda'
            ).value =
                documento.moneda || 'PEN';


            document.getElementById(
                'documento-cliente'
            ).value =
                documento.cliente || '';


            document.getElementById(
                'documento-proveedor'
            ).value =
                documento.proveedor || '';


            document.getElementById(
                'documento-observaciones'
            ).value =
                documento.observaciones || '';


            documentoFormContainer.style.display =
                'block';


            btnNuevoDocumento.style.display =
                'none';


            document.getElementById(
                'documento-form-title'
            ).textContent =
                'Editar documento';


            document.getElementById(
                'btn-guardar-documento'
            ).textContent =
                '💾 Guardar cambios';


            documentoFormMessage.textContent =
                '';


        } catch (error) {

            console.error(error);


            alert(
                'No se pudo cargar el documento.'
            );

        }

    }
);


// =========================
// DOCUMENTOS - ELIMINAR
// =========================

document.addEventListener(
    'click',
    async function (event) {

        const button =
            event.target.closest(
                '.btn-delete-documento'
            );


        if (!button) {
            return;
        }


        const documentoId =
            button.dataset.id;


        if (
            !confirm(
                '¿Seguro que deseas eliminar este documento?'
            )
        ) {
            return;
        }


        const token =
            localStorage.getItem('access_token');


        if (!token) {

            window.location.href =
                'login.html';

            return;

        }


        try {

            const response =
                await fetch(
                    `http://127.0.0.1:8000/api/documentos/${documentoId}/`,
                    {
                        method: 'DELETE',

                        headers: {
                            'Authorization':
                                `Bearer ${token}`
                        }
                    }
                );


            if (response.status === 401) {

                localStorage.removeItem(
                    'access_token'
                );


                localStorage.removeItem(
                    'refresh_token'
                );


                window.location.href =
                    'login.html';


                return;

            }


            if (!response.ok) {

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                throw new Error(
                    data.detail ||
                    `Error HTTP: ${response.status}`
                );

            }


            cargarDocumentos();


        } catch (error) {

            console.error(error);


            alert(
                'No se pudo eliminar el documento.'
            );

        }

    }
);