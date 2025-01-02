function newUser() {
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>DATOS DEL COLABORADOR</h2>
            </div>


            <div class="columns is-vcentered">
                <div class="column">
                    <label>Nombre
                        <input class="input" id="nombre" required>
                    </label>
                </div>
                <div class="column">
                    <label>Apellido Paterno
                        <input class="input" id="apellidoP" required>
                    </label>
                </div>
                <div class="column">
                    <label>Apellido Materno
                        <input class="input" id="apellidoM" required>
                    </label>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Email
                        <input class="input" id="email" required>
                    </label>
                </div>
                <div class="column">
                    <label>Contraseña
                        <input class="input" id="password" required>
                    </label>
                </div>
                <div class="column">
                    <label>Fecha de ingreso
                        <input type="date" class="input" id="fechaIngreso" required>
                    </label>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Área
                        <input class="input" id="area" required>
                    </label>
                </div>
                <div class="column">
                    <label>Puesto
                        <input class="input" id="puesto" required>
                    </label>
                </div>
                <div class="column">
                    <label>Jefe Inmediato
                        <input class="input" id="jefeInmediato" required>
                    </label>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Fecha de baja
                        <input type="date" class="input" id="fechaBaja" required>
                    </label>
                </div>
                <div class="column">
                    <label>Foto
                        <input type="file" name="foto" class="input" id="foto">
                    </label>
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
            // Recoge los datos del formulario antes de enviarlos o guardarlos
            let nombre = $('#nombre').val();
            let apellidoP = $('#apellidoP').val();
            let apellidoM = $('#apellidoM').val();
            let email = $('#email').val();
            let password = $('#password').val();
            let area = $('#area').val();
            let fechaBaja = $('#fechaBaja').val();
            let fechaIngreso = $('#fechaIngreso').val();
            let jefeInmediato = $('#jefeInmediato').val();
            let puesto = $('#puesto').val();  // puesto can only be sent if its not disabled

            const fileInput = document.getElementById('foto');

            if (/[\{\}\:\$\=\'\*\[\]]/.test(nombre) || /[\{\}\:\$\=\'\*\[\]]/.test(apellidoP) || /[\{\}\:\$\=\'\*\[\]]/.test(apellidoM) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(email) || /[\{\}\:\$\=\'\*\[\]]/.test(password) || /[\{\}\:\$\=\'\*\[\]]/.test(area) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(jefeInmediato) || /[\{\}\:\$\=\'\*\[\]]/.test(puesto)) {
                Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
                return false;
            } 
            
            else if (!nombre || !apellidoP || !apellidoM || !email || !password || !area || !fechaBaja || !fechaIngreso || !jefeInmediato 
                || !puesto || !fileInput.files[0]) {
                Swal.showValidationMessage('Todos los campos son requeridos.');
                return false;
            }
            

            const formData = new FormData(); 
            formData.append('file', fileInput.files[0]); // Postman "Key" = "file"

            // Continúa con el fetch si todo está validado.
            fetch('/usuarios/miPrimerArchivo', {
                method: 'POST',
                body: formData, // No necesitas agregar headers manualmente con FormData
            })
            .then(response => response.json())
            .then(response => {
                if (!response.success) {
                    Swal.fire({
                        title: 'Error al subir fotografía del usuario.',
                        icon: 'error',
                        width: "500px",
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error técnico. Por favor contactar a Soporte Técnico.',
                    icon: 'error',
                    width: "500px",
                });
                console.error('Error:', error);
            });

            // Continúa con el fetch si todo está validado.
            fetch('/usuarios/anadir-usuario', { // No usar caracteres especiales en las rutas
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombre,
                    apellidoP: apellidoP,
                    apellidoM: apellidoM,
                    email: email,
                    password: password,
                    area: area,
                    fechaBaja: fechaBaja,
                    fechaIngreso: fechaIngreso,
                    foto: fileInput.files[0].name,
                    jefeInmediato: jefeInmediato,
                    puesto: puesto,
                })
            })
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    Swal.fire({
                        title: 'Se añadió el usuario correctamente.',
                        icon: 'success',
                        width: "500px",
                        text: response.message
                    }).then(() => {
                        location.reload(); // es más limpio recargar la página por aquí
                    });
                } else {
                    Swal.fire({
                        title: 'Error al añadir el usuario #1.',
                        icon: 'error',
                        width: "500px",
                        text: response.message
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error al añadir el usuario #2.',
                    icon: 'error',
                    width: "500px",
                });
                console.error('Error:', error);
            });


        }
    })
};