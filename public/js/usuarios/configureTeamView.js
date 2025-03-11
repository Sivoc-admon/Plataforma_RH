// returnMainTable button : Done
function returnMainTable() {
    window.location.href = '/usuarios/accessUsersModule';
}

// configure TeamView button

// activateUser button
async function activateUser(button) { // async function to perform fetch chain
    Swal.fire({
        html: `
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-user-check" style="margin-right:0.9rem;"></i>Activar usuario
        </h2>
        <br>

        <div style="padding: 0.5rem; margin: 1rem 0.5rem">
            ¿Deseas activar este usuario? Esto implica que podrá acceder a la plataforma.
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
                const response = await fetch('/usuarios/activateUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                    })
                });
                const data = await response.json();

                await Swal.fire({
                    title: data.success ? 'Usuario activado' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'Se ha activado el usuario correctamente.' : data.messageText,
                    width: "500px"
                });
                
                location.reload();

            } catch (error) {
                location.reload();
            }
        }
    })
};