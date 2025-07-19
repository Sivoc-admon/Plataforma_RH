// returnMainTable button : Done
function returnMainTable() {
    window.location.href = '/usuarios/accessUsersModule';
}

// createTeam : Done
async function createTeam(button) {
    try {
        const response = await fetch('/usuarios/createTeam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' } // Not needed but doesn't hurt
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        location.reload(); // Reload only if the request was successful

    } catch (error) {
        console.error("Error creating team:", error);
    }
}

// editTeam : ---
// silver minigun
async function editTeam(button) {


    const teamId = DOMPurify.sanitize(button.getAttribute('teamId'));

    // 1. Fetch populated data from that specific team

    // 2. Create the html and update the list like you did with the files on permits
    // Yes, that includes a delete of the selected


    // 3. Once selected all the members as they cared, fetch it into editTeam();

    // 4. update mongodb and its

    // no asignna personas con personas como si fuesen equpos.
    



    // Convert dates to ISO format
    const fechaIngresoISO = convertSpanishDateToISO(AfechaIngreso);
    const fechaTerminoISO = convertSpanishDateToISO(AfechaTermino);

    Swal.fire({
        html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-pencil" style="margin-right:0.9rem;"></i>Editar Usuario
            </h2>
    
            <div class="columns is-vcentered">
                <div class="column">
                    <label class="label">Nombre</label>
                    <input class="input" id="nombre" value="${Anombre}" required>
                </div>
                <div class="column">
                    <label class="label">Apellido Paterno</label>
                    <input class="input" id="apellidoP" value="${AapellidoP}" required>
                </div>
                <div class="column">
                    <label class="label">Apellido Materno</label>
                    <input class="input" id="apellidoM" value="${AapellidoM}" required>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label class="label">Email</label>
                    <input class="input" id="email" type="email" value="${Aemail}" required>
                </div>
                <div class="column">
                    <label class="label">Fecha de ingreso</label>
                    <input type="text" id="fechaIngreso" style="opacity: 0; position: absolute;" required>
                    <input type="text" id="fechaIngresoDisplay" class="input" readonly>
                </div>
                <div class="column">
                    <label class="label">Fecha de término</label>
                    <input type="text" id="fechaTermino" style="opacity: 0; position: absolute;">
                    <input type="text" id="fechaTerminoDisplay" class="input" readonly>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label class="label">Área</label>
                    <select id="area" class="input">
                        <option value="" hidden> 🔔 Selecciona un área</option>
                        ${Object.keys(areaToPuestos).map(area =>
            `<option value="${area}" ${area === Aarea ? 'selected' : ''}>${area}</option>`
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
                        <option value="colaborador" ${Aprivilegio === 'colaborador' ? 'selected' : ''}>Colaborador</option>
                        <option value="rHumanos" ${Aprivilegio === 'rHumanos' ? 'selected' : ''}>Recursos Humanos</option>
                        <option value="jefeInmediato" ${Aprivilegio === 'jefeInmediato' ? 'selected' : ''}>Jefe Inmediato</option>
                        <option value="direccion" ${Aprivilegio === 'direccion' ? 'selected' : ''}>Dirección</option>
                    </select>
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
            // Setup relationships and date pickers
            setupAreaToPuestoRelationship();
            
            // Setup date inputs with extended functionality for flatpickr
            const setupDateInput = (inputId, displayId, initialDate, readableDate) => {
                const input = document.getElementById(inputId);
                const display = document.getElementById(displayId);
                
                if (!input || !display) return;
                
                // Initialize flatpickr
                const picker = setupDatePicker(inputId);
                
                // Set initial date if provided
                if (initialDate) {
                    picker.setDate(initialDate);
                    // Set the readable date display
                    if (readableDate) {
                        display.value = readableDate;
                    } else {
                        display.value = formatReadableDateTime(initialDate);
                    }
                }
                
                // Handle display click to show picker
                display.addEventListener("click", (event) => {
                    event.preventDefault();
                    picker.open();
                });
                
                // Update display when date changes
                input.addEventListener("change", () => {
                    if (input.value) {
                        display.value = formatReadableDateTime(input.value);
                    } else {
                        display.value = '';
                    }
                });
            };
            
            // Initialize date pickers with values
            setupDateInput('fechaIngreso', 'fechaIngresoDisplay', fechaIngresoISO, AfechaIngreso);
            setupDateInput('fechaTermino', 'fechaTerminoDisplay', fechaTerminoISO, AfechaTermino);
            
            // Set initial value for puesto based on area
            const areaSelect = document.getElementById('area');
            const puestoSelect = document.getElementById('puesto');
            
            if (areaSelect && puestoSelect && Aarea) {
                // Populate puesto options based on selected area
                const puestos = areaToPuestos[Aarea] || [];
                puestoSelect.innerHTML = '<option value="" hidden>🔔 Selecciona un puesto</option>';
                puestos.forEach(puesto => {
                    const option = document.createElement('option');
                    option.value = puesto;
                    option.textContent = puesto;
                    if (puesto === Apuesto) {
                        option.selected = true;
                    }
                    puestoSelect.appendChild(option);
                });
            }
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
                const fechaTermino = $('#fechaTermino').val();
                const privilegio = $('#privilegio').val().trim();

                // Basic validation
                if (!nombre || !apellidoP || !apellidoM || !email || !area ||
                    !fechaIngreso || !puesto || !privilegio) {
                    return Swal.showValidationMessage('Todos los campos son requeridos excepto la fecha de término.');
                }

                // Character validation
                const forbiddenCharsPattern = /[\{\}\:\$\=\'\*\[\]]/;
                if (forbiddenCharsPattern.test(nombre) ||
                    forbiddenCharsPattern.test(apellidoP) ||
                    forbiddenCharsPattern.test(apellidoM) ||
                    forbiddenCharsPattern.test(email) ||
                    forbiddenCharsPattern.test(area) ||
                    forbiddenCharsPattern.test(privilegio) ||
                    forbiddenCharsPattern.test(puesto)) {
                    return Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
                }

                // Email format validation
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    return Swal.showValidationMessage('El formato del correo electrónico no es válido.');
                }

                // Check if email changed and verify no collision
                if (email !== Aemail) {
                    const emailResponse = await fetch('/usuarios/doesEmailExists', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, userId })
                    });
                    const emailData = await emailResponse.json();
                    if (!emailData.success) return Swal.showValidationMessage('Tomar captura y reportar soporte técnico #131.');
                    if (emailData.exists) {
                        return Swal.showValidationMessage('Email existente. Ese email ya está ocupado por otro usuario.');
                    }
                }

                // Instead of FormData
                const jsonData = {
                    userId: userId,
                    nombre: nombre,
                    apellidoP: apellidoP,
                    apellidoM: apellidoM,
                    email: email,
                    area: area,
                    puesto: puesto,
                    fechaIngreso: fechaIngreso,
                    privilegio: privilegio
                };

                // Only add fechaTermino if it has a value
                if (fechaTermino) jsonData.fechaTermino = fechaTermino;

                const response = await fetch('/usuarios/editUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonData)
                });

                const data = await response.json();

                await Swal.fire({
                    title: data.success ? 'Usuario editado' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'Se ha editado el usuario correctamente.' : data.messageText,
                    width: "500px"
                });

                location.reload();

            } catch (error) {
                location.reload();
            }
        }
    });
}













    try {
        const response = await fetch('/usuarios/editTeam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' } // Not needed but doesn't hurt
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        location.reload(); // Reload only if the request was successful

    } catch (error) {
        console.error("Error creating team:", error);
    }
}