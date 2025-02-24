// addUser button
async function logIn() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const remember = document.getElementById("remember").checked;

        //     <!-- TODO on enter -->
        // añade un listener al enter en general, si hace enter entonces se acciona logIn(); 

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
                remember: remember,
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