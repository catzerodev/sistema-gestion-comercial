// =========================
// DOCUMENTOS - VARIABLES
// =========================

const documentosContainer =
    document.getElementById('documentos-container');

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

const documentoFormTitle =
    document.getElementById('documento-form-title');

const btnGuardarDocumento =
    document.getElementById('btn-guardar-documento');

const documentoCliente =
    document.getElementById('documento-cliente');

const documentoProveedor =
    document.getElementById('documento-proveedor');

const detallesContainer =
    document.getElementById('detalles-container');

const btnAgregarDetalle =
    document.getElementById('btn-agregar-detalle');


// =========================
// ESTADO
// =========================

let documentoEditandoId = null;

let clientes = [];
let proveedores = [];
let productos = [];


// IDs de los detalles que existían originalmente
// cuando comenzamos a editar un documento.
let detallesOriginalesIds = new Set();


// =========================
// INICIAR
// =========================

if (documentosContainer) {

    cargarDatosFormulario();

    cargarDocumentos();

}


// =========================
// TOKEN
// =========================

function obtenerToken() {

    const token =
        localStorage.getItem('access_token');


    if (!token) {

        window.location.href =
            'login.html';

        return null;

    }


    return token;

}


// =========================
// FORMATEAR MONEDA
// =========================

function formatearMoneda(
    valor,
    moneda = 'PEN'
) {

    const numero =
        Number(valor) || 0;


    if (moneda === 'USD') {

        return new Intl.NumberFormat(
            'es-PE',
            {
                style: 'currency',
                currency: 'USD'
            }
        ).format(numero);

    }


    return new Intl.NumberFormat(
        'es-PE',
        {
            style: 'currency',
            currency: 'PEN'
        }
    ).format(numero);

}


// =========================
// CALCULAR IMPORTE DE UNA FILA
// =========================

function calcularImporteFila(fila) {

    const cantidadInput =
        fila.querySelector(
            '.detalle-cantidad'
        );


    const precioInput =
        fila.querySelector(
            '.detalle-precio'
        );


    const importeElement =
        fila.querySelector(
            '.detalle-importe'
        );


    if (
        !cantidadInput ||
        !precioInput ||
        !importeElement
    ) {

        return 0;

    }


    const cantidad =
        Number(cantidadInput.value) || 0;


    const precio =
        Number(precioInput.value) || 0;


    const importe =
        cantidad * precio;


    importeElement.textContent =
        formatearMoneda(
            importe,
            document.getElementById(
                'documento-moneda'
            )?.value || 'PEN'
        );


    return importe;

}


// =========================
// CALCULAR TOTAL
// =========================

function calcularTotal() {

    const filas =
        detallesContainer.querySelectorAll(
            '.detalle-row'
        );


    let total = 0;


    filas.forEach(fila => {

        total +=
            calcularImporteFila(
                fila
            );

    });


    const totalElement =
        document.getElementById(
            'documento-total'
        );


    if (totalElement) {

        totalElement.textContent =
            formatearMoneda(
                total,
                document.getElementById(
                    'documento-moneda'
                )?.value || 'PEN'
            );

    }


    return total;

}


// =========================
// ACTUALIZAR MONEDA
// =========================

const documentoMoneda =
    document.getElementById(
        'documento-moneda'
    );


if (documentoMoneda) {

    documentoMoneda.addEventListener(
        'change',
        function () {

            calcularTotal();

        }
    );

}


// =========================
// DOCUMENTOS - LISTAR
// =========================

async function cargarDocumentos() {

    const token =
        obtenerToken();


    if (!token) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/documentos/`,
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


        const documentos =
            await response.json();


        documentosContainer.innerHTML =
            '';


        if (documentos.length === 0) {

            documentosContainer.innerHTML = `
                <tr>
                    <td colspan="10">
                        No hay documentos registrados.
                    </td>
                </tr>
            `;

            return;

        }


        // =========================
        // CARGAR TODOS LOS DETALLES
        // =========================

        let todosLosDetalles = [];


        try {

            const detallesResponse =
                await fetch(
                    `${API_URL}/api/detalle-documentos/`,
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


            if (detallesResponse.ok) {

                todosLosDetalles =
                    await detallesResponse.json();

            }

        } catch (error) {

            console.error(
                'No se pudieron cargar los detalles:',
                error
            );

        }


        documentos.forEach(
            documento => {

                const fila =
                    document.createElement(
                        'tr'
                    );


                const cliente =
                    clientes.find(
                        item =>
                            Number(item.id) ===
                            Number(
                                documento.cliente
                            )
                    );


                const proveedor =
                    proveedores.find(
                        item =>
                            Number(item.id) ===
                            Number(
                                documento.proveedor
                            )
                    );


                // =========================
                // CALCULAR TOTAL DOCUMENTO
                // =========================

                const detallesDocumento =
                    todosLosDetalles.filter(
                        detalle =>
                            Number(
                                detalle.documento
                            ) ===
                            Number(
                                documento.id
                            )
                    );


                const total =
                    detallesDocumento.reduce(
                        (
                            acumulado,
                            detalle
                        ) => {

                            const cantidad =
                                Number(
                                    detalle.cantidad
                                ) || 0;


                            const precio =
                                Number(
                                    detalle.precio_unitario
                                ) || 0;


                            return acumulado +
                                (
                                    cantidad *
                                    precio
                                );

                        },
                        0
                    );


                const operacion =
                    documento.operacion ||
                    'COMPRA';


                const operacionTexto =
                    operacion === 'VENTA'
                        ? '💰 VENTA'
                        : '🛒 COMPRA';


                fila.innerHTML = `

                    <td>
                        ${documento.id}
                    </td>

                    <td>
                        ${documento.tipo || 'FACTURA'}
                    </td>

                    <td>
                        ${operacionTexto}
                    </td>

                    <td>
                        ${documento.numero || ''}
                    </td>

                    <td>
                        ${documento.fecha || ''}
                    </td>

                    <td>
                        ${documento.moneda || 'PEN'}
                    </td>

                    <td>
                        ${
                            cliente
                                ? (
                                    cliente.razon_social ||
                                    cliente.nombre ||
                                    `Cliente ${cliente.id}`
                                )
                                : ''
                        }
                    </td>

                    <td>
                        ${
                            proveedor
                                ? (
                                    proveedor.razon_social ||
                                    `Proveedor ${proveedor.id}`
                                )
                                : ''
                        }
                    </td>

                    <td>

                        <strong>
                            ${
                                formatearMoneda(
                                    total,
                                    documento.moneda ||
                                    'PEN'
                                )
                            }
                        </strong>

                    </td>

                    <td class="actions">

                        <button
                            class="btn-edit-documento"
                            data-id="${documento.id}"
                        >
                            ✏️
                        </button>

                        <button
                            class="btn-delete-documento"
                            data-id="${documento.id}"
                        >
                            🗑️
                        </button>

                    </td>

                `;


                documentosContainer.appendChild(
                    fila
                );

            }
        );


    } catch (error) {

        console.error(error);


        documentosContainer.innerHTML = `

            <tr>

                <td colspan="10">

                    No se pudieron cargar
                    los documentos.

                </td>

            </tr>

        `;

    }

}


// =========================
// CARGAR DATOS FORMULARIO
// =========================

async function cargarDatosFormulario() {

    await Promise.all([
        cargarClientes(),
        cargarProveedores(),
        cargarProductos()
    ]);

}


// =========================
// CARGAR CLIENTES
// =========================

async function cargarClientes() {

    const token =
        obtenerToken();


    if (!token) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/clientes/`,
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


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        clientes =
            await response.json();


        documentoCliente.innerHTML = `

            <option value="">
                Sin cliente
            </option>

        `;


        clientes.forEach(
            cliente => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    cliente.id;


                option.textContent =
                    cliente.razon_social ||
                    cliente.nombre ||
                    `Cliente ${cliente.id}`;


                documentoCliente.appendChild(
                    option
                );

            }
        );


        // =========================
        // AGREGAR CLIENTE
        // =========================

        const crearCliente =
            document.createElement(
                'option'
            );


        crearCliente.value =
            '__crear_cliente__';


        crearCliente.textContent =
            '➕ Agregar cliente';


        documentoCliente.appendChild(
            crearCliente
        );


    } catch (error) {

        console.error(
            'Error cargando clientes:',
            error
        );

    }

}


// =========================
// CARGAR PROVEEDORES
// =========================

async function cargarProveedores() {

    const token =
        obtenerToken();


    if (!token) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/clientes/`,
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


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        proveedores =
            await response.json();


        documentoProveedor.innerHTML = `

            <option value="">
                Sin proveedor
            </option>

        `;


        proveedores.forEach(
            proveedor => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    proveedor.id;


                option.textContent =
                    proveedor.razon_social ||
                    `Proveedor ${proveedor.id}`;


                documentoProveedor.appendChild(
                    option
                );

            }
        );


        // =========================
        // AGREGAR PROVEEDOR
        // =========================

        const crearProveedor =
            document.createElement(
                'option'
            );


        crearProveedor.value =
            '__crear_proveedor__';


        crearProveedor.textContent =
            '➕ Agregar proveedor';


        documentoProveedor.appendChild(
            crearProveedor
        );


    } catch (error) {

        console.error(
            'Error cargando proveedores:',
            error
        );

    }

}


// =========================
// CARGAR PRODUCTOS
// =========================

async function cargarProductos() {

    const token =
        obtenerToken();


    if (!token) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/productos/`,
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


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        productos =
            await response.json();


    } catch (error) {

        console.error(
            'Error cargando productos:',
            error
        );

    }

}


// =========================
// CLIENTE / PROVEEDOR RÁPIDO
// =========================

document.addEventListener(
    'change',
    function (event) {

        if (
            event.target ===
            documentoCliente
        ) {

            if (
                event.target.value ===
                '__crear_cliente__'
            ) {

                event.target.value =
                    '';

                mostrarFormularioEntidadRapida(
                    'cliente'
                );

            }

        }


        if (
            event.target ===
            documentoProveedor
        ) {

            if (
                event.target.value ===
                '__crear_proveedor__'
            ) {

                event.target.value =
                    '';

                mostrarFormularioEntidadRapida(
                    'proveedor'
                );

            }

        }

    }
);


// =========================
// FORMULARIO ENTIDAD RÁPIDA
// =========================

function mostrarFormularioEntidadRapida(
    tipo
) {

    const existente =
        document.getElementById(
            'entidad-rapida-container'
        );


    if (existente) {

        existente.remove();

    }


    const esCliente =
        tipo === 'cliente';


    const titulo =
        esCliente
            ? 'Nuevo cliente'
            : 'Nuevo proveedor';


    const descripcion =
        esCliente
            ? 'Crea el cliente sin salir de la factura.'
            : 'Crea el proveedor sin salir de la factura.';


    const container =
        document.createElement(
            'div'
        );


    container.id =
        'entidad-rapida-container';


    container.className =
        'form-container entidad-rapida';


    container.innerHTML = `

        <div class="form-header">

            <div>

                <h3>
                    ➕ ${titulo}
                </h3>

                <p>
                    ${descripcion}
                </p>

            </div>


            <button
                type="button"
                id="btn-cerrar-entidad-rapida"
            >
                ✕
            </button>

        </div>


        <form
            id="entidad-rapida-form"
        >

            <div class="form-grid">


                <div class="form-group">

                    <label
                        for="rapido-entidad-razon-social"
                    >
                        Razón social
                    </label>

                    <input
                        type="text"
                        id="rapido-entidad-razon-social"
                        required
                    >

                </div>


                <div class="form-group">

                    <label
                        for="rapido-entidad-ruc"
                    >
                        RUC
                    </label>

                    <input
                        type="text"
                        id="rapido-entidad-ruc"
                        maxlength="11"
                        required
                    >

                </div>


                <div class="form-group">

                    <label
                        for="rapido-entidad-telefono"
                    >
                        Teléfono
                    </label>

                    <input
                        type="text"
                        id="rapido-entidad-telefono"
                    >

                </div>


                <div class="form-group">

                    <label
                        for="rapido-entidad-correo"
                    >
                        Correo
                    </label>

                    <input
                        type="email"
                        id="rapido-entidad-correo"
                    >

                </div>


                <div class="form-group">

                    <label
                        for="rapido-entidad-direccion"
                    >
                        Dirección
                    </label>

                    <input
                        type="text"
                        id="rapido-entidad-direccion"
                    >

                </div>


            </div>


            <p
                id="entidad-rapida-message"
            ></p>


            <div class="form-actions">

                <button
                    type="button"
                    id="btn-cancelar-entidad-rapida"
                    class="btn-cancel"
                >
                    Cancelar
                </button>


                <button
                    type="submit"
                    class="btn-save"
                >
                    💾 Crear ${
                        esCliente
                            ? 'cliente'
                            : 'proveedor'
                    }
                </button>

            </div>


        </form>

    `;


    const formularioDocumento =
        document.getElementById(
            'documento-form'
        );


    formularioDocumento.parentNode.insertBefore(
        container,
        formularioDocumento
    );


    const cerrar =
        function () {

            container.remove();

        };


    document
        .getElementById(
            'btn-cerrar-entidad-rapida'
        )
        .addEventListener(
            'click',
            cerrar
        );


    document
        .getElementById(
            'btn-cancelar-entidad-rapida'
        )
        .addEventListener(
            'click',
            cerrar
        );


    document
        .getElementById(
            'entidad-rapida-form'
        )
        .addEventListener(
            'submit',
            async function (event) {

                event.preventDefault();

                await crearEntidadRapida(
                    tipo,
                    container
                );

            }
        );


    document
        .getElementById(
            'rapido-entidad-razon-social'
        )
        .focus();

}


// =========================
// CREAR CLIENTE / PROVEEDOR
// =========================

async function crearEntidadRapida(
    tipo,
    container
) {

    const token =
        obtenerToken();


    if (!token) {

        return;

    }


    const message =
        document.getElementById(
            'entidad-rapida-message'
        );


    const entidad = {

        razon_social:
            document.getElementById(
                'rapido-entidad-razon-social'
            ).value.trim(),

        ruc:
            document.getElementById(
                'rapido-entidad-ruc'
            ).value.trim(),

        telefono:
            document.getElementById(
                'rapido-entidad-telefono'
            ).value.trim(),

        correo:
            document.getElementById(
                'rapido-entidad-correo'
            ).value.trim(),

        direccion:
            document.getElementById(
                'rapido-entidad-direccion'
            ).value.trim()

    };


    message.textContent =
        'Guardando...';


    const endpoint =
        tipo === 'cliente'
            ? `${API_URL}/api/clientes/`
            : `${API_URL}/api/proveedores/`;


    try {

        const response =
            await fetch(
                endpoint,
                {
                    method: 'POST',

                    headers: {

                        'Authorization':
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify(
                            entidad
                        )

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


        if (!response.ok) {

            console.error(
                'Error API:',
                data
            );


            const primerError =
                Object.values(data)[0];


            message.textContent =
                Array.isArray(
                    primerError
                )
                    ? `❌ ${primerError[0]}`
                    : '❌ No se pudo guardar.';


            return;

        }


        if (tipo === 'cliente') {

            clientes.push(data);

        } else {

            proveedores.push(data);

        }


        actualizarSelectEntidades(
            tipo
        );


        const select =
            tipo === 'cliente'
                ? documentoCliente
                : documentoProveedor;


        select.value =
            data.id;


        container.remove();


    } catch (error) {

        console.error(error);


        message.textContent =
            '❌ No se pudo conectar con el servidor.';

    }

}


// =========================
// ACTUALIZAR SELECT CLIENTE/PROVEEDOR
// =========================

function actualizarSelectEntidades(
    tipo
) {

    const select =
        tipo === 'cliente'
            ? documentoCliente
            : documentoProveedor;


    const lista =
        tipo === 'cliente'
            ? clientes
            : proveedores;


    select.innerHTML = `

        <option value="">
            ${
                tipo === 'cliente'
                    ? 'Sin cliente'
                    : 'Sin proveedor'
            }
        </option>

    `;


    lista.forEach(
        item => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                item.id;


            option.textContent =
                item.razon_social ||
                (
                    tipo === 'cliente'
                        ? `Cliente ${item.id}`
                        : `Proveedor ${item.id}`
                );


            select.appendChild(
                option
            );

        }
    );


    const crearOption =
        document.createElement(
            'option'
        );


    crearOption.value =
        tipo === 'cliente'
            ? '__crear_cliente__'
            : '__crear_proveedor__';


    crearOption.textContent =
        tipo === 'cliente'
            ? '➕ Agregar cliente'
            : '➕ Agregar proveedor';


    select.appendChild(
        crearOption
    );

}


// =========================
// NUEVO DOCUMENTO
// =========================

if (btnNuevoDocumento) {

    btnNuevoDocumento.addEventListener(
        'click',
        function () {

            documentoEditandoId =
                null;


            detallesOriginalesIds =
                new Set();


            documentoForm.reset();


            const tipo =
                document.getElementById(
                    'documento-tipo'
                );


            if (tipo) {

                tipo.value =
                    'FACTURA';

            }


            const operacion =
                document.getElementById(
                    'documento-operacion'
                );


            if (operacion) {

                operacion.value =
                    'COMPRA';

            }


            const moneda =
                document.getElementById(
                    'documento-moneda'
                );


            if (moneda) {

                moneda.value =
                    'PEN';

            }


            documentoFormContainer.style.display =
                'block';


            btnNuevoDocumento.style.display =
                'none';


            documentoFormTitle.textContent =
                'Nueva factura';


            btnGuardarDocumento.textContent =
                '💾 Guardar factura';


            documentoFormMessage.textContent =
                '';


            detallesContainer.innerHTML =
                '';


            agregarDetalle();

        }
    );

}


// =========================
// CANCELAR
// =========================

if (btnCancelarDocumento) {

    btnCancelarDocumento.addEventListener(
        'click',
        function () {

            documentoEditandoId =
                null;


            detallesOriginalesIds =
                new Set();


            documentoForm.reset();


            documentoFormContainer.style.display =
                'none';


            btnNuevoDocumento.style.display =
                'block';


            documentoFormMessage.textContent =
                '';


            detallesContainer.innerHTML =
                '';

        }
    );

}



// =========================
// AGREGAR PRODUCTO / DETALLE
// =========================

document.addEventListener(
    'click',
    function (event) {

        const boton =
            event.target.closest(
                '#btn-agregar-detalle'
            );


        if (!boton) {

            return;

        }


        event.preventDefault();


        agregarDetalle();

    }
);


// =========================
// CREAR FILA DETALLE
// =========================

function agregarDetalle(
    productoId = '',
    cantidad = '',
    precioUnitario = '',
    detalleId = null
) {

    const fila =
        document.createElement(
            'tr'
        );


    fila.classList.add(
        'detalle-row'
    );


    if (detalleId) {

        fila.dataset.detalleId =
            detalleId;

    }


    fila.innerHTML = `

        <td>

            <select
                class="detalle-producto"
                required
            >

                <option value="">
                    Seleccionar producto
                </option>

                ${
                    productos
                        .map(
                            producto => `

                                <option
                                    value="${producto.id}"
                                    ${
                                        Number(
                                            producto.id
                                        ) ===
                                        Number(
                                            productoId
                                        )
                                            ? 'selected'
                                            : ''
                                    }
                                >
                                    ${
                                        producto.nombre ||
                                        `Producto ${producto.id}`
                                    }
                                </option>

                            `
                        )
                        .join('')
                }

                <option
                    value="__crear_producto__"
                >
                    ➕ Crear nuevo producto
                </option>

            </select>

        </td>


        <td>

            <input
                type="number"
                class="detalle-cantidad"
                min="0.01"
                step="0.01"
                value="${cantidad}"
                required
            >

        </td>


        <td>

            <input
                type="number"
                class="detalle-precio"
                min="0"
                step="0.01"
                value="${precioUnitario}"
                required
            >

        </td>


        <td>

            <strong
                class="detalle-importe"
            >
                S/ 0.00
            </strong>

        </td>


        <td>

            <button
                type="button"
                class="btn-delete-detalle"
            >
                🗑️
            </button>

        </td>

    `;


    detallesContainer.appendChild(
        fila
    );


    calcularImporteFila(
        fila
    );


    calcularTotal();

}


// =========================
// ACTUALIZAR CÁLCULOS
// =========================

document.addEventListener(
    'input',
    function (event) {

        if (
            event.target.classList.contains(
                'detalle-cantidad'
            ) ||
            event.target.classList.contains(
                'detalle-precio'
            )
        ) {

            const fila =
                event.target.closest(
                    '.detalle-row'
                );


            if (fila) {

                calcularImporteFila(
                    fila
                );

                calcularTotal();

            }

        }

    }
);


// =========================
// CREAR PRODUCTO DESDE DOCUMENTO
// =========================

document.addEventListener(
    'change',
    function (event) {

        const select =
            event.target.closest(
                '.detalle-producto'
            );


        if (!select) {

            return;

        }


        if (
            select.value !==
            '__crear_producto__'
        ) {

            return;

        }


        mostrarFormularioNuevoProducto(
            select
        );

    }
);


// =========================
// FORMULARIO PRODUCTO RÁPIDO
// =========================

function mostrarFormularioNuevoProducto(
    selectProducto
) {

    const existente =
        document.getElementById(
            'producto-rapido-container'
        );


    if (existente) {

        existente.remove();

    }


    const filaProducto =
        selectProducto.closest(
            '.detalle-row'
        );


    if (!filaProducto) {

        return;

    }


    const filaFormulario =
        document.createElement(
            'tr'
        );


    filaFormulario.id =
        'producto-rapido-container';


    filaFormulario.innerHTML = `

        <td colspan="5">

            <div
                class="producto-rapido"
            >

                <div
                    class="producto-rapido-header"
                >

                    <h3>
                        ➕ Nuevo producto
                    </h3>


                    <button
                        type="button"
                        id="btn-cerrar-producto-rapido"
                        class="btn-close-producto-rapido"
                    >
                        ✕
                    </button>

                </div>


                <p
                    class="producto-rapido-description"
                >
                    Crea el producto sin salir del documento.
                </p>


                <form
                    id="producto-rapido-form"
                >

                    <div
                        class="producto-rapido-grid"
                    >

                        <div
                            class="form-group"
                        >

                            <label
                                for="rapido-producto-codigo"
                            >
                                Código
                            </label>

                            <input
                                type="text"
                                id="rapido-producto-codigo"
                            >

                        </div>


                        <div
                            class="form-group"
                        >

                            <label
                                for="rapido-producto-nombre"
                            >
                                Nombre
                            </label>

                            <input
                                type="text"
                                id="rapido-producto-nombre"
                                required
                            >

                        </div>


                        <div
                            class="form-group"
                        >

                            <label
                                for="rapido-producto-marca"
                            >
                                Marca
                            </label>

                            <input
                                type="text"
                                id="rapido-producto-marca"
                            >

                        </div>


                        <div
                            class="form-group"
                        >

                            <label
                                for="rapido-producto-unidad"
                            >
                                Unidad
                            </label>

                            <input
                                type="text"
                                id="rapido-producto-unidad"
                                placeholder="UND"
                                required
                            >

                        </div>


                        <div
                            class="form-group producto-rapido-descripcion"
                        >

                            <label
                                for="rapido-producto-descripcion"
                            >
                                Descripción
                            </label>

                            <textarea
                                id="rapido-producto-descripcion"
                                rows="3"
                            ></textarea>

                        </div>

                    </div>


                    <div
                        id="producto-rapido-message"
                        class="producto-rapido-message"
                    ></div>


                    <div
                        class="producto-rapido-actions"
                    >

                        <button
                            type="button"
                            id="btn-cancelar-producto-rapido"
                            class="btn-cancel"
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            class="btn-save"
                        >
                            💾 Crear producto
                        </button>

                    </div>

                </form>

            </div>

        </td>

    `;


    filaProducto.parentNode.insertBefore(
        filaFormulario,
        filaProducto.nextSibling
    );


    document
        .getElementById(
            'btn-cerrar-producto-rapido'
        )
        .addEventListener(
            'click',
            function () {

                cancelarProductoRapido(
                    selectProducto
                );

            }
        );


    document
        .getElementById(
            'btn-cancelar-producto-rapido'
        )
        .addEventListener(
            'click',
            function () {

                cancelarProductoRapido(
                    selectProducto
                );

            }
        );


    document
        .getElementById(
            'producto-rapido-form'
        )
        .addEventListener(
            'submit',
            async function (event) {

                event.preventDefault();

                await crearProductoRapido(
                    selectProducto
                );

            }
        );


    document
        .getElementById(
            'rapido-producto-nombre'
        )
        .focus();

}


// =========================
// CANCELAR PRODUCTO RÁPIDO
// =========================

function cancelarProductoRapido(
    selectProducto
) {

    const container =
        document.getElementById(
            'producto-rapido-container'
        );


    if (container) {

        container.remove();

    }


    selectProducto.value =
        '';

}


// =========================
// CREAR PRODUCTO RÁPIDO
// =========================

async function crearProductoRapido(
    selectProducto
) {

    const token =
        obtenerToken();


    if (!token) {

        return;

    }


    const message =
        document.getElementById(
            'producto-rapido-message'
        );


    const producto = {

        codigo:
            document.getElementById(
                'rapido-producto-codigo'
            ).value.trim(),

        nombre:
            document.getElementById(
                'rapido-producto-nombre'
            ).value.trim(),

        marca:
            document.getElementById(
                'rapido-producto-marca'
            ).value.trim(),

        unidad:
            document.getElementById(
                'rapido-producto-unidad'
            ).value.trim(),

        descripcion:
            document.getElementById(
                'rapido-producto-descripcion'
            ).value.trim()

    };


    message.textContent =
        'Creando producto...';


    try {

        const response =
            await fetch(
                `${API_URL}/api/productos/`,
                {
                    method: 'POST',

                    headers: {

                        'Authorization':
                            `Bearer ${token}`,

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify(
                            producto
                        )

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


        if (!response.ok) {

            console.error(data);

            message.textContent =
                data.detail ||
                '❌ No se pudo crear el producto.';

            return;

        }


        productos.push(
            data
        );


        selectProducto.innerHTML = `

            <option value="">
                Seleccionar producto
            </option>

            ${
                productos
                    .map(
                        producto => `

                            <option
                                value="${producto.id}"
                            >
                                ${
                                    producto.nombre ||
                                    `Producto ${producto.id}`
                                }
                            </option>

                        `
                    )
                    .join('')
            }

            <option
                value="__crear_producto__"
            >
                ➕ Crear nuevo producto
            </option>

        `;


        selectProducto.value =
            data.id;


        const container =
            document.getElementById(
                'producto-rapido-container'
            );


        if (container) {

            container.remove();

        }


    } catch (error) {

        console.error(error);


        message.textContent =
            '❌ No se pudo conectar con el servidor.';

    }

}


// =========================
// ELIMINAR FILA DE DETALLE
// =========================

document.addEventListener(
    'click',
    function (event) {

        const button =
            event.target.closest(
                '.btn-delete-detalle'
            );


        if (!button) {

            return;

        }


        const fila =
            button.closest(
                '.detalle-row'
            );


        if (fila) {

            fila.remove();

            calcularTotal();

        }

    }
);


// =========================
// GUARDAR DOCUMENTO
// =========================

if (documentoForm) {

    documentoForm.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();


            const token =
                obtenerToken();


            if (!token) {

                return;

            }


            const filas =
                document.querySelectorAll(
                    '.detalle-row'
                );


            if (filas.length === 0) {

                documentoFormMessage.textContent =
                    '⚠️ Agrega al menos un producto.';

                return;

            }


            const detalles = [];


            for (const fila of filas) {

                const producto =
                    fila.querySelector(
                        '.detalle-producto'
                    ).value;


                const cantidad =
                    fila.querySelector(
                        '.detalle-cantidad'
                    ).value;


                const precio =
                    fila.querySelector(
                        '.detalle-precio'
                    ).value;


                if (
                    !producto ||
                    producto ===
                        '__crear_producto__' ||
                    !cantidad ||
                    !precio
                ) {

                    documentoFormMessage.textContent =
                        '⚠️ Completa todos los productos.';

                    return;

                }


                detalles.push({

                    id:
                        fila.dataset.detalleId
                            ? Number(
                                fila.dataset.detalleId
                            )
                            : null,

                    producto:
                        Number(producto),

                    cantidad:
                        Number(cantidad),

                    precio_unitario:
                        Number(precio)

                });

            }


            // =========================
            // DATOS DOCUMENTO
            // =========================

            const documento = {

                tipo:
                    document.getElementById(
                        'documento-tipo'
                    ).value,

                numero:
                    document.getElementById(
                        'documento-numero'
                    ).value.trim(),

                fecha:
                    document.getElementById(
                        'documento-fecha'
                    ).value,

                moneda:
                    document.getElementById(
                        'documento-moneda'
                    ).value,

                operacion:
                    document.getElementById(
                        'documento-operacion'
                    ).value,

                cliente:
                    document.getElementById(
                        'documento-cliente'
                    ).value
                        ? Number(
                            document.getElementById(
                                'documento-cliente'
                            ).value
                        )
                        : null,

                proveedor:
                    document.getElementById(
                        'documento-proveedor'
                    ).value
                        ? Number(
                            document.getElementById(
                                'documento-proveedor'
                            ).value
                        )
                        : null

            };


            documentoFormMessage.textContent =
                'Guardando factura...';


            try {

                // =========================
                // CREAR
                // =========================

                if (!documentoEditandoId) {

                    const response =
                        await fetch(
                            `${API_URL}/api/documentos/`,
                            {
                                method: 'POST',

                                headers: {

                                    'Authorization':
                                        `Bearer ${token}`,

                                    'Content-Type':
                                        'application/json'

                                },

                                body:
                                    JSON.stringify(
                                        documento
                                    )

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        console.error(data);

                        documentoFormMessage.textContent =
                            data.detail ||
                            '❌ No se pudo crear la factura.';

                        return;

                    }


                    const documentoCreado =
                        data;


                    // =========================
                    // CREAR DETALLES
                    // =========================

                    for (
                        const detalle
                        of detalles
                    ) {

                        const detalleResponse =
                            await fetch(
                                `${API_URL}/api/detalle-documentos/`,
                                {
                                    method: 'POST',

                                    headers: {

                                        'Authorization':
                                            `Bearer ${token}`,

                                        'Content-Type':
                                            'application/json'

                                    },

                                    body:
                                        JSON.stringify({

                                            documento:
                                                documentoCreado.id,

                                            producto:
                                                detalle.producto,

                                            cantidad:
                                                detalle.cantidad,

                                            precio_unitario:
                                                detalle.precio_unitario

                                        })

                                }
                            );


                        if (
                            !detalleResponse.ok
                        ) {

                            const error =
                                await detalleResponse.json();


                            console.error(
                                'Error detalle:',
                                error
                            );


                            throw new Error(
                                'No se pudo guardar uno de los productos.'
                            );

                        }

                    }


                    documentoFormMessage.textContent =
                        '✅ Factura creada correctamente.';


                    documentoForm.reset();


                    detallesContainer.innerHTML =
                        '';


                    documentoFormContainer.style.display =
                        'none';


                    btnNuevoDocumento.style.display =
                        'block';


                    documentoEditandoId =
                        null;


                    calcularTotal();


                    cargarDocumentos();


                    return;

                }


                // =========================
                // EDITAR DOCUMENTO
                // =========================

                const response =
                    await fetch(
                        `${API_URL}/api/documentos/${documentoEditandoId}/`,
                        {
                            method: 'PATCH',

                            headers: {

                                'Authorization':
                                    `Bearer ${token}`,

                                'Content-Type':
                                    'application/json'

                            },

                            body:
                                JSON.stringify(
                                    documento
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    console.error(data);

                    documentoFormMessage.textContent =
                        '❌ No se pudo actualizar la factura.';

                    return;

                }


                // =========================
                // SINCRONIZAR DETALLES
                // =========================

                const detallesActualesIds =
                    new Set();


                for (
                    const detalle
                    of detalles
                ) {

                    // -------------------------
                    // EXISTENTE → PATCH
                    // -------------------------

                    if (detalle.id) {

                        detallesActualesIds.add(
                            detalle.id
                        );


                        const detalleResponse =
                            await fetch(
                                `${API_URL}/api/detalle-documentos/${detalle.id}/`,
                                {
                                    method: 'PATCH',

                                    headers: {

                                        'Authorization':
                                            `Bearer ${token}`,

                                        'Content-Type':
                                            'application/json'

                                    },

                                    body:
                                        JSON.stringify({

                                            documento:
                                                documentoEditandoId,

                                            producto:
                                                detalle.producto,

                                            cantidad:
                                                detalle.cantidad,

                                            precio_unitario:
                                                detalle.precio_unitario

                                        })

                                }
                            );


                        if (
                            !detalleResponse.ok
                        ) {

                            throw new Error(
                                'No se pudo actualizar un producto.'
                            );

                        }

                    }


                    // -------------------------
                    // NUEVO → POST
                    // -------------------------

                    else {

                        const detalleResponse =
                            await fetch(
                                `${API_URL}/api/detalle-documentos/`,
                                {
                                    method: 'POST',

                                    headers: {

                                        'Authorization':
                                            `Bearer ${token}`,

                                        'Content-Type':
                                            'application/json'

                                    },

                                    body:
                                        JSON.stringify({

                                            documento:
                                                documentoEditandoId,

                                            producto:
                                                detalle.producto,

                                            cantidad:
                                                detalle.cantidad,

                                            precio_unitario:
                                                detalle.precio_unitario

                                        })

                                }
                            );


                        if (
                            !detalleResponse.ok
                        ) {

                            throw new Error(
                                'No se pudo crear un nuevo producto.'
                            );

                        }

                    }

                }


                // =========================
                // ELIMINAR DETALLES QUITADOS
                // =========================

                for (
                    const detalleId
                    of detallesOriginalesIds
                ) {

                    if (
                        !detallesActualesIds.has(
                            detalleId
                        )
                    ) {

                        const deleteResponse =
                            await fetch(
                                `${API_URL}/api/detalle-documentos/${detalleId}/`,
                                {
                                    method: 'DELETE',

                                    headers: {
                                        'Authorization':
                                            `Bearer ${token}`
                                    }
                                }
                            );


                        if (
                            !deleteResponse.ok
                        ) {

                            throw new Error(
                                'No se pudo eliminar un producto del documento.'
                            );

                        }

                    }

                }


                documentoFormMessage.textContent =
                    '✅ Factura actualizada correctamente.';


                documentoEditandoId =
                    null;


                detallesOriginalesIds =
                    new Set();


                documentoForm.reset();


                detallesContainer.innerHTML =
                    '';


                documentoFormContainer.style.display =
                    'none';


                btnNuevoDocumento.style.display =
                    'block';


                cargarDocumentos();

            }


            catch (error) {

                console.error(error);


                documentoFormMessage.textContent =
                    `❌ ${
                        error.message ||
                        'No se pudo conectar con el servidor.'
                    }`;

            }

        }
    );

}

// =========================
// EDITAR DOCUMENTO
// =========================

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
            obtenerToken();


        if (!token) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/documentos/${documentoId}/`,
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
                documento.tipo ||
                'FACTURA';


            document.getElementById(
                'documento-operacion'
            ).value =
                documento.operacion ||
                'COMPRA';


            document.getElementById(
                'documento-numero'
            ).value =
                documento.numero ||
                '';


            document.getElementById(
                'documento-fecha'
            ).value =
                documento.fecha ||
                '';


            document.getElementById(
                'documento-moneda'
            ).value =
                documento.moneda ||
                'PEN';


            document.getElementById(
                'documento-cliente'
            ).value =
                documento.cliente ||
                '';


            document.getElementById(
                'documento-proveedor'
            ).value =
                documento.proveedor ||
                '';


            documentoFormContainer.style.display =
                'block';


            btnNuevoDocumento.style.display =
                'none';


            documentoFormTitle.textContent =
                'Editar factura';


            btnGuardarDocumento.textContent =
                '💾 Guardar cambios';


            documentoFormMessage.textContent =
                '';


            detallesOriginalesIds =
                new Set();


            detallesContainer.innerHTML =
                '';


            await cargarDetallesDocumento(
                documento.id
            );


            calcularTotal();


        } catch (error) {

            console.error(error);


            alert(
                'No se pudo cargar el documento.'
            );

        }

    }
);


// =========================
// CARGAR DETALLES
// =========================

async function cargarDetallesDocumento(
    documentoId
) {

    const token =
        obtenerToken();


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/detalle-documentos/`,
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


        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }


        const todosLosDetalles =
            await response.json();


        // Filtramos solamente los detalles
        // pertenecientes a este documento.

        const detalles =
            todosLosDetalles.filter(
                detalle =>
                    Number(
                        detalle.documento
                    ) ===
                    Number(
                        documentoId
                    )
            );


        detallesContainer.innerHTML =
            '';


        detallesOriginalesIds =
            new Set();


        detalles.forEach(
            detalle => {

                detallesOriginalesIds.add(
                    Number(
                        detalle.id
                    )
                );


                agregarDetalle(

                    detalle.producto,

                    detalle.cantidad,

                    detalle.precio_unitario,

                    detalle.id

                );

            }
        );


        calcularTotal();


    } catch (error) {

        console.error(
            'Error cargando detalles:',
            error
        );

    }

}


// =========================
// ELIMINAR DOCUMENTO
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


        const confirmar =
            confirm(
                '¿Seguro que deseas eliminar esta factura?'
            );


        if (!confirmar) {
            return;
        }


        const token =
            obtenerToken();


        if (!token) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/documentos/${documentoId}/`,
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

                throw new Error(
                    `Error HTTP: ${response.status}`
                );

            }


            cargarDocumentos();


        } catch (error) {

            console.error(error);


            alert(
                'No se pudo eliminar la factura.'
            );

        }

    }
);

// =====================================================
// VISOR DE PRODUCTOS
// =====================================================

const visorProductoInput =
    document.getElementById('visor-producto');

const visorOperacionSelect =
    document.getElementById('visor-operacion');

const btnBuscarProducto =
    document.getElementById('btn-buscar-producto');

const visorProductosVacio =
    document.getElementById('visor-productos-vacio');

const visorProductosResultados =
    document.getElementById('visor-productos-resultados');


// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizarTexto(texto) {

    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

}


// =====================================================
// MOSTRAR ESTADO INICIAL
// =====================================================

function mostrarEstadoInicialVisor() {

    if (visorProductosResultados) {

        visorProductosResultados.innerHTML = '';

        visorProductosResultados.style.display =
            'none';

    }


    if (visorProductosVacio) {

        visorProductosVacio.style.display =
            'block';

        visorProductosVacio.innerHTML = `

            <div class="viewer-empty-icon">
                📦
            </div>

            <h3>
                Busca un producto
            </h3>

            <p>
                Escribe el nombre de un producto para
                consultar sus compras y ventas.
            </p>

        `;

    }

}


// =====================================================
// PRODUCTO NO ENCONTRADO
// =====================================================

function mostrarProductoNoEncontrado() {

    if (visorProductosResultados) {

        visorProductosResultados.innerHTML = '';

        visorProductosResultados.style.display =
            'none';

    }


    if (visorProductosVacio) {

        visorProductosVacio.style.display =
            'block';

        visorProductosVacio.innerHTML = `

            <div class="viewer-empty-icon">
                🔍
            </div>

            <h3>
                Producto no encontrado
            </h3>

            <p>
                No encontramos ningún producto que
                coincida con tu búsqueda.
            </p>

        `;

    }

}


// =====================================================
// SIN MOVIMIENTOS
// =====================================================

function mostrarSinMovimientos(
    productosEncontrados,
    operacionSeleccionada
) {

    const nombreProducto =
        productosEncontrados[0]?.nombre ||
        'este producto';


    if (visorProductosVacio) {

        visorProductosVacio.style.display =
            'block';

        visorProductosVacio.innerHTML = `

            <div class="viewer-empty-icon">
                📋
            </div>

            <h3>
                Sin movimientos
            </h3>

            <p>

                ${
                    operacionSeleccionada
                        ? (
                            operacionSeleccionada === 'COMPRA'
                                ? 'No existen compras registradas para '
                                : 'No existen ventas registradas para '
                        )
                        : 'No existen movimientos registrados para '
                }

                <strong>
                    ${nombreProducto}
                </strong>.

            </p>

        `;

    }


    if (visorProductosResultados) {

        visorProductosResultados.innerHTML = '';

        visorProductosResultados.style.display =
            'none';

    }

}


// =====================================================
// BUSCAR PRODUCTO
// =====================================================

async function buscarProductoVisor() {

    console.log(
        '🔎 Iniciando búsqueda del visor...'
    );


    const textoBusqueda =
        normalizarTexto(
            visorProductoInput?.value
        );


    const operacionSeleccionada =
        visorOperacionSelect?.value || '';


    console.log(
        'Producto:',
        textoBusqueda
    );

    console.log(
        'Operación:',
        operacionSeleccionada
    );


    // ---------------------------------------------
    // VALIDAR BÚSQUEDA
    // ---------------------------------------------

    if (!textoBusqueda) {

        mostrarEstadoInicialVisor();

        return;

    }


    // ---------------------------------------------
    // TOKEN
    // ---------------------------------------------

    const token =
        obtenerToken();


    if (!token) {

        return;

    }


    // ---------------------------------------------
    // MOSTRAR CARGANDO
    // ---------------------------------------------

    if (visorProductosVacio) {

        visorProductosVacio.style.display =
            'block';

        visorProductosVacio.innerHTML = `

            <div class="viewer-empty-icon">
                🔎
            </div>

            <h3>
                Buscando...
            </h3>

            <p>
                Consultando movimientos del producto.
            </p>

        `;

    }


    if (visorProductosResultados) {

        visorProductosResultados.innerHTML = '';

        visorProductosResultados.style.display =
            'none';

    }


    try {

        // =========================================
        // 1. OBTENER PRODUCTOS
        // =========================================

        const productosResponse =
            await fetch(
                `${API_URL}/api/productos/`,
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


        if (
            productosResponse.status === 401
        ) {

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


        if (!productosResponse.ok) {

            throw new Error(
                `Error productos: ${productosResponse.status}`
            );

        }


        const productosRespuesta =
            await productosResponse.json();


        /*
         * Por si DRF devuelve:
         *
         * [
         *   {...}
         * ]
         *
         * o:
         *
         * {
         *   results: [...]
         * }
         */

        const productosData =
            Array.isArray(
                productosRespuesta
            )
                ? productosRespuesta
                : (
                    productosRespuesta.results ||
                    []
                );


        console.log(
            '📦 Productos encontrados en API:',
            productosData.length
        );


        // =========================================
        // 2. BUSCAR PRODUCTO
        // =========================================

        const productosEncontrados =
            productosData.filter(
                producto => {

                    const nombre =
                        normalizarTexto(
                            producto.nombre
                        );

                    const codigo =
                        normalizarTexto(
                            producto.codigo
                        );

                    const marca =
                        normalizarTexto(
                            producto.marca
                        );


                    return (

                        nombre.includes(
                            textoBusqueda
                        )

                        ||

                        codigo.includes(
                            textoBusqueda
                        )

                        ||

                        marca.includes(
                            textoBusqueda
                        )

                    );

                }
            );


        console.log(
            '🔎 Productos que coinciden:',
            productosEncontrados
        );


        if (
            productosEncontrados.length === 0
        ) {

            mostrarProductoNoEncontrado();

            return;

        }


        // =========================================
        // 3. OBTENER DOCUMENTOS
        // =========================================

        const documentosResponse =
            await fetch(
                `${API_URL}/api/documentos/`,
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


        if (!documentosResponse.ok) {

            throw new Error(
                `Error documentos: ${documentosResponse.status}`
            );

        }


        const documentosRespuesta =
            await documentosResponse.json();


        const documentosData =
            Array.isArray(
                documentosRespuesta
            )
                ? documentosRespuesta
                : (
                    documentosRespuesta.results ||
                    []
                );


        // =========================================
        // 4. OBTENER DETALLES
        // =========================================

        const detallesResponse =
            await fetch(
                `${API_URL}/api/detalle-documentos/`,
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


        if (!detallesResponse.ok) {

            throw new Error(
                `Error detalles: ${detallesResponse.status}`
            );

        }


        const detallesRespuesta =
            await detallesResponse.json();


        const detallesData =
            Array.isArray(
                detallesRespuesta
            )
                ? detallesRespuesta
                : (
                    detallesRespuesta.results ||
                    []
                );


        // =========================================
        // 5. UNIR INFORMACIÓN
        // =========================================

        const resultados = [];


        productosEncontrados.forEach(
            producto => {

                const detallesProducto =
                    detallesData.filter(
                        detalle =>

                            Number(
                                detalle.producto
                            )

                            ===

                            Number(
                                producto.id
                            )
                    );


                detallesProducto.forEach(
                    detalle => {

                        const documento =
                            documentosData.find(
                                doc =>

                                    Number(
                                        doc.id
                                    )

                                    ===

                                    Number(
                                        detalle.documento
                                    )
                            );


                        if (!documento) {

                            return;

                        }


                        const operacion =
                            String(
                                documento.operacion ||
                                ''
                            ).toUpperCase();


                        // ---------------------------------
                        // FILTRO OPERACIÓN
                        // ---------------------------------

                        if (

                            operacionSeleccionada &&

                            operacion !==
                                operacionSeleccionada

                        ) {

                            return;

                        }


                        // ---------------------------------
                        // CLIENTE
                        // ---------------------------------

                        const cliente =
                            clientes.find(
                                item =>

                                    Number(item.id)
                                    ===
                                    Number(
                                        documento.cliente
                                    )
                            );


                        // ---------------------------------
                        // PROVEEDOR
                        // ---------------------------------

                        const proveedor =
                            proveedores.find(
                                item =>

                                    Number(item.id)
                                    ===
                                    Number(
                                        documento.proveedor
                                    )
                            );


                        resultados.push({

                            producto,

                            documento,

                            detalle,

                            cliente,

                            proveedor

                        });

                    }
                );

            }
        );


        console.log(
            '📊 Resultados finales:',
            resultados
        );


        // =========================================
        // 6. SIN MOVIMIENTOS
        // =========================================

        if (
            resultados.length === 0
        ) {

            mostrarSinMovimientos(
                productosEncontrados,
                operacionSeleccionada
            );

            return;

        }


        // =========================================
        // 7. MOSTRAR
        // =========================================

        renderizarResultadosVisor(
            resultados
        );


    } catch (error) {

        console.error(
            '❌ Error en visor de productos:',
            error
        );


        if (visorProductosVacio) {

            visorProductosVacio.style.display =
                'block';

            visorProductosVacio.innerHTML = `

                <div class="viewer-empty-icon">
                    ⚠️
                </div>

                <h3>
                    No se pudo realizar la consulta
                </h3>

                <p>
                    Revisa la consola del navegador
                    para ver el error.
                </p>

            `;

        }

    }

}


// =====================================================
// RENDERIZAR RESULTADOS
// =====================================================

function renderizarResultadosVisor(
    resultados
) {

    if (!visorProductosResultados) {

        console.error(
            '❌ No existe visor-productos-resultados'
        );

        return;

    }


    if (visorProductosVacio) {

        visorProductosVacio.style.display =
            'none';

    }


    visorProductosResultados.style.display =
        'block';


    // =========================================
    // RESUMEN
    // =========================================

    const compras =
        resultados.filter(
            item =>

                String(
                    item.documento.operacion ||
                    ''
                ).toUpperCase()
                ===
                'COMPRA'

        ).length;


    const ventas =
        resultados.filter(
            item =>

                String(
                    item.documento.operacion ||
                    ''
                ).toUpperCase()
                ===
                'VENTA'

        ).length;


    const productosUnicos =
        [
            ...new Set(
                resultados.map(
                    item =>
                        item.producto.id
                )
            )
        ];


    // =========================================
    // FILAS
    // =========================================

    let filasHTML = '';


    resultados.forEach(
        item => {

            const producto =
                item.producto;

            const documento =
                item.documento;

            const detalle =
                item.detalle;

            const cliente =
                item.cliente;

            const proveedor =
                item.proveedor;


            const operacion =
                String(
                    documento.operacion ||
                    ''
                ).toUpperCase();


            const cantidad =
                Number(
                    detalle.cantidad
                ) || 0;


            const precio =
                Number(
                    detalle.precio_unitario
                ) || 0;


            const importe =
                cantidad *
                precio;


            const moneda =
                documento.moneda ||
                'PEN';


            // -----------------------------------------
            // TERCERO
            // -----------------------------------------

            let tercero =
                '';


            if (
                operacion === 'VENTA'
            ) {

                tercero =
                    cliente
                        ? (
                            cliente.razon_social ||
                            cliente.nombre ||
                            `Cliente ${cliente.id}`
                        )
                        : 'Sin cliente';

            } else {

                tercero =
                    proveedor
                        ? (
                            proveedor.razon_social ||
                            `Proveedor ${proveedor.id}`
                        )
                        : 'Sin proveedor';

            }


            const operacionTexto =
                operacion === 'VENTA'
                    ? '💰 Venta'
                    : '🛒 Compra';


            filasHTML += `

                <tr>

                    <td>
                        <strong>
                            ${
                                producto.nombre ||
                                `Producto ${producto.id}`
                            }
                        </strong>
                    </td>

                    <td>
                        ${
                            producto.codigo ||
                            '-'
                        }
                    </td>

                    <td>
                        ${operacionTexto}
                    </td>

                    <td>
                        <strong>
                            ${tercero}
                        </strong>
                    </td>

                    <td>
                        ${
                            documento.numero ||
                            '-'
                        }
                    </td>

                    <td>
                        ${
                            documento.fecha ||
                            '-'
                        }
                    </td>

                    <td>
                        ${cantidad}
                    </td>

                    <td>
                        ${formatearMoneda(
                            precio,
                            moneda
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatearMoneda(
                                importe,
                                moneda
                            )}
                        </strong>
                    </td>

                </tr>

            `;

        }
    );


// =========================================
// HTML FINAL
// =========================================

visorProductosResultados.innerHTML = `

    <div class="viewer-summary">


        <!-- PRODUCTOS -->
        <div class="viewer-card">

            <div class="viewer-card-icon">
                <i data-lucide="package"></i>
            </div>

            <div class="viewer-card-content">

                <span class="viewer-card-number">
                    ${productosUnicos.length}
                </span>

                <span class="viewer-card-label">
                    Producto${
                        productosUnicos.length !== 1
                            ? 's'
                            : ''
                    }
                </span>

            </div>

        </div>


        <!-- COMPRAS -->
        <div class="viewer-card">

            <div class="viewer-card-icon">
                <i data-lucide="shopping-cart"></i>
            </div>

            <div class="viewer-card-content">

                <span class="viewer-card-number">
                    ${compras}
                </span>

                <span class="viewer-card-label">
                    Compra${
                        compras !== 1
                            ? 's'
                            : ''
                    }
                </span>

            </div>

        </div>


        <!-- VENTAS -->
        <div class="viewer-card">

            <div class="viewer-card-icon">
                <i data-lucide="circle-dollar-sign"></i>
            </div>

            <div class="viewer-card-content">

                <span class="viewer-card-number">
                    ${ventas}
                </span>

                <span class="viewer-card-label">
                    Venta${
                        ventas !== 1
                            ? 's'
                            : ''
                    }
                </span>

            </div>

        </div>


    </div>


    <!-- =========================================
         TABLA DE RESULTADOS
         ========================================= -->

    <div class="table-container viewer-table-container">

        <table class="clients-table">

            <thead>

                <tr>

                    <th>
                        Producto
                    </th>

                    <th>
                        Código
                    </th>

                    <th>
                        Operación
                    </th>

                    <th>
                        Cliente / Proveedor
                    </th>

                    <th>
                        Documento
                    </th>

                    <th>
                        Fecha
                    </th>

                    <th>
                        Cantidad
                    </th>

                    <th>
                        Precio unitario
                    </th>

                    <th>
                        Importe
                    </th>

                </tr>

            </thead>


            <tbody>

                ${filasHTML}

            </tbody>

        </table>

    </div>

`;


// Convertir los <i> de Lucide en SVG
if (
    typeof lucide !== 'undefined' &&
    typeof lucide.createIcons === 'function'
) {
    lucide.createIcons();
}

}



// =====================================================
// BOTÓN BUSCAR
// =====================================================

if (btnBuscarProducto) {

    btnBuscarProducto.addEventListener(
        'click',
        function () {

            console.log(
                '🟢 CLICK EN BUSCAR'
            );

            buscarProductoVisor();

        }
    );

} else {

    console.error(
        '❌ NO SE ENCONTRÓ #btn-buscar-producto'
    );

}


// =====================================================
// ENTER EN EL BUSCADOR
// =====================================================

if (visorProductoInput) {

    visorProductoInput.addEventListener(
        'keydown',
        function (event) {

            if (
                event.key === 'Enter'
            ) {

                event.preventDefault();

                buscarProductoVisor();

            }

        }
    );

}


// =====================================================
// CAMBIO DE OPERACIÓN
// =====================================================

if (visorOperacionSelect) {

    visorOperacionSelect.addEventListener(
        'change',
        function () {

            const texto =
                visorProductoInput?.value.trim();


            if (texto) {

                buscarProductoVisor();

            }

        }
    );

}


// =====================================================
// ESTADO INICIAL
// =====================================================

mostrarEstadoInicialVisor();