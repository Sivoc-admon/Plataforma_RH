/* ---- script from usuarios.ejs ---- */

// , add .then location reload to ALL Error #000s

// addUser button
//  add image fronentd
async function createPermit() { // async function to perform fetch chain
    hideSidebar(); // sidebar frontend

    // dynamic html to show available "Jefe Inmediatos"
    let optionsJefeInmediato = ' <option value="" hidden>Selecciona un Jefe Inmediato</option>';
    for (let user of usersRows) {
        if (user.privilegio === "jefeInmediato") {
            optionsJefeInmediato += `<option value="${user._id}">${user.nombre} ${user.apellidoP} ${user.apellidoM}</option>`;
        }
    }
   
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

            // format styles and user experience for calendars (fechaIngreso)
            const todayIn = new Date();
            const formattedISODateIn = todayIn.toISOString().split('T')[0];
            const dateInputIn = document.getElementById("fechaIngreso");
            dateInputIn.value = formattedISODateIn;
            dateInputIn.addEventListener("focus", () => {
            dateInputIn.showPicker(); // Despliega el calendario nativo automáticamente
            });
            dateInputIn.addEventListener("focus", () => {
                if (!isCalendarOpen) {
                    dateInputIn.showPicker(); // Mostrar el calendario
                    isCalendarOpen = true; // Cambiar estado
                }
            });
            dateInputIn.addEventListener("click", (event) => {
                event.preventDefault(); // Previene comportamiento predeterminado
                dateInputIn.showPicker(); // Fuerza mostrar el calendario
            });

            // format styles and user experience for calendars (fechaIngreso)
            const todayOut = new Date();
            const formattedISODateOut = todayOut.toISOString().split('T')[0];
            const dateInputOut = document.getElementById("fechaBaja");
            dateInputOut.value = formattedISODateOut;
            dateInputOut.addEventListener("focus", () => {
            dateInputOut.showPicker(); // Despliega el calendario nativo automáticamente
            });
            dateInputOut.addEventListener("focus", () => {
                if (!isCalendarOpen) {
                    dateInputOut.showPicker(); // Mostrar el calendario
                    isCalendarOpen = true; // Cambiar estado
                }
            });
            dateInputOut.addEventListener("click", (event) => {
                event.preventDefault(); // Previene comportamiento predeterminado
                dateInputOut.showPicker(); // Fuerza mostrar el calendario
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
                const responseEmail = await fetch('/usuarios/doesEmailExists', {
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
                // TODO, limitar tamaño de archivo y tipo de archivo (pq PFP != PDF EXCEL)
                const responseFile = await fetch('/usuarios/uploadFile', {
                    method: 'POST',
                    body: formData,
                });
                const dataFile = await responseFile.json();

                // Catch from Controller "/usuarios/uploadFile"
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
                        const responseUser = await fetch('/usuarios/addUser', {
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

                            // Catch from Controller "/usuarios/addUser"
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