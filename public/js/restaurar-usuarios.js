/* ---- script from usuarios.ejs ---- */

function returnMainTable() {
    window.location.href = '/usuarios/accessUsersModule';
}

// enableUser button
async function enableUser(button) { // async function to perform fetch chain
    hideSidebar(); // sidebar frontend
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>¿Deseas volver a activar este usuario?</h2>
                <h2>Este usuario volverá a acceder a la plataforma.<h2>
            </div>
        `,
        confirmButtonText: 'Activar usuario',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '1000px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },

        preConfirm: async () => {
            const userId = button.getAttribute('userId');
            // Fetch #01 - Execute user activation
            try {
                const response = await fetch('/usuarios/activar-usuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                    })
                });
                const data = await response.json();

                // Catch from Controller "/activar-usuario"
                if (!data.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #014)'
                    });
                    return; // enableUser() failed execution
                } else {
                    Swal.fire({
                        title: 'Usuario activado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha activado el usuario correctamente.'
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // enableUser() successful execution
                }

                // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #013)'
                });
                console.error('Hubo un error:', error);
                return; // enableUser() failed execution
            }
        }
    })
};