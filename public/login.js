// <script> for login.ejs file

// Event listener : Formulario Login
document.getElementById("idFormularioLogin").addEventListener("submit", async function (e) {

    // on submit, execute: 
    console.log("Execution: Log in credentials.")


    // 1. Information processing
    e.preventDefault(); 
    const email = e.target.children.email.value;
    const password = e.target.children.password.value;

    // 2. Information posting on /POSTAUTH
    // Enviar la solicitud POST al servidor
    try {
        const response = await fetch("/login/POSTAUTH", {
            method: "POST",  // Usamos el método POST
            headers: {
                "Content-Type": "application/json"  // Decimos que estamos enviando datos JSON
            },
            body: JSON.stringify({ email, password })  // Enviamos los datos del formulario como JSON
        });

        // Verificar si la autenticación fue exitosa
        const data = await response.json();
        console.log(data)
        if (data.success) {
            console.log("Exito!");
            window.location.href = data.redirectUrl;  // Redirigir al usuario si las credenciales son correctas
        } else {
            alert(data.message);  // Mostrar un mensaje de error si las credenciales son incorrectas
        }
    } catch (error) {
        console.error("Error al enviar la solicitud", error);
    }
});