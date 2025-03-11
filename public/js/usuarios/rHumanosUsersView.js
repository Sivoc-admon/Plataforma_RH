// Configuration & Utils
const areaToPuestos = {
    "Administración": ["Director General", "Coordinador de Finanzas", "Gestora de Tesorería", "Coordinador de Recursos Humanos", "Gestor de Recursos Humanos", "Analista de Recursos Humanos"],
    "Ventas": ["Coordinador Comercial", "Gestor de Ventas", "Analista de Ventas"],
    "Calidad": ["Coordinador de Calidad", "Gestor de Calidad", "Analista de Calidad"],
    "Operativo": ["Coordinador Operacional", "Gestor de Ingeniería", "Analista de Ingeniería", "Gestor de Compras", "Analista de Compras", "Gestor de Manufactura", "Analista de Manufactura", "Analista de Almacén"],
    "Pruebas": ["Gestor de Pruebas", "Ingeniero de Servicio A", "Ingeniero de Servicio B", "Ingeniero de Servicio C"]
};
// Utility Functions
const formatReadableDateTime = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
const setupDatePicker = (elementId) => {
    return flatpickr(`#${elementId}`, {
        enableTime: false,
        dateFormat: "Y-m-d\\TH:i",
        time_24hr: true,
        locale: "es",
        defaultDate: new Date()
    });
};
const validateInput = (value, pattern) => {
    if (!value || value.trim() === '') return false;
    if (pattern && !pattern.test(value.trim())) return false;
    return true;
};
// UI Handlers
const setupAreaToPuestoRelationship = () => {
    const areaSelect = document.getElementById("area");
    const puestoSelect = document.getElementById("puesto");
    
    if (!areaSelect || !puestoSelect) return;
    
    areaSelect.addEventListener("change", () => {
        const selectedArea = areaSelect.value;
        const puestos = areaToPuestos[selectedArea] || [];
        
        // Clear and rebuild puesto options
        puestoSelect.innerHTML = '<option value="" hidden>🔔 Selecciona un puesto</option>';
        puestos.forEach(puesto => {
            const option = document.createElement("option");
            option.value = puesto;
            option.textContent = puesto;
            puestoSelect.appendChild(option);
        });
    });
};
const setupImagePreview = () => {
    // Get the file input element
    const fileInput = document.getElementById('foto');
    if (!fileInput) return;
    
    // Attach event listener
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validExtensions = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validExtensions.includes(file.type)) {
            Swal.showValidationMessage('Selecciona un archivo de imagen válido (JPEG, PNG).');
            event.target.value = '';
            return;
        }

        // Validate file size
        const maxSize = 2 * 1024 * 1024; // 2 MB
        if (file.size > maxSize) {
            Swal.showValidationMessage('El tamaño máximo permitido es de 2 MB.');
            event.target.value = '';
            return;
        }

        // Preview the image
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-img').src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};
const setupDateInputs = () => {
    // Setup for date inputs with display
    const setupDateInput = (inputId, displayId) => {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        
        if (!input || !display) return;
        
        // Initialize flatpickr
        setupDatePicker(inputId);
        
        // Set initial value on display
        if (input.value) {
            display.value = formatReadableDateTime(input.value);
        }
        
        // Handle display click to show picker
        display.addEventListener("click", (event) => {
            event.preventDefault();
            input.click();
        });
        
        // Update display when date changes
        input.addEventListener("input", () => {
            display.value = formatReadableDateTime(input.value);
        });
    };

    setupDateInput('fechaIngreso', 'fechaIngresoDisplay');
    
    // For simple date inputs
    const setupSimpleDateInput = (elementId) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        element.value = formattedDate;
        
        element.addEventListener("click", (event) => {
            event.preventDefault();
            element.showPicker();
        });
    };
    
    setupSimpleDateInput('fechaBaja');
};

// addUser : Done
async function addUser() {
    Swal.fire({ 
        html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-user-plus" style="margin-right:0.9rem;"></i>Añadir Usuario
            </h2>
    
            <div class="columns is-vcentered">
                <div class="column">
                    <label class="label">Nombre</label>
                    <input class="input" id="nombre" required>
                </div>
                <div class="column">
                    <label class="label">Apellido Paterno</label>
                    <input class="input" id="apellidoP" required>
                </div>
                <div class="column">
                    <label class="label">Apellido Materno</label>
                    <input class="input" id="apellidoM" required>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label class="label">Email</label>
                    <input class="input" id="email" type="email" required>
                </div>
                <div class="column">
                    <label class="label">Contraseña</label>
                    <input class="input" id="password" type="password" required>
                </div>
                <div class="column">
                    <label class="label">Fecha de ingreso</label>
                    <input type="text" id="fechaIngreso" style="opacity: 0; position: absolute;" required>
                    <input type="text" id="fechaIngresoDisplay" class="input" readonly>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label class="label">Área</label>
                    <select id="area" class="input">
                        <option value="" hidden> 🔔 Selecciona un área</option>
                        ${Object.keys(areaToPuestos).map(area => 
                            `<option value="${area}">${area}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="column">
                    <label class="label">Puesto</label>
                    <select id="puesto" class="input">
                        <option value="" hidden> 🔔 Selecciona un área primero</option>
                    </select>
                </div>
                <div class="column">
                    <label class="label">Privilegio</label>
                    <select id="privilegio" class="input">
                        <option value="" hidden> 🔔 Selecciona un privilegio</option>
                        <option value="colaborador">Colaborador</option>
                        <option value="rHumanos">Recursos Humanos</option>
                        <option value="jefeInmediato">Jefe Inmediato</option>
                        <option value="direccion">Dirección</option>
                    </select>
                </div>
            </div>

            <div class="columns is-vcentered">
                                    
                <div class="column">
                    <label class="label">Foto de Perfil</label>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="file has-name is-boxed" style="flex: 1;">
                            <label class="input" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem;">
                                <i class="fas fa-upload" style="margin: 0rem 0.3rem;font-size: 1.1rem;"></i>
                                <span>Selecciona una imagen cuadrada</span>
                                <input type="file" name="foto" class="file-input" id="foto" style="display: none;">
                            </label>
                        </div>
                        <div class="input" style="margin-top: 0; width: 48px; height: 48px; position: relative; overflow: hidden; border-radius: 50%; border: 2px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <img 
                                id="profile-img" 
                                style="position: absolute; top: 50%; left: 50%; width: auto; height: auto; transform: translate(-50%, -50%);">
                        </div>
                    </div>
                </div>
            </div>
        `),
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '1011px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },
        didOpen: () => {
            setupAreaToPuestoRelationship();
            setupImagePreview();
            setupDateInputs();
        },
        preConfirm: async () => {
            try {
                const nombre = $('#nombre').val().trim();
                const apellidoP = $('#apellidoP').val().trim();
                const apellidoM = $('#apellidoM').val().trim();
                const email = $('#email').val().trim();
                const password = $('#password').val().trim();
                const area = $('#area').val().trim();
                const puesto = $('#puesto').val().trim();
                const fechaIngreso = $('#fechaIngreso').val();
                const privilegio = $('#privilegio').val().trim();
                const fileInput = document.getElementById('foto');
                
                // Base validation
                if (!nombre || !apellidoP || !apellidoM || !email || !password || 
                    !area || !puesto || !fechaIngreso || !privilegio) {
                    return Swal.showValidationMessage('Todos los campos a excepción de la foto son requeridos.');
                }

                // Character validation 
                const forbiddenCharsPattern = /[\{\}\:\$\=\'\*\[\]]/;
                if (forbiddenCharsPattern.test(nombre) || 
                    forbiddenCharsPattern.test(apellidoP) || 
                    forbiddenCharsPattern.test(apellidoM) ||
                    forbiddenCharsPattern.test(email)) {
                    return Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
                }
                
                // Email format validation
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    return Swal.showValidationMessage('El formato del correo electrónico no es válido.');
                }

                // Check if email exists
                const emailResponse = await fetch('/usuarios/doesEmailExists', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                    })

                });
                const emailData = await emailResponse.json(); 
                if (!emailData.success) return Swal.showValidationMessage('Tomar captura y reportar soporte técnico #130.');
                if (emailData.exists) return Swal.showValidationMessage('El correo electrónico ya se encuentra ocupado.');


                // Create a single form data for the entire operation
                const formData = new FormData();
                formData.append('nombre', nombre);
                formData.append('apellidoP', apellidoP);
                formData.append('apellidoM', apellidoM);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('area', area);
                formData.append('puesto', puesto);
                formData.append('fechaIngreso', fechaIngreso);
                formData.append('privilegio', privilegio);
                
                // Append the file if it exists
                if (fileInput.files[0]) {
                    formData.append('files', fileInput.files[0]);
                }
                
                // Single fetch call
                const response = await fetch('/usuarios/addUser', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();

                await Swal.fire({
                    title: data.success ? 'Usuario añadido' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'Se añadió el usuario correctamente.' : data.messageText,
                    width: "500px"
                });

                location.reload();

            } catch (error) {
                location.reload();
            }
        }
    });
}

// restoreUsersView : Done
async function restoreUsersView() {
    try {
        window.location.href = '/usuarios/restoreUsersView';
    } catch (error) {
        location.reload();
    }
}


// configureTeamView : ---
async function configureTeamView() {
    try {
        window.location.href = '/usuarios/configureTeamView';
    } catch (error) {
        location.reload();
    }
}


// downloadPDF : ---
async function downloadPDF() {
    try {
        window.location.href = '/usuarios/downloadPDF';
        Swal.fire({
            title: 'PDF descargado',
            icon: 'success',
            width: "500px",
            text: 'El archivo se descargó correctamente.'
        });
    } catch (error) {
        location.reload();
    }
};

// downloadExcel : ---
async function downloadExcel() {
    try {
        window.location.href = '/usuarios/downloadExcel';
        Swal.fire({
            title: 'Excel descargado',
            icon: 'success',
            width: "500px",
            text: 'El archivo se descargó correctamente.'
        });
    } catch (error) {
        location.reload();
    }
};




async function editUser(button) {
    
    try {

        console.log("Hi!");

        // Prepare jefe inmediato options
        let jefeInmediatoName = "Selecciona un Jefe";
        if (jefeInmediatoObject) {
            jefeInmediatoName = `${jefeInmediatoObject.nombre} ${jefeInmediatoObject.apellidoP} ${jefeInmediatoObject.apellidoM}`;
        }
        
        // Show edit form
        Swal.fire({
            html: `
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">Datos del Colaborador</h2>

            <div class="columns is-multiline">
                <!-- Name Fields -->
                <div class="column is-one-third">
                    <label class="label">Nombre</label>
                    <input class="input" id="nombre" value="${user.nombre}" required>
                </div>
                <div class="column is-one-third">
                    <label class="label">Apellido Paterno</label>
                    <input class="input" id="apellidoP" value="${user.apellidoP}" required>
                </div>
                <div class="column is-one-third">
                    <label class="label">Apellido Materno</label>
                    <input class="input" id="apellidoM" value="${user.apellidoM}" required>
                </div>

                <!-- Email, Privilege and Date of Entry -->
                <div class="column is-one-third">
                    <label class="label">Email</label>
                    <input class="input" id="email" value="${user.email}" required>
                </div>
                <div class="column is-one-third">
                    <label class="label">Privilegio</label>
                    <select id="privilegio" class="input">
                        <option value="${user.privilegio}" hidden>${user.privilegio}</option>
                        <option value="colaborador">Colaborador</option>
                        <option value="rHumanos">Recursos Humanos</option>
                        <option value="jefeInmediato">Jefe Inmediato</option>
                        <option value="direccion">Dirección</option>
                    </select>
                </div>
                <div class="column is-one-third">
                    <label class="label">Fecha de Ingreso</label>
                    <input type="date" class="input" id="fechaIngreso" value="${user.fechaIngreso}" required>
                </div>

                <!-- Area and Position -->
                <div class="column is-one-third">
                    <label class="label">Área</label>
                    <select id="area" class="input">
                        <option value="${user.area}" hidden>${user.area}</option>
                        ${Object.keys(areaToPuestos).map(area => 
                            `<option value="${area}">${area}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="column is-one-third">
                    <label class="label">Puesto</label>
                    <select id="puesto" class="input">
                        <option value="${user.puesto}" hidden>${user.puesto}</option>
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
                    <input type="date" class="input" id="fechaBaja" value="${user.fechaBaja || ''}" required>
                </div>
                <div class="column is-half">
                    <label class="label">Foto de Perfil</label>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="file has-name is-boxed" style="flex: 1;">
                            <label class="input" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem;">
                                <i class="fas fa-upload" style="margin: 0rem 0.3rem;font-size: 1.1rem;"></i>
                                <span>Selecciona una imagen</span>
                                <input type="file" name="foto" class="file-input" id="foto" style="display: none;" onchange="updateImagePreview(event)">
                            </label>
                        </div>
                        <div class="input" style="margin-top: 0; width: 48px; height: 48px; position: relative; overflow: hidden; border-radius: 50%; border: 2px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <img 
                                id="profile-img" 
                                src="${user.foto ? user.foto.replace("public", "") : ''}"
                                style="position: absolute; top: 50%; left: 50%; width: auto; height: auto; transform: translate(-50%, -50%);"
                                onerror="this.onerror=null; this.src='/SIVOC_PFP.png';">
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
                setupAreaToPuestoRelationship();
                setupImagePreview();
                setupDateInputs();
            },
            preConfirm: async () => {
                try {
                    // Get all form values
                    const nombre = $('#nombre').val().trim();
                    const apellidoP = $('#apellidoP').val().trim();
                    const apellidoM = $('#apellidoM').val().trim();
                    const email = $('#email').val().trim();
                    const area = $('#area').val().trim();
                    const puesto = $('#puesto').val().trim();
                    const fechaIngreso = $('#fechaIngreso').val();
                    const fechaBaja = $('#fechaBaja').val();
                    const jefeInmediato = $('#jefeInmediato').val().trim();
                    const privilegio = $('#privilegio').val().trim();
                    const fileInput = document.getElementById('foto');
                    
                    // Basic validation
                    if (!nombre || !apellidoP || !apellidoM || !email || !area || 
                        !fechaIngreso || !jefeInmediato || !puesto || !privilegio) {
                        return Swal.showValidationMessage('Todos los campos son requeridos.');
                    }
                    
                    // Character validation
                    const forbiddenCharsPattern = /[\{\}\:\$\=\'\*\[\]]/;
                    if (forbiddenCharsPattern.test(nombre) || 
                        forbiddenCharsPattern.test(apellidoP) || 
                        forbiddenCharsPattern.test(apellidoM) ||
                        forbiddenCharsPattern.test(email) || 
                        forbiddenCharsPattern.test(area) || 
                        forbiddenCharsPattern.test(privilegio) ||
                        forbiddenCharsPattern.test(jefeInmediato) || 
                        forbiddenCharsPattern.test(puesto)) {
                        return Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
                    }
                    
                    // Check if email changed and verify no collision
                    if (email !== user.email) {
                        const emailResponse = await fetch('/usuarios/doesEmailExists', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email, userId: user._id })
                        });
                        const emailData = await emailResponse.json();
                        if (!emailData.success) throw new Error('Error checking email');
                        if (emailData.exists) {
                            return Swal.showValidationMessage('Email existente. Ese email ya está ocupado por otro usuario.');
                        }
                    }
                    
                    // Create form data
                    const formData = new FormData();
                    formData.append('userId', user._id);
                    formData.append('nombre', nombre);
                    formData.append('apellidoP', apellidoP);
                    formData.append('apellidoM', apellidoM);
                    formData.append('email', email);
                    formData.append('area', area);
                    formData.append('puesto', puesto);
                    formData.append('fechaIngreso', fechaIngreso);
                    formData.append('fechaBaja', fechaBaja);
                    formData.append('jefeInmediato', jefeInmediato);
                    formData.append('privilegio', privilegio);
                    formData.append('estaActivo', user.estaActivo);
                    
                    // Append file if exists
                    if (fileInput.files[0]) {
                        formData.append('file', fileInput.files[0]);
                    }
                    
                    // Single fetch for edit
                    const response = await fetch('/usuarios/editUser', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        Swal.fire({
                            title: 'Usuario actualizado',
                            icon: 'success',
                            width: "500px",
                            text: 'El usuario se actualizó correctamente.'
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        throw new Error(data.message || 'Error al actualizar el usuario');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showErrorAlert('002');
                }
            }
        });
    } catch (error) {
        location.reload();
    }
}

async function changePrivilege(button) {
    hideSidebar();
    
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>Cambiar el privilegio del usuario</h2>
                <br><br>
                <div class="field">
                    <div class="control">
                        <select id="newPrivilege" class="is-fullwidth input">
                            <option value="" hidden>Selecciona un privilegio</option>
                            <option value="colaborador">Colaborador</option>
                            <option value="rHumanos">Recursos Humanos</option>
                            <option value="jefeInmediato">Jefe Inmediato</option>
                            <option value="direccion">Dirección</option>
                            <option value="unauthorized">No autorizado</option>
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
        width: '600px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },
        preConfirm: async () => {
            try {
                const userId = button.getAttribute('userId');
                const newPrivilege = $('#newPrivilege').val();
                
                if (!newPrivilege) {
                    return Swal.showValidationMessage('Selecciona un privilegio para continuar.');
                }
                
                const response = await fetch('/usuarios/changePrivilege', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId, newPrivilege})
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire({
                        title: 'Privilegio configurado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha cambiado el privilegio del usuario correctamente.'
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    throw new Error(data.message || 'Error al cambiar el privilegio');
                }
            } catch (error) {
                console.error('Error:', error);
                showErrorAlert('015');
            }
        }
    });
}

async function deactivateUser(button) {
    Swal.fire({
        html: `
            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                <h2>¿Deseas desactivar este usuario?</h2>
                <h2>Ya no podrá acceder a la plataforma.</h2>
            </div>
        `,
        confirmButtonText: 'Desactivar usuario',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '600px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },
        preConfirm: async () => {
            try {
                const userId = button.getAttribute('userId');
                
                const response = await fetch('/usuarios/deactivateUser', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId})
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Swal.fire({
                        title: 'Usuario desactivado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha desactivado el usuario correctamente.'
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    throw new Error(data.message || 'Error al desactivar el usuario');
                }
            } catch (error) {
                console.error('Error:', error);
                showErrorAlert('005');
            }
        }
    });
}