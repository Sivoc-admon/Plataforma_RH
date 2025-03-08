// addUser button
async function logIn() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const remember = document.getElementById("remember").checked;

    if (!email || !password)
        return Swal.fire({
            title: 'Campos vacíos.',
            icon: 'warning',
            width: "500px",
            text: 'Todos los campos son requeridos.'
        });

    try {
        const response = await fetch("/login/POSTAUTH", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                remember: remember,
            })
        });
        const data = await response.json();
        if (data.success) {
            if (data.authorized)
                window.location.href = data.redirectUrl;
            else
                return Swal.fire({
                    title: 'Credenciales incorrectas.',
                    icon: 'warning',
                    width: "500px",
                    text: data.message,
                });
        }
    } catch (error) {
        console.error(error);
        
    }
};

// addEnterKeyListener : Done
function addEnterKeyListener() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            logIn();
        }
    });
};

// Initialize event listeners when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    addEnterKeyListener();

    // Add click listener to login button if it exists
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', logIn);
    }
});