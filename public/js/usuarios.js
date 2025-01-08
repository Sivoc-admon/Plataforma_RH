// newUser button
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
            const estaActivo = true;

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
            
            // TODO REMOVE WHITESPACES Before / After STRINGS


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
                                estaActivo: estaActivo,
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

// disableUser button
async function disableUser() { // async function to perform fetch chain
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>¿Deseas desactivar este usuario?</h2>
                <h2>Ya no podrá acceder a la plataforma.<h2>
            </div>
        `,
        confirmButtonText: 'Desactivar usuario',
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
            const thisButton = document.getElementById('disableUser');
            const userId = thisButton.getAttribute('userId');
            // Fetch #01 - Execute user deactivation
            try {
                const response = await fetch('/usuarios/desactivar-usuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        userId: userId,
                    })
                });
                const data = await response.json();

                // Catch from Controller "/usuarios/desactivar-usuario"
                if (!data.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #005)'
                    });
                    return; // disableUser() failed execution
                } else {
                    Swal.fire({
                        title: 'Usuario desactivado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha desactivado el usuario correctamente.'
                    });
                    return; // disableUser() successful execution
                }

            // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #006)'
                });
                console.error('Hubo un error:', error);
                return; // disableUser() failed execution
            }
        }
    })
};

// viewAndEditUser button (TODO, REQUIRES PFP VISIBILITY AND newUser FRONT END )
async function viewAndEditUser() { // async function to perform fetch chain
    const thisButton = document.getElementById('viewAndEditUser');

    const email = thisButton.getAttribute('email');
    const password = thisButton.getAttribute('password');
    const nombre = thisButton.getAttribute('nombre');
    const apellidoP = thisButton.getAttribute('apellidoP');
    const apellidoM = thisButton.getAttribute('apellidoM');
    const fechaBaja = thisButton.getAttribute('fechaBaja');
    const fechaIngreso = thisButton.getAttribute('fechaIngreso');
    const area = thisButton.getAttribute('area');
    const foto = thisButton.getAttribute('foto');
    const puesto = thisButton.getAttribute('puesto');
    const jefeInmediato = thisButton.getAttribute('jefeInmediato');

    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>DATOS DEL COLABORADOR</h2>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Nombre
                        <input class="input" id="nombre" value=${nombre} required>
                    </label>
                </div>
                <div class="column">
                    <label>Apellido Paterno
                        <input class="input" id="apellidoP" value=${apellidoP} required>
                    </label>
                </div>
                <div class="column">
                    <label>Apellido Materno
                        <input class="input" id="apellidoM" value=${apellidoM} required>
                    </label>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Email
                        <input class="input" id="email" value=${email} required>
                    </label>
                </div>
                <div class="column">
                    <label>Contraseña
                        <input class="input" id="password" value=${password} required>
                    </label>
                </div>
                <div class="column">
                    <label>Fecha de ingreso
                        <input type="date" class="input" id="fechaIngreso" value=${fechaIngreso} required>
                    </label>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Área
                        <input class="input" id="area" value=${area} required>
                    </label>
                </div>
                <div class="column">
                    <label>Puesto
                        <input class="input" id="puesto" value=${puesto} required>
                    </label>
                </div>
                <div class="column">
                    <label>Jefe Inmediato
                        <input class="input" id="jefeInmediato" value=${jefeInmediato} required>
                    </label>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Fecha de baja
                        <input type="date" class="input" id="fechaBaja" value=${fechaBaja} required>
                    </label>
                </div>
                <div class="column">
                    <label>Foto
                        <input type="file" class="input" name="foto" value=${foto} id="foto">
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
            const estaActivo = true;

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
            
            // TODO REMOVE WHITESPACES Before / After STRINGS


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
                                estaActivo: estaActivo,
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