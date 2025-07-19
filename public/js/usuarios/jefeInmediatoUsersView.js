// Complete remake 
// 1. Remake flow (remake wording too)
// 2. Remake mongoose model
// 3. Remake mock users

// map out relationships to generate "dynamic" html
const areaToPuestos = {
    "Administración": ["Director General", "Coordinador de Finanzas", "Gestora de Tesorería", "Coordinador de Recursos Humanos", "Gestor de Recursos Humanos", "Analista de Recursos Humanos"],
    "Ventas": ["Coordinador Comercial", "Gestor de Ventas", "Analista de Ventas"],
    "Calidad": ["Coordinador de Calidad", "Gestor de Calidad", "Analista de Calidad"],
    "Operativo": ["Coordinador Operacional", "Gestor de Ingeniería", "Analista de Ingeniería", "Gestor de Compras", "Analista de Compras", "Gestor de Manufactura", "Analista de Manufactura", "Analista de Almacén"],
    "Pruebas": ["Gestor de Pruebas", "Ingeniero de Servicio A", "Ingeniero de Servicio B", "Ingeniero de Servicio C"]
};

// , add .then location reload to ALL Error #000s

// addUser button
//  add image fronentd
/*
async function addUser() { // async function to perform fetch chain
    

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
                puestoSelect.innerHTML = DOMPurify.sanitize('<option value="" hidden>Selecciona un puesto</option>');
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
            dateInputIn.addEventListener("click", (event) => {
                event.preventDefault(); // Previene comportamiento predeterminado
                dateInputIn.showPicker(); // Fuerza mostrar el calendario
            });

            // format styles and user experience for calendars (fechaIngreso)
            const todayOut = new Date();
            const formattedISODateOut = todayOut.toISOString().split('T')[0];
            const dateInputOut = document.getElementById("fechaBaja");
            dateInputOut.value = formattedISODateOut;
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
                return Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
            }
            if (!nombre || !apellidoP || !apellidoM || !email || !password || !area || !fechaBaja || !fechaIngreso || !jefeInmediato
                || !puesto || !fileInput.files[0]) {
                return Swal.showValidationMessage('Todos los campos son requeridos.');
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

*/
// deactivateUser button
async function deactivateUser(button) { // async function to perform fetch chain
    
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
                const response = await fetch('/usuarios/deactivateUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                    })
                });

                const data = await response.json();

                console.log(data);

                // Catch from Controller "/usuarios/deactivateUser"
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
                    return; // disableUser() successful execution
                }

            // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #006)'
                }).then(() => {
                    location.reload(); // reload after popup
                });
            }
        }
    })
};

// editUser button
// , REQUIRES PFP VISIBILITY AND addUser FRONT END)
// , do not add a new user, rather set again with moongose
// , password decryption only when editing
// , this variable not working properly, only loading the 1st one.
// , change field type to PASSWORD when edtining password (easier)
// , use userId instead
// , add activeUsers.delete(userId); // log him out inside the controller function

//  añadir validación de imagen, tamaño y tipo de archivo only, y su frontend
async function editUser(button) { // async function to perform fetch chain
    

    // return user object based on userID (frontend, thus only non-sensitive information)
    const user = usersRows.find(user => user._id === button.getAttribute('userId'));
    
    const email = user.email;
    const nombre = user.nombre;
    const apellidoP = user.apellidoP;
    const apellidoM = user.apellidoM;
    const fechaBaja = user.fechaBaja;
    const fechaIngreso = user.fechaIngreso;
    const areaUser = user.area;
    const puesto = user.puesto;
    const jefeInmediatoId = user.jefeInmediato;
    const foto = user.foto.replace("public", "");
    const privilegio = user.privilegio;
    
    // dynamic html to show available "Jefe Inmediatos"
    const jefeInmediatoObject = usersRows.find(user => user._id === jefeInmediatoId);
    let jefeInmediatoName = "Selecciona un Jefe"
    if (jefeInmediatoObject){
        jefeInmediatoName = jefeInmediatoObject.nombre + " " + jefeInmediatoObject.apellidoP + " " + jefeInmediatoObject.apellidoM;
    } 
    
    let optionsJefeInmediato = `<option value=${jefeInmediatoId} hidden>${jefeInmediatoName}</option>`;
    for (let user of usersRows) {
        if (user.privilegio === "jefeInmediato") {
            optionsJefeInmediato += `<option value="${user._id}">${user.nombre} ${user.apellidoP} ${user.apellidoM}</option>`;
        }
    }
    
    Swal.fire({
        html: `
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">Datos del Colaborador</h2>

        <div class="columns is-multiline">

            <!-- Name Fields -->
            <div class="column is-one-third">
                <label class="label">Nombre</label>
                <input class="input" id="nombre" value="${nombre}" required>
            </div>
            <div class="column is-one-third">
                <label class="label">Apellido Paterno</label>
                <input class="input" id="apellidoP" value="${apellidoP}" required>
            </div>
            <div class="column is-one-third">
                <label class="label">Apellido Materno</label>
                <input class="input" id="apellidoM" value="${apellidoM}" required>
            </div>


            <!-- Email, Privilege and Date of Entry -->
            <div class="column is-one-third">
                <label class="label">Email</label>
                <input class="input" id="email" value="${email}" required>
            </div>

            <div class="column is-one-third">
                <label class="label">Privilegio</label>
                <select id="privilegio" class="input">
                    <option value="${privilegio}" hidden>${privilegio}</option>
                    <option value="colaborador" >Colaborador</option>
                    <option value="rHumanos" >Recursos Humanos</option>
                    <option value="jefeInmediato" >Jefe Inmediato</option>
                    <option value="direccion" >Dirección</option>
                    <option value="unauthorized" >No autorizado</option>
                </select>
            </div>

            <div class="column is-one-third">
                <label class="label">Fecha de Ingreso</label>
                <input type="date" class="input" id="fechaIngreso" value="${fechaIngreso}" required>
            </div>


            <!-- Area and Position -->
            <div class="column is-one-third">
                <label class="label">Área</label>
                <select id="area" class="input">
                    <option value="${areaUser}" hidden>${areaUser}</option>
                    ${Object.keys(areaToPuestos).map(area => `<option value="${area}">${area}</option>`).join('')}
                </select>
            </div>
            <div class="column is-one-third">
                <label class="label">Puesto</label>
                <select id="puesto" class="input">
                    <option value="${puesto}" hidden>${puesto}</option>
                </select>
            </div>
            <div class="column is-one-third">
                <label class="label">Jefe Inmediato</label>
                <select id="jefeInmediato" class="input" required>
                    ${optionsJefeInmediato}
                </select>
            </div>


            <!-- Photo and Date of Exit -->
            <div class="column is-half">
                <label class="label">Fecha de Baja</label>
                <input type="date" class="input" id="fechaBaja" value="${fechaBaja}" required>
            </div>
            <div class="column is-half">
                <label class="label">Foto de Perfil</label>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <!-- File Input Button -->
                    <div class="file has-name is-boxed" style="flex: 1;">
                        <label class="input" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem;">
                            <i class="fas fa-upload" style="margin: 0rem 0.3rem;font-size: 1.1rem;"></i>
                            <span>Selecciona una imagen</span>
                            <input type="file" name="foto" class="file-input" id="foto" value="${foto}" style="display: none;" onchange="updateImagePreview(event)">
                        </label>
                    </div>

                    <!-- Image Preview -->
                    <div class="input" style="margin-top: 0; width: 48px; height: 48px; position: relative; overflow: hidden; border-radius: 50%; border: 2px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <img 
                            id="profile-img" 
                            src="${foto}"
                            style="position: absolute; top: 50%; left: 50%; width: auto; height: auto; transform: translate(-50%, -50%);"
                            onerror="this.onerror=null; this.src='/img/SIVOC_PFP.png';">
                    </div>
                </div>
            </div>


        </div>
        `,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '777px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },
        didOpen: () => {

            // Función para actualizar la vista previa de la imagen cuando se selecciona un archivo
            window.updateImagePreview = function(event) {
                const file = event.target.files[0];

                if (file) {
                    // Validar extensión del archivo
                    const validExtensions = ['image/jpeg', 'image/png'];
                    if (!validExtensions.includes(file.type)) {
                        Swal.showValidationMessage('Selecciona un archivo de imagen válido (JPEG, PNG).');
                        event.target.value = ''; // Limpia el input de archivo
                        return;
                    }

                    // Validar tamaño del archivo (límite: 2 MB)
                    const maxSize = 2 * 1024 * 1024; // 2 MB
                    if (file.size > maxSize) {
                        Swal.showValidationMessage('El tamaño máximo permitido es de 2 MB.');
                        event.target.value = ''; // Limpia el input de archivo
                        return;
                    }

                    // Leer y mostrar la vista previa de la imagen si todo es válido
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Actualiza la fuente de la imagen en la vista previa
                        document.getElementById('profile-img').src = e.target.result;
                    };
                    reader.readAsDataURL(file); // Lee el archivo como una URL de datos
                }
            };

            const areaSelect = document.getElementById("area");
            const puestoSelect = document.getElementById("puesto");
            areaSelect.addEventListener("change", () => {
                const selectedArea = areaSelect.value; 
                const puestos = areaToPuestos[selectedArea] || []; 
                puestoSelect.innerHTML = DOMPurify.sanitize('<option value="" hidden>Selecciona un puesto</option>');
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
            dateInputIn.addEventListener("click", (event) => {
                event.preventDefault(); // Previene comportamiento predeterminado
                dateInputIn.showPicker(); // Fuerza mostrar el calendario
            });

            // format styles and user experience for calendars (fechaIngreso)
            const todayOut = new Date();
            const formattedISODateOut = todayOut.toISOString().split('T')[0];
            const dateInputOut = document.getElementById("fechaBaja");
            dateInputOut.value = formattedISODateOut;
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
            const area = $('#area').val().trim();
            const fechaBaja = $('#fechaBaja').val();
            const fechaIngreso = $('#fechaIngreso').val();
            const jefeInmediato = $('#jefeInmediato').val().trim();
            const puesto = $('#puesto').val().trim();
            const fileInput = document.getElementById('foto');
            const privilegio = $('#privilegio').val().trim();

            if (/[\{\}\:\$\=\'\*\[\]]/.test(nombre) || /[\{\}\:\$\=\'\*\[\]]/.test(apellidoP) || /[\{\}\:\$\=\'\*\[\]]/.test(apellidoM) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(email) || /[\{\}\:\$\=\'\*\[\]]/.test(area) || /[\{\}\:\$\=\'\*\[\]]/.test(privilegio) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(jefeInmediato) || /[\{\}\:\$\=\'\*\[\]]/.test(puesto)) {
                Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
                return;
            }
            else if (!nombre || !apellidoP || !apellidoM || !email || !area || !fechaBaja || !fechaIngreso || !jefeInmediato
                || !puesto || !privilegio) {
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

            try {
                const responseUser = await fetch('/usuarios/editUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre: nombre,
                        apellidoP: apellidoP,
                        apellidoM: apellidoM,
                        email: email,
                        area: area,
                        fechaBaja: fechaBaja,
                        fechaIngreso: fechaIngreso,
                        // foto: dataFile.message.path,  TODO
                        jefeInmediato: jefeInmediato,
                        puesto: puesto,
                        estaActivo: estaActivo,
                        privilegio: privilegio, 
                    })
                });
                const dataUser = await responseUser.json();
                if (dataUser.success) {
                    Swal.fire({
                        title: 'Usuario EDITADO',
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
    })
};

// restoreUsersView button
async function restoreUsersView() {
    try {
        const response = await fetch('/usuarios/restoreUsersView', {
            method: 'GET',
        });

        // Catch from Controller "/usuarios/restoreUsersView"
        if (!response.ok) {
            Swal.fire({
                title: 'Algo salió mal :(',
                icon: 'error',
                width: "500px",
                text: 'Favor de contactar a Soporte Técnico. (Error #012)'
            });
            return; // restoreUsersView() failed execution
        } else {
            window.location.href = '/usuarios/restoreUsersView';
            return; // restoreUsersView() successful execution
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
        return; // restoreUsersView() failed execution
    }
};

// changePrivilege button
// TODO, si se cambia el privilegio fuera de Jefe Inmediato se debe borrar la relacion con
        // sus trabajadores del equipo (no aparecer en editarUsuario como valor asignado también)
async function changePrivilege(button) { // async function to perform fetch chain
    
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>Cambiar el privilegio del usuario</h2>
                <br><br>
                    <div class="field">
                        <div class="control">
                            <select id="newPrivilege" class="is-fullwidth input">
                            <option value="" hidden>Selecciona un privilegio</option>
                            <option value="colaborador" >Colaborador</option>
                            <option value="rHumanos" >Recursos Humanos</option>
                            <option value="jefeInmediato" >Jefe Inmediato</option>
                            <option value="direccion" >Dirección</option>
                            <option value="unauthorized" >No autorizado</option>
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

            if (!newPrivilege) {
                Swal.showValidationMessage('Selecciona un privilegio para continuar.');
                return;
            }
            
            // Fetch #01 - Execute changePrivilege
            try {
                const response = await fetch('/usuarios/changePrivilege', {
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

                // Catch from Controller "/changePrivilege"
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

