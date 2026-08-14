const API_URL = 'https://sistema-gestion-comercial.onrender.com';

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