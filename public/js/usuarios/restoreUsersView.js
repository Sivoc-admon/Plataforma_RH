// returnMainTable : Done
function returnMainTable() {
    window.location.href = '/usuarios/accessUsersModule';
}

// activateUser : Done
async function activateUser(button) { // async function to perform fetch chain
    const userId = DOMPurify.sanitize(button.getAttribute('userId'));
    const userName = DOMPurify.sanitize(button.getAttribute('userName'));

    Swal.fire({
        html: DOMPurify.sanitize(`

            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-user-check" style="margin-right:0.9rem;"></i>Activar Usuario
            </h2>

            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                ¿Deseas activar a "${userName}"?<br><br>
                Este usuario podrá acceder a la plataforma.
            </div>
        
        `),
        confirmButtonText: 'Activar usuario',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '800px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },

        preConfirm: async () => {
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