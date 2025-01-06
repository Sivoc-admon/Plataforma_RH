async function newUser() { // async function to perform fetch chain
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

        preConfirm: async () => { // allows to perform fetch chain
            const nombre = $('#nombre').val();
            const apellidoP = $('#apellidoP').val();
            const apellidoM = $('#apellidoM').val();
            const email = $('#email').val();
            const password = $('#password').val();
            const area = $('#area').val();
            const fechaBaja = $('#fechaBaja').val();
            const fechaIngreso = $('#fechaIngreso').val();
            const jefeInmediato = $('#jefeInmediato').val();
            const puesto = $('#puesto').val();  // TODO puesto can only be sent if its not disabled
            const fileInput = document.getElementById('foto');

            if (/[\{\}\:\$\=\'\*\[\]]/.test(nombre) || /[\{\}\:\$\=\'\*\[\]]/.test(apellidoP) || /[\{\}\:\$\=\'\*\[\]]/.test(apellidoM) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(email) || /[\{\}\:\$\=\'\*\[\]]/.test(password) || /[\{\}\:\$\=\'\*\[\]]/.test(area) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(jefeInmediato) || /[\{\}\:\$\=\'\*\[\]]/.test(puesto)) {
                Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
                return;
            } 
            else if (!nombre || !apellidoP || !apellidoM || !email || !password || !area || !fechaBaja || !fechaIngreso || !jefeInmediato 
                || !puesto || !fileInput.files[0]) {
                Swal.showValidationMessage('Todos los campos son requeridos.');
                return;
            }
            
            const formData = new FormData(); 
            formData.append('file', fileInput.files[0]); // Postman "Key" = "file"

            // Fetch #01 - File upload (profile picture)
            try {
                const responseFile = await fetch('/usuarios/subir-archivo', {
                    method: 'POST',
                    body: formData, 
                });
                const dataFile = await responseFile.json();
                
                // Catch from Controller "/usuarios/subir-archivo"
                if (!dataFile.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #001)'
                    });
                    return; // newUser() failed execution
                } else {

                    // (CHAINED) Fetch #02 - User information (json object)
                    try {            
                        const responseUser = await fetch('/usuarios/anadir-usuario', {
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
                                foto: dataFile.message.path,
                                jefeInmediato: jefeInmediato,
                                puesto: puesto,
                            })
                        });
                        const dataUser = await responseUser.json();
                        if (dataUser.success) { 
                            Swal.fire({
                                title: 'Usuario añadido', 
                                icon: 'success',
                                width: "500px",
                                text: 'Se añadió el usuario correctamente.'
                            })
                            return; // newUser() successful execution

                        // Catch from Controller "/usuarios/anadir-usuario"
                        } else {
                            Swal.fire({
                                title: 'Algo salió mal :(',
                                icon: 'error',
                                width: "500px",
                                text: 'Favor de contactar a Soporte Técnico. (Error #004)'
                            });
                            return; // newUser() failed execution
                        }
 
                    // Catch from Fetch #02
                    } catch (error) {
                        Swal.fire({
                            title: 'Algo salió mal :(',
                            icon: 'error',
                            width: "500px",
                            text: 'Favor de contactar a Soporte Técnico. (Error #003)'
                        });
                        console.error('Hubo un error:', error);
                        return; // newUser() failed execution
                    }
                }

            // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #002)'
                });
                console.error('Hubo un error:', error);
                return; // newUser() failed execution
            }
           
        }
    })
};