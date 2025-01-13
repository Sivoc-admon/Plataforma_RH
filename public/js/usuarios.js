/* ---- script from usuarios.ejs ---- */

// addUser button
async function addUser() { // async function to perform fetch chain
    hideSidebar(); // sidebar frontend

    // dynamic html to show available "Jefe Inmediatos"
    let optionsJefeInmediato = ' <option value="" hidden>Selecciona un Jefe Inmediato</option>';
    for (let user of usersRows) {
        if (user.privilegio === "Jefe Inmediato") {
            optionsJefeInmediato += `<option value="${user._id}">${user.nombre} ${user.apellidoP} ${user.apellidoM}</option>`;
        }
    }

    // map out relationships to generate "dynamic" html
    const areaToPuestos = {
        "ADMINISTRACIÓN": ["Director General", "Coordinador de Finanzas", "Gestor Tesorería", "Coordinador de Recursos Humanos", "Gestor Recursos Humanos", "Analista Recursos Humanos"],
        "VENTAS": ["Coordinador Comercial", "Gestor ventas", "Analista Ventas"],
        "CALIDAD": ["Coordinador de  Calidad", "Gestor Calidad", "Analista Calidad"],
        "OPERATIVO": ["Coordinador Operacional", "Gestor Ingeniería", "Analista Ingeniería", "Gestor Compras", "Analista Compras", "Gestor de Manufactura", "Analista de Manufactura", "Analista de Almacén"],
        "PRUEBAS": ["Gestor de Pruebas", "Ingeniero de servicio A", "Ingeniero de servicio B", "Ingeniero de servicio C"]
    };
            
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
                        <select id="area" class="is-fullwidth input">
                        <option value="" hidden>Selecciona un área</option>
                        ${Object.keys(areaToPuestos).map(area => `<option value="${area}">${area}</option>`).join('')}
                        </select> 
                    </label>
                </div>

                <div class="column">
                    <label>Puesto
                        <select id="puesto" class="is-fullwidth input">
                        <option value="" hidden>(Selecciona un área primero)</option>
                        </select> 
                    </label>
                </div>

                <div class="column">
                    <label>Jefe Inmediato
                        <select class="is-fullwidth input" id="jefeInmediato" required>
                        ${optionsJefeInmediato}
                        </select> 
                    </label>
                </div>

            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Fecha de baja
                        <input type="date" class="input"  id="fechaBaja" required>
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
        didOpen: () => {
            const areaSelect = document.getElementById("area");
            const puestoSelect = document.getElementById("puesto");
            areaSelect.addEventListener("change", () => {
                const selectedArea = areaSelect.value; 
                const puestos = areaToPuestos[selectedArea] || []; 
                puestoSelect.innerHTML = '<option value="" hidden>Selecciona un puesto</option>';
                puestos.forEach(puesto => {
                    const option = document.createElement("option");
                    option.value = puesto;
                    option.textContent = puesto;
                    puestoSelect.appendChild(option);
                });
            });
        },
        preConfirm: async () => { // allows to perform fetch chain
            const nombre = $('#nombre').val().trim();
            const apellidoP = $('#apellidoP').val().trim();
            const apellidoM = $('#apellidoM').val().trim();
            const email = $('#email').val().trim();
            const password = $('#password').val().trim();
            const area = $('#area').val().trim();
            const fechaBaja = $('#fechaBaja').val();
            const fechaIngreso = $('#fechaIngreso').val();
            const jefeInmediato = $('#jefeInmediato').val().trim();
            const puesto = $('#puesto').val().trim();
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

            // Preconfirm Fetch #01 - verify email collision
            try {
                const responseEmail = await fetch('/usuarios/existe-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                    })
                });
                const dataEmail = await responseEmail.json();
                if (dataEmail.success) {
                    if (dataEmail.exists) {
                        Swal.showValidationMessage('Email existente. Ese email ya está ocupado por un usuario.');
                        return; // email collision detected
                    } // else, continue execution
                } else {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #007)'
                    });
                    return; // addUser() failed execution
                }

            // Catch from Preconfirm Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #008)'
                });
                console.error('Hubo un error:', error);
                return; // addUser() failed execution 
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
                    return; // addUser() failed execution
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
                                privilegio: "unauthorized", // default priviliges applied
                            })
                        });
                        const dataUser = await responseUser.json();
                        if (dataUser.success) {
                            Swal.fire({
                                title: 'Usuario añadido',
                                icon: 'success',
                                width: "500px",
                                text: 'Se añadió el usuario correctamente.'
                            }).then(() => {
                                location.reload(); // reload after popup
                            });
                            return; // addUser() successful execution

                            // Catch from Controller "/usuarios/anadir-usuario"
                        } else {
                            Swal.fire({
                                title: 'Algo salió mal :(',
                                icon: 'error',
                                width: "500px",
                                text: 'Favor de contactar a Soporte Técnico. (Error #004)'
                            });
                            return; // addUser() failed execution
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
                        return; // addUser() failed execution
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
                return; // addUser() failed execution
            }
        }
    })
};

// disableUser button
// TODO, grant that user "privilegio: unauthorized" (maybe save the previous privilegio somewhere else?)
async function disableUser(button) { // async function to perform fetch chain
    hideSidebar(); // sidebar frontend
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
            const userId = button.getAttribute('userId');
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
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    activeUsers.delete(userId);
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

// viewAndEditUser button
// TODO, REQUIRES PFP VISIBILITY AND addUser FRONT END)
// TODO, do not add a new user, rather set again with moongose
// TODO, password decryption only when editing
// TODO, this variable not working properly, only loading the 1st one.
// TODO, change field type to PASSWORD when edtining password (easier)
// TODO, use userId instead
// TODO, add activeUsers.delete(userId); // log him out inside the controller function
async function viewAndEditUser(button) { // async function to perform fetch chain
    hideSidebar(); // sidebar frontend

    const userId = button.getAttribute('userId');
    // TODO esto no va aaqui, pasalo al preconfirm y formatealo como el userId
    const email = button.getAttribute('email');
    const password = button.getAttribute('password');
    const nombre = button.getAttribute('nombre');
    const apellidoP = button.getAttribute('apellidoP');
    const apellidoM = button.getAttribute('apellidoM');
    const fechaBaja = button.getAttribute('fechaBaja');
    const fechaIngreso = button.getAttribute('fechaIngreso');
    const area = button.getAttribute('area');
    const foto = button.getAttribute('foto');
    const puesto = button.getAttribute('puesto');
    const jefeInmediato = button.getAttribute('jefeInmediato');

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
                        <input type="password" class="input" id="password" value=${password} onfocus="this.value = ''" required>
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
            const puesto = $('#puesto').val(); 
            const fileInput = document.getElementById('foto');
            const estaActivo = true;
            const privilegio = "empty"; 

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


            // TODO REMOVE WHITESPACES Before / After STRINGS .trim();
            // TODO cannot add email being used 

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
                        text: 'Favor de contactar a Soporte Técnico. (Error #000)'
                    });
                    return; // addUser() failed execution
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
                                privilegio: "empty"
                            })
                        });
                        const dataUser = await responseUser.json();
                        if (dataUser.success) {
                            Swal.fire({
                                title: 'Usuario añadido',
                                icon: 'success',
                                width: "500px",
                                text: 'Se añadió el usuario correctamente.'
                            });
                            activeUsers.delete(userId);
                            return; // addUser() successful execution

                            // Catch from Controller "/usuarios/anadir-usuario"
                        } else {
                            Swal.fire({
                                title: 'Algo salió mal :(',
                                icon: 'error',
                                width: "500px",
                                text: 'Favor de contactar a Soporte Técnico. (Error #000)'
                            });
                            return; // addUser() failed execution
                        }

                        // Catch from Fetch #02
                    } catch (error) {
                        Swal.fire({
                            title: 'Algo salió mal :(',
                            icon: 'error',
                            width: "500px",
                            text: 'Favor de contactar a Soporte Técnico. (Error #000)'
                        });
                        console.error('Hubo un error:', error);
                        return; // addUser() failed execution
                    }
                }

                // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #000)'
                });
                console.error('Hubo un error:', error);
                return; // addUser() failed execution
            }
        }
    })
};

// disabledUsersTable button
async function disabledUsersTable() {
    try {
        const response = await fetch('/usuarios/restaurar-usuarios', {
            method: 'GET',
        });

        // Catch from Controller "/usuarios/restaurar-usuarios"
        if (!response.ok) {
            Swal.fire({
                title: 'Algo salió mal :(',
                icon: 'error',
                width: "500px",
                text: 'Favor de contactar a Soporte Técnico. (Error #012)'
            });
            return; // disabledUsersTable() failed execution
        } else {
            window.location.href = '/usuarios/restaurar-usuarios';
            return; // disabledUsersTable() successful execution
        }

    // Catch from Fetch #01
    } catch (error) {
        Swal.fire({
            title: 'Algo salió mal :(',
            icon: 'error',
            width: "500px",
            text: 'Favor de contactar a Soporte Técnico. (Error #011)'
        });
        console.error('Hubo un error:', error);
        return; // disabledUsersTable() failed execution
    }
};

// changePrivilege button
// TODO, grant that user "privilegio: unauthorized" (maybe save the previous privilegio somewhere else?)
// TODO, deny "empty field" addUser() already does this with his Jefe Inmediato field
async function changePrivilege(button) { // async function to perform fetch chain
    hideSidebar(); // sidebar frontend
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>Cambiar el privilegio del usuario</h2>
                <br><br>
                    <div class="field">
                        <div class="control">
                            <select id="newPrivilege" class="is-fullwidth input">
                            <option value="" hidden>Selecciona un privilegio</option>
                            <option>Colaborador</option>
                            <option>Recursos Humanos</option>
                            <option>Jefe Inmediato</option>
                            <option>Dirección</option>
                            <option>Unauthorized</option>
                            </select> 
                        </div>
                    </div>
            </div>
        `,
        confirmButtonText: 'Confirmar',
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
            const newPrivilege = $('#newPrivilege').val();

            // Fetch #01 - Execute changePrivilege
            try {
                const response = await fetch('/usuarios/cambiar-privilegio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        newPrivilege: newPrivilege,
                    })
                });
                const data = await response.json();

                // Catch from Controller "/activar-usuario"
                if (!data.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #015)'
                    });
                    return; // changePrivilege() failed execution
                } else {
                    Swal.fire({
                        title: 'Privilegio configurado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha cambiado el privilegio del usuario correctamente.'
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // changePrivilege() successful execution
                }

                // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #016)'
                });
                console.error('Hubo un error:', error);
                return; // changePrivilege() failed execution
            }
        }
    })
};


// downloadExcel button
// TODO, remake
async function downloadExcel() {
    try {
        const response = await fetch('/usuarios/downloadExcelUsers', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Create a link to download the file
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'usuarios.xlsx';
        link.click();

        Swal.fire({
            title: 'Excel descargado',
            icon: 'success',
            width: "500px",
            text: 'El archivo se descargó correctamente.'
        });

    } catch (error) {
        console.error('Error downloading file:', error);
        Swal.fire({
            title: 'Algo salió mal :(',
            icon: 'error',
            width: "500px",
            text: 'Favor de contactar a Soporte Técnico. (Error #020)'
        });
    }
};

// downloadPDF button
// TODO, remake
async function downloadPDF() {
    try {
        const response = await fetch('/usuarios/downloadPDFUsers', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'usuarios.pdf';
        link.click();

        Swal.fire({
            title: 'PDF descargado',
            icon: 'success',
            width: "500px",
            text: 'El archivo se descargó correctamente.'
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        Swal.fire({
            title: 'Algo salió mal :(',
            icon: 'error',
            width: "500px",
            text: 'Favor de contactar a Soporte Técnico. (Error #019)'
        });
    }
};
