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


// =========================
// CERRAR SESIÓN
// =========================

const logoutButton =
    document.querySelector('.logout');


if (logoutButton) {

    logoutButton.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            localStorage.removeItem('access_token');

            localStorage.removeItem('refresh_token');

            window.location.href = 'login.html';

        }
    );

}





