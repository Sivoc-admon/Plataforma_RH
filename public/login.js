/* --- <script> for login.ejs --- */

// Event listener : Formulario Login
document.getElementById("idFormularioLogin").addEventListener("submit", async function (e) {

    // Preparar la información
    const email = document.getElementById("MREMAILID");
    //const password = document.getElementById("MRPASSWORDID");
    console.log(email);
    //console.log(password);


    // Ejecutar POST en "/login/POSTAUTH"
    try {
        const response = await fetch("/login/POSTAUTH", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password }) 
        });

        // Redirigir al usuario si las credenciales son correctas
        const data = await response.json();
        if (data.success) {
            window.location.href = data.redirectUrl;  
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error al enviar la solicitud", error);
    }
});