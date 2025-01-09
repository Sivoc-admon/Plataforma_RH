// TODO, ADD token verification and token access FIRE HERE
// TODO, complete remake

// TODO, la cookie que se genere o la autenticación basada en un TOKEN debe estar enlazada a un valor httpOnly que diga el rol al que se pertenece
// Debe existir una cookie por defecto, esta cookie debe tener enlazado el rol "unauthorized" 

// Event listener : Formulario Login
document.getElementById("idFormularioLogin").addEventListener("submit", async function (e) {
    // Preparar la información
    e.preventDefault();

    // Obtener los valores de los campos email y password
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Ejecutar POST en "/login/POSTAUTH"
    try {
        const response = await fetch("/login/POSTAUTH", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password }) // Enviar los valores correctamente
        });

        // Redirigir al usuario si las credenciales son correctas
        const data = await response.json();
        if (data.success) {
            window.location.href = data.redirectUrl;
        } else {
            alert(data.message);  // Mostrar un mensaje de error si las credenciales son incorrectas
        }
    } catch (error) {
        console.error("Error al enviar la solicitud", error);
    }
});
