function uploadPhoto() {
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem;">
                <h2>DATOS DEL COLABORADOR</h2>
            </div>

                <div class="columns is-vcentered">
                    <div class="column">
                        <label for="foto">Foto</label>
                        <input type="file" name="foto" class="input" id="foto">
                    </div>
                </div>

        `,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '1000px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },

        preConfirm: () => {

            // aqui debes preprocesar el middleware de multer upload.single y luego mandar la respuesta success
            // FILES = FORMDATA, no es string ni nada, es form-data

            const fileInput = document.getElementById('foto');

            if (!fileInput.files[0]) {
                Swal.showValidationMessage('Todos los campos son requeridos.');
                return false;
            }

            const formData = new FormData(); 
            formData.append('profile_picture', fileInput.files[0]);


            // Continúa con el fetch si todo está validado.
            fetch('/usuarios/upload', { // No usar caracteres especiales en las rutas
                method: 'POST',
                body: formData, // No necesitas agregar headers manualmente con FormData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Se añadió el usuario correctamente.',
                        icon: 'success',
                        width: "500px",
                        text: data.message
                    }).then(() => {
                        location.reload(); // es más limpio recargar la página por aquí
                    });
                } else {
                    Swal.fire({
                        title: 'Error al subir fotografía del usuario.',
                        icon: 'error',
                        width: "500px",
                        text: data.message
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error técnico.',
                    icon: 'error',
                    width: "500px",
                });
                console.error('Error:', error);
            });


        }
    })
};