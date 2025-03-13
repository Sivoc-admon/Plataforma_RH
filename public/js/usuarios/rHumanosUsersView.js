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

// configureTeamView : Done
async function configureTeamView() {
    try {
        window.location.href = '/usuarios/configureTeamView';
    } catch (error) {
        location.reload();
    }
}

// downloadPDF : Done
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

// downloadExcel : Done
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

// deactivateUser : Done
async function deactivateUser(button) {
    const userId = DOMPurify.sanitize(button.getAttribute('userId'));
    const userName = DOMPurify.sanitize(button.getAttribute('userName'));

    Swal.fire({
        html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-user-xmark" style="margin-right:0.9rem;"></i>Desactivar Usuario
            </h2>

            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                ¿Deseas desactivar a "${userName}"?<br><br>
                Este usuario ya no podrá acceder a la plataforma.
            </div>
        `),
        confirmButtonText: 'Desactivar',
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
            try {                
                const response = await fetch('/usuarios/deactivateUser', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId})
                });
                
                const data = await response.json();

                await Swal.fire({
                    title: data.success ? 'Usuario desactivado' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'El usuario se ha desactivado correctamente.' : data.messageText,
                    width: "500px"
                });

                location.reload();
            } catch (error) {
                location.reload();
            }
        }
    });
}

// changePassword : Done
async function changePassword(button) {
    const userId = DOMPurify.sanitize(button.getAttribute('userId'));
    const userName = DOMPurify.sanitize(button.getAttribute('userName'));

    Swal.fire({
        html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-key" style="margin-right:0.9rem;"></i>Reiniciar contraseña
            </h2>

            <div style="padding: 0.5rem; margin: 1rem 0.5rem">
                Escribe la nueva contraseña para "${userName}".<br><br>
                <input class="input" type="password" id="password" placeholder="Contraseña" maxlength="54" required>
            </div>

        `),
        confirmButtonText: 'Cambiar',
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
            const password = $('#password').val().trim();
            const passwordError = $('#password-error');
        
            // Validate password
            if (!password) return Swal.showValidationMessage('La contraseña es obligatoria.');
            
            // Validate against special characters as per the model
            const invalidCharsRegex = /[\{\}\:\$\=\'\*\[\]]/;
            if (invalidCharsRegex.test(password)) return Swal.showValidationMessage('La contraseña contiene caracteres no permitidos ({ } : $ = \' * [ ])');

            try {        
                const response = await fetch('/usuarios/changePassword', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId: userId, password: password})
                });
                
                const data = await response.json();

                await Swal.fire({
                    title: data.success ? 'Contraseña reiniciada' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'La contraseña se ha reiniciado correctamente.' : data.messageText,
                    width: "500px"
                });

                location.reload();
            } catch (error) {
                location.reload();
            }
        }
    });
}

// requires cliente validation of the teams, editUser : ----
async function editUser(button) {
    
    try {
        Swal.fire({
            html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-pencil" style="margin-right:0.9rem;"></i>Editar Usuario
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
            confirmButtonText: '(En Construcción)',
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
                /*
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
                */
            }
        });
    } catch (error) {
        location.reload();
    }
}