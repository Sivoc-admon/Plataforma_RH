/* ---- script from login.ejs ---- */

// TODO (1) They want token storage, they do remember me thingy

// TODO, ADD token verification and token access FIRE HERE
// TODO, la cookie que se genere o la autenticación basada en un TOKEN debe estar enlazada a un valor httpOnly que diga el privilegio al que se pertenece
// Debe existir una cookie por defecto, esta cookie debe tener enlazado el privilegio "unauthorized" 

// addUser button
async function logIn() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // nosql injection protection
        if (/[\{\}\:\$\=\'\*\[\]]/.test(email) || /[\{\}\:\$\=\'\*\[\]]/.test(password)) {
            Swal.fire({
                title: 'Campos incorrectos.',
                icon: 'warning',
                width: "500px",
                text: 'Uno o más campos contienen caracteres no permitidos.'
            });
            return;
        } 
        else if (!email || !password) {
            Swal.fire({
                title: 'Campos vacíos.',
                icon: 'warning',
                width: "500px",
                height: "100px",
                text: 'Todos los campos son requeridos.'
            });
            return;
        }

    try {
        const response = await fetch("/login/POSTAUTH", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                email: email, 
                password: password,
            })
        });
        const data = await response.json();

        if (data.success) {
            if (data.authorized) {
                window.location.href = data.redirectUrl;
            } else {
                Swal.fire({
                    title: 'Credenciales incorrectas.',
                    icon: 'warning',
                    width: "500px",
                    text: data.message,
                });
                return; // logIn() failed execution
            }

        // Catch login controller
        } else {
            Swal.fire({
                title: 'Algo salió mal :(',
                icon: 'error',
                width: "500px",
                text: 'Favor de contactar a Soporte Técnico. (Error #010)'
            });
            return; // logIn() failed execution
        }
    
    // Catch Fetch "/login/POSTAUTH"
    } catch (error) {
        Swal.fire({
            title: 'Algo salió mal :(',
            icon: 'error',
            width: "500px",
            text: 'Favor de contactar a Soporte Técnico. (Error #009)'
        });
        console.error("Error al enviar la solicitud", error);
        return; // logIn() failed execution
    }
};