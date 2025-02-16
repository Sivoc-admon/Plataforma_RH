// viewPermitsRowFile : Done
async function viewPermitsRowFile(button) {
    window.open(DOMPurify.sanitize(`/permisos/viewPermitsRowFile/${button.getAttribute('permitId')}/${button.getAttribute('filename')}`));
};

// createPermitRequest : Done
async function createPermitRequest(theInput) {
    const registro = DOMPurify.sanitize(theInput);
    let archivosSeleccionados = [];
    Swal.fire({
        html: DOMPurify.sanitize(`
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-clipboard-user" style="margin-right:0.9rem;"></i>Registrar Permiso
        </h2>

        <div class="columns is-multiline">
            <div class="column">
                <!-- Field -->
                <div class="column">
                    <label class="label">Tipo de registro</label>
                    <input type="text" id="registro" class="input" value="${registro}" style=" background: var(--cyan);" required readOnly>
                </div>

                <!-- Field -->
                <div class="column">
                    <label class="label">Filtro de permiso</label>
                    <select id="filtro" class="input">
                        <option value="" hidden>Seleccione filtro</option>
                        <option value="Home Office">Home Office</option>
                        <option value="Cita Médica">Cita Médica</option>
                        <option value="Asunto Familiar">Asunto Familiar</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>


                <!-- Field -->
                <div class="column">
                    <label class="label">Fecha inicio</label>
                        <!-- 200 iq (Must be placed in this order) -->
                        <input type="text" id="fechaYHoraInicio" style="opacity: 0; position: absolute;" required readOnly>
                        <input type="text" id="fechaYHoraInicioDisplay" value="Seleccione una fecha" class="input" readOnly />
                </div>

                <!-- Field -->
                <div class="column">
                    <label class="label">Fecha Termino</label>
                        <!-- 200 iq (Must be placed in this order) -->
                        <input type="text" id="fechaYHoraFinal" style="opacity: 0; position: absolute;" required readOnly>
                        <input type="text" id="fechaYHoraFinalDisplay" value="Seleccione una fecha" class="input" readOnly />
                </div>
            </div>

            <!-- Field -->
            <div class="column">
                <div class="column">
                    <label class="label">Agregar archivos (opcional)</label>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="file has-name is-boxed" style="flex: 1;">
                            <label class="input"
                                style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem; font-family: var(--font);">
                                <i class="fas fa-upload" style="margin: 0rem 0.3rem; font-size: 1.1rem;"></i>
                                <span>Subir archivo</span>
                                <input type="file" name="files" class="file-input" id="files" style="display: none;" multiple
                                    onChange="validateUpload()" />
                            </label>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <label class="label">Archivos seleccionados</label>
                    <ul id="subidos" style="margin:0.6rem; padding-top:1rem;"></ul>
                </div>
            </div>
        </div>

        `),
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '888px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },
        didOpen: () => {
            /* Front-end Date Setup */
            const fechaYHoraInicio = flatpickr("#fechaYHoraInicio", {
                enableTime: (registro !== "Incapacidad"),
                dateFormat: "Y-m-d\\TH:i:S",  // Formato ISO
                time_24hr: true,
                locale: "es",
                minDate: new Date().fp_incr(1),  // No permitir fechas pasadas
                onChange: function (selectedDates, dateStr, instance) {
                    let fecha = selectedDates[0];  // Obtenemos la fecha seleccionada en fechaYHoraInicio
                    if (fecha) {
                        let nuevaFecha = new Date(fecha);
                        nuevaFecha.setHours(nuevaFecha.getHours() + 24)
                        fechaYHoraFinal.set("minDate", nuevaFecha);
                    }
                },
                maxDate: "",
            });
            const fechaYHoraFinal = flatpickr("#fechaYHoraFinal", {
                enableTime: (registro !== "Incapacidad"),
                dateFormat: "Y-m-d\\TH:i:S",  // Formato ISO
                time_24hr: true,
                locale: "es",
                minDate: new Date().fp_incr(2),  // La fecha mínima inicial de fechaYHoraFinal será "hoy"
                onChange: function (selectedDates, dateStr, instance) {
                    let fecha = selectedDates[0];  // Obtenemos la fecha seleccionada
                    if (fecha) {
                        let nuevaFecha = new Date(fecha);
                        nuevaFecha.setHours(nuevaFecha.getHours() - 24)
                        fechaYHoraInicio.set("maxDate", nuevaFecha);
                    }
                },
            });
            const formatReadableDateTime = (isoDate) => {
                const date = new Date(isoDate);
                const readableDate = date.toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
                const readableTime = date.toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false

                });
                if (registro === "Incapacidad") return `${readableDate}`;
                return `${readableDate}, ${readableTime}`;
            };

            const fechaYHoraInicioDisplay = document.getElementById("fechaYHoraInicioDisplay");
            const dateInputIn = document.getElementById("fechaYHoraInicio");
            fechaYHoraInicioDisplay.addEventListener("click", (event) => {
                event.preventDefault(); // Previene el comportamiento predeterminado
                dateInputIn.click(); // Muestra el selector de fecha
            });
            dateInputIn.addEventListener("input", () => {
                fechaYHoraInicioDisplay.value = formatReadableDateTime(dateInputIn.value);
            });

            const fechaYHoraFinalDisplay = document.getElementById("fechaYHoraFinalDisplay");
            const dateInputOut = document.getElementById("fechaYHoraFinal");
            fechaYHoraFinalDisplay.addEventListener("click", (event) => {
                event.preventDefault(); // Previene el comportamiento predeterminado
                dateInputOut.click(); // Muestra el selector de fecha
            });
            dateInputOut.addEventListener("input", () => {
                fechaYHoraFinalDisplay.value = formatReadableDateTime(dateInputOut.value);
            });
            /* Front-end Date Setup */

            /* Front-end File Setup */
            // let archivosSeleccionados = []; function level scope
            document.getElementById("files").addEventListener("change", function () {
                const files = Array.from(this.files);
                const allowedExtensions = ['png', 'jpeg', 'jpg', 'pdf', 'doc', 'docx'];
                const maxSize = 3 * 1024 * 1024; // 3 MB
                files.forEach(file => {
                    const fileExtension = file.name.split('.').pop().toLowerCase();

                    // Front-end validations
                    if (!file.name)
                        return Swal.showValidationMessage("El archivo no tiene nombre.");
                    if (file.name.length > 51)
                        return Swal.showValidationMessage("El nombre es muy largo");
                    file.name = ((x) => x.replace(/[<>:"'/\\|?*]/g, ""))(file.name);
                    if (!allowedExtensions.includes(fileExtension))
                        return Swal.showValidationMessage("Formato de archivo inválido.");
                    if (file.size > maxSize)
                        return Swal.showValidationMessage(DOMPurify.sanitize(`El archivo ${file.name} excede el tamaño máximo de 3 MB.`));
                    if (file.size <= 0)
                        return Swal.showValidationMessage("No se permiten añadir archivos vacios.");
                    if (archivosSeleccionados.length >= 3)
                        return Swal.showValidationMessage("Solo se permiten ingresar 3 archivos.");
                    if (archivosSeleccionados.some(f => f.name === file.name))
                        return Swal.showValidationMessage("El archivo ya se encuentra en la fila.");
                    Swal.resetValidationMessage();
                    archivosSeleccionados.push(file);
                });
                updateFileList();
            });

            function updateFileList() {
                const subidosDiv = document.getElementById("subidos");
                subidosDiv.innerHTML = DOMPurify.sanitize("");
                archivosSeleccionados.forEach((file, index) => {
                    const fileItem = document.createElement("div");
                    fileItem.classList.add("fil3e-item", "columns", "is-vcentered");
                    fileItem.style.marginTop = "0.6rem";
                    fileItem.innerHTML = DOMPurify.sanitize(`
                            <div>
                                <button class="default-button-css table-button-css delete-file" data-index="${index}">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            <div class="column" style="align-self:center; justify-self:center;">
                                <p>${file.name}</p>
                            </div>
                        `);
                    subidosDiv.appendChild(fileItem);
                });
                document.querySelectorAll(".delete-file").forEach(button => {
                    button.addEventListener("click", function () {
                        const index = parseInt(this.getAttribute("data-index"));
                        deletePermitFromArrayAndHtml(index);
                    });
                });
            }
            function deletePermitFromArrayAndHtml(index) {
                archivosSeleccionados.splice(index, 1);
                Swal.resetValidationMessage();
                updateFileList();
            }
            /* Front-end File Setup */

        },
        preConfirm: async () => { // Single Fetch
            try {
                // 0. Prepare the values
                const filtro = $('#filtro').val();
                const fechaInicio = $('#fechaYHoraInicio').val();
                const fechaTermino = $('#fechaYHoraFinal').val();
                const fechaInicioDate = new Date(fechaInicio);
                const fechaTerminoDate = new Date(fechaTermino);

                // 1. Front-end pre-fetch validation
                if (!registro || !filtro || !fechaInicio || !fechaTermino || isNaN(fechaInicioDate.getTime()) || isNaN(fechaTerminoDate.getTime())) {
                    return Swal.showValidationMessage('Todos los campos son requeridos.');
                }

                // 2. Build formData
                const formData = new FormData();
                formData.append("registro", registro);
                formData.append("filtro", filtro);
                formData.append("fechaInicio", fechaInicio);
                formData.append("fechaTermino", fechaTermino);

                for (let file of archivosSeleccionados) {
                    formData.append("files", file);
                }

                // 3. Fetch formData
                const response = await fetch('/permisos/createPermitRequest', {
                    method: 'POST',
                    body: formData,
                });

                // 4. Show response
                const data = await response.json();
                const { title, icon, text } = data.success
                    ? { title: 'Permiso creado', icon: 'success', text: 'Se añadió el permiso correctamente.' }
                    : { title: data.messageTitle, icon: 'error', text: data.messageText };
                await Swal.fire({ title, icon, width: "500px", text });
                location.reload();

                // Just reload
            } catch (error) {
                location.reload();
            }

        }
    })
};


// editPermit button : ---
async function editPermit(button) {
    try {
        // A. FETCH DATA
        const permitId = button.getAttribute('permitId');
        const permitResponse = await fetch('/permisos/editPermit/getInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                permitId: permitId,
            })
        });
        const permitData = await permitResponse.json();
        if (!permitData.success)
            return Swal.fire({
                title: permitData.messageTitle,
                icon: 'error',
                text: permitData.messageText,
            });

    /*
:{"_id":"6796a567dbfbef1cf4be0454",
"userId":"678015aab366e37052cf12bc","registro":"Permiso","filtro":"Cita Medica","fechaInicio":"14 de enero de 2025, 15:12","fechaTermino":"1 de febrero de 2025, 15:12",
"docPaths":[{"_id":"6796a566dbfbef1cf4be0452","originalname":"Mundo yoto (1).pdf"}],"estatus":"Pendiente","isSent":false,"isVerified":false,"__v":0}}
    */
    
    // B. EDIT ON POP-UP
    Swal.fire({
        html: DOMPurify.sanitize(`
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-pencil" style="margin-right:0.9rem;"></i>Editar Permiso
        </h2>

        <div class="columns is-multiline">
            <div class="column">
                <!-- Field -->
                <div class="column">
                    <label class="label">Tipo de registro</label>
                    <input type="text" id="registro" class="input" value="${permitData.message.registro}" style=" background: var(--cyan);" required readOnly>
                </div>

                <!-- Field -->
                <div class="column">
                    <label class="label">Filtro de permiso</label>
                    <select id="filtro" class="input">
                        <option value="${permitData.message.filtro}" hidden>${permitData.message.filtro}</option>
                        <option value="Home Office">Home Office</option>
                        <option value="Cita Médica">Cita Médica</option>
                        <option value="Asunto Familiar">Asunto Familiar</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>


                <!-- Field -->
                <div class="column">
                    <label class="label">Fecha inicio</label>
                        <!-- 200 iq (Must be placed in this order) -->
                        <input type="text" id="fechaYHoraInicio" style="opacity: 0; position: absolute;" required readOnly>
                        <input type="text" id="fechaYHoraInicioDisplay" value="Seleccione una fecha" class="input" readOnly />
                </div>

                <!-- Field -->
                <div class="column">
                    <label class="label">Fecha Termino</label>
                        <!-- 200 iq (Must be placed in this order) -->
                        <input type="text" id="fechaYHoraFinal" style="opacity: 0; position: absolute;" required readOnly>
                        <input type="text" id="fechaYHoraFinalDisplay" value="Seleccione una fecha" class="input" readOnly />
                </div>
            </div>

            <!-- Field -->
            <div class="column">
                <div class="column">
                    <label class="label">Agregar archivos (opcional)</label>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="file has-name is-boxed" style="flex: 1;">
                            <label class="input"
                                style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem; font-family: var(--font);">
                                <i class="fas fa-upload" style="margin: 0rem 0.3rem; font-size: 1.1rem;"></i>
                                <span>Subir archivo</span>
                                <input type="file" name="files" class="file-input" id="files" style="display: none;" multiple
                                    onChange="validateUpload()" />
                            </label>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <label class="label">Archivos seleccionados</label>
                    <ul id="subidos" style="margin:0.6rem; padding-top:1rem;"></ul>
                </div>
            </div>
        </div>

        `),
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '888px',
        customClass: {
            confirmButton: 'default-button-css',
            cancelButton: 'default-button-css',
        },
        didOpen: () => {
        },
        preConfirm: async () => { // Single Fetch
            try {

                // Just reload
            } catch (error) {
                location.reload();
            }

        }
    })


    // C. POST METHOD


    } catch (error) {
        location.reload();
    }
};



/*

const originalDocs = permitObject.docPaths;

// Función para convertir fechas del formato legible a ISO
function formatFecha(fechaString) {
    const meses = {
        enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
        julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
    };

    return new Date(fechaString.replace(/(\d{1,2}) de (\w+) de (\d{4}), (\d{2}):(\d{2})/, function (_, dia, mes, anio, hora, minuto) {
        return `${anio}-${meses[mes] || '01'}-${dia.padStart(2, '0')}T${hora}:${minuto}`;
    }));
}
const formattedFechaInicio = formatFecha(permitObject.fechaInicio).toISOString().slice(0, 16);
const formattedFechaTermino = formatFecha(permitObject.fechaTermino).toISOString().slice(0, 16);

let archivosSeleccionados = []; // Lista para almacenar los archivos seleccionados

Swal.fire({
    html: `
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-pencil" style="margin-right:0.9rem;"></i>Editar Permiso
        </h2>

        <div class="columns is-multiline">

            <!-- Fields -->
            <div class="column">

                            <div class="column">

                <label class="label">Tipo de registro</label>
                <select id="registro" class="input">
                    <option value="${permitObject.registro}" hidden>${permitObject.registro}</option>
                    <option value="Incapacidad">Incapacidad</option>
                    <option value="Permiso">Permiso</option>
                </select>
                </div>

                            <div class="column">
                <label class="label">Filtro de permiso</label>
                <select id="filtro" class="input">
                    <option value="${permitObject.filtro}" hidden>${permitObject.filtro}</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Cita Médica">Cita Médica</option>
                    <option value="Asunto Familiar">Asunto Familiar</option>
                    <option value="Otro">Otro</option>
                </select> 
                </div>


                            <div class="column">
                <label class="label">Fecha inicio</label>
                <!-- dynamically generated, must view "didOpen" -->
                <input type="datetime-local" class="input" value="${formattedFechaInicio}" id="fechaYHoraInicio" required>
                </div>


                            <div class="column">
                <label class="label">Fecha de termino</label>
                <input type="datetime-local" class="input" value="${formattedFechaTermino}" id="fechaYHoraFinal" required>
                </div>


            </div>
            


            
<div class="column">
    <div class="column">
        <label class="label">Agregar archivos (opcional)</label>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <!-- File Input Button -->
            <div class="file has-name is-boxed" style="flex: 1;">
                <label class="input" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem; font-family: var(--font);">
                    <i class="fas fa-upload" style="margin: 0rem 0.3rem; font-size: 1.1rem;"></i>
                    <span>Subir archivo</span>
                    <input type="file" name="files" class="file-input" id="files" style="display: none;" multiple onchange="validateUpload(event)" />
                </label>
            </div>
        </div>
    </div>

    <div class="column">
        <label class="label">Archivos seleccionados</label>
        <ul id="subidos" style="margin:0.6rem; padding-top:1rem;"></ul>
    </div>
</div>





        </div>

        `,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    cancelButtonColor: '#f0466e',
    showCancelButton: true,
    allowOutsideClick: false,
    width: '888px',
    customClass: {
        confirmButton: 'default-button-css',
        cancelButton: 'default-button-css',
    },
    didOpen: () => {

        // preload the already existing files
        if (originalDocs && originalDocs.length > 0) {
            originalDocs.forEach(doc => {
                // add the atribute "name": doc.originalname to each
                doc.name = doc.originalname;
            });

            // critical, create an INDEPENDENT copy using this format
            archivosSeleccionados = JSON.parse(JSON.stringify(originalDocs));
            updateFileList();
        }

        // format styles and user experience for calendars (fechaYHoraInicio) !!
        const dateInputIn = document.getElementById("fechaYHoraInicio");
        dateInputIn.addEventListener("click", (event) => {
            event.preventDefault(); // Previene comportamiento predeterminado
            dateInputIn.showPicker(); // Fuerza mostrar el calendario
        });

        // format styles and user experience for calendars (fechaYHoraFinal) !!
        const dateInputOut = document.getElementById("fechaYHoraFinal");
        dateInputOut.addEventListener("click", (event) => {
            event.preventDefault(); // Previene comportamiento predeterminado
            dateInputOut.showPicker(); // Fuerza mostrar el calendario
        });

        // Función para validar y mostrar archivos
        window.validateUpload = function (event) {
            const files = Array.from(event.target.files); // Convertir FileList a Array
            files.forEach(file => {
                const fileExtension = file.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['png', 'jpeg', 'jpg', 'pdf', 'doc', 'docx'];
                const maxSize = 3 * 1024 * 1024; // 3 MB

                // Validaciones
                if (!allowedExtensions.includes(fileExtension)) {
                    Swal.showValidationMessage(`El formato de archivo ${file.name} no es válido. Solo se permiten: ${allowedExtensions.join(', ')}`);
                    return;
                } else if (file.size > maxSize) {
                    Swal.showValidationMessage(`El archivo ${file.name} excede el tamaño máximo de 3 MB.`);
                    return;
                } else if (archivosSeleccionados.length >= 3) {
                    Swal.showValidationMessage(`Solo se permiten ingresar 3 archivos`);
                    return;
                }

                archivosSeleccionados.push(file); // Agregar archivo a la lista
            });

            // Actualizar la lista de archivos en el DOM
            updateFileList();
        };

        // Función para actualizar el DOM con los archivos seleccionados
        function updateFileList() {
            const subidosDiv = document.getElementById('subidos');
            subidosDiv.innerHTML = DOMPurify.sanitize(''); // Limpiar lista anterior
            archivosSeleccionados.forEach((file, index) => {
                subidosDiv.innerHTML += DOMPurify.sanitize(`
                        <div class="file-item columns is-vcentered" style="margin-top:0.6rem;">
                            <div>
                                <button class="default-button-css table-button-css" onclick="deletePermitFromArrayAndHtml(${index})">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <div class="column" style="align-self:center; justify-self:center;">
                                <p>${file.name}</p>
                            </div>
                        </div>
                    `);
            });
        }
        // Función para eliminar un archivo
        window.deletePermitFromArrayAndHtml = function (index) {
            archivosSeleccionados.splice(index, 1); // Eliminar archivo del array
            updateFileList(); // Actualizar el DOM
        };

    },
    preConfirm: async () => {
        // if fileObject.isFile === false, then skip it
        // compare the changes of the old list to the new list
        // execute deletes / uploads based on that
        const registro = $('#registro').val().trim();
        const filtro = $('#filtro').val().trim();
        const fechaYHoraInicio = new Date($('#fechaYHoraInicio').val().trim());
        const fechaYHoraFinal = new Date($('#fechaYHoraFinal').val().trim());
        const docPaths = [];

        // Prefecth validations
        if (/[\{\}\:\$\=\'\*\[\]]/.test(registro) || /[\{\}\:\$\=\'\*\[\]]/.test(filtro)) {
            Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
            return;
        } else if (!registro || !filtro || !fechaYHoraInicio || !fechaYHoraFinal || isNaN(fechaYHoraInicio.getTime()) || isNaN(fechaYHoraFinal.getTime())) {
            Swal.showValidationMessage('Todos los campos son requeridos.');
            return;
        } else if (fechaYHoraInicio >= fechaYHoraFinal) { // Catch impossible timeframe
            Swal.showValidationMessage('La hora de termino debe ser después de la hora de inicio.');
            return;
        }

        // Transform dates into readable
        const formatReadableDateTime = (isoDate) => {
            const date = new Date(isoDate);
            const readableDate = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const readableTime = date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
            });
            return `${readableDate}, ${readableTime}`;
        };
        const fechaInicio = formatReadableDateTime(fechaYHoraInicio.toISOString());
        const fechaTermino = formatReadableDateTime(fechaYHoraFinal.toISOString());



        // 1. Detecta los cambios de ambas listas
        // a. file exists in docs but not in archivosSeleccionados = DELETE
        // b. file doesnt exist in docs but does in archivosSeleccionados = UPLOAD
        // c. file doesnt exist neither docs nor archivosSeleccionados = skip
        // d. file exists in docs and in archivosSeleccionados = skip

        // Resultado:
        // a. forEach docs that !archivosSeleccionados.includes() = DELETE
        // b. forEach archivosSeleccionados that !docs.includes() = UPLOAD

        // a. forEach docs that !archivosSeleccionados.includes() = DELETE
        async function processDeletes() {
            for (const originalDoc of originalDocs) {
                // Verificamos si el documento no está en archivosSeleccionados
                if (!archivosSeleccionados.some((selectedDoc) =>
                    JSON.stringify(selectedDoc) === JSON.stringify(originalDoc))) {

                    try {
                        // Realizamos la solicitud para eliminar el archivo
                        const responseDelete = await fetch('/permisos/deleteFile', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json', // Asegúrate de que es el tipo de contenido correcto
                            },
                            body: JSON.stringify({
                                dbName: originalDoc.filename,
                                _id: originalDoc._id
                            }), // Enviamos el nombre del archivo y el id como JSON
                        });

                        // Comprobamos si la respuesta de la eliminación fue exitosa
                        if (!responseDelete.ok) {
                            throw new Error(`Error al eliminar el archivo: ${originalDoc.filename}`);
                        }

                    } catch (error) {
                        // Si hay algún error, mostramos un mensaje al usuario
                        Swal.fire({
                            title: 'Algo salió mal :(',
                            icon: 'error',
                            width: '500px',
                            text: 'Favor de contactar a Soporte Técnico. (Error #037)',
                        }).then(() => {
                            location.reload(); // Recargamos la página después del mensaje de error
                        });
                        return; // Si ocurre un error, detenemos la ejecución
                    }
                }
            }
        }
        await processDeletes(); // critical, must be executed async 

        // b. forEach archivosSeleccionados that !docs.includes() = UPLOAD
        async function processUploads() {
            const formData = new FormData(); // Crear un objeto FormData

            for (const selectedDoc of archivosSeleccionados) {
                // Verificamos si el archivo seleccionado no está en originalDocs
                if (!originalDocs.some((originalDoc) =>
                    JSON.stringify(originalDoc) === JSON.stringify(selectedDoc))) {
                    formData.append('files', selectedDoc, selectedDoc.name);
                }
            }

            // ejecuta el fetch post solo si existen archivos en el array de formData
            if (Array.from(formData.entries()).length > 0) try {
                // fetch de los archivos al FormData
                const responseFile = await fetch('/permisos/uploadFile', {
                    method: 'POST',
                    body: formData,
                });

                // Respuesta del servidor
                const dataFile = await responseFile.json();

                // Verificar si la carga fue exitosa
                if (!dataFile.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: '500px',
                        text: 'Favor de contactar a Soporte Técnico. (Error #030)',
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // editPermit() failed execution

                    // On successul upload, save up all paths into docPaths to be saved inside mongodb
                } else {
                    dataFile.message.forEach(item => {
                        docPaths.push(item._id);
                    });
                }

            } catch {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: '500px',
                    text: 'Favor de contactar a Soporte Técnico. (Error #050)',
                }).then(() => {
                    location.reload(); // reload after popup
                });
                return; // editPermit() failed execution
            }
        }
        await processUploads(); // critical, must be executed async 


        // Fetch 01 - editPermitRequest
        try {
            const responsePermit = await fetch('/permisos/editPermit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    permitId: permitObject._id,
                    registro: registro,
                    filtro: filtro,
                    fechaInicio: fechaInicio,
                    fechaTermino: fechaTermino,
                    docPaths: docPaths,
                })
            });

            const dataPermit = await responsePermit.json();
            if (dataPermit.success) {
                Swal.fire({
                    title: 'Permiso editado',
                    icon: 'success',
                    width: "500px",
                    text: 'Se editó el permiso correctamente.'
                }).then(() => {
                    location.reload(); // reload after popup
                });
                return; // editPermit() successful execution

                // Catch from Controller "/permisos/editPermit"
            } else {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #038)'
                });
                return; // editPermit() failed execution
            }

            // Catch from Fetch #02
        } catch (error) {
            Swal.fire({
                title: 'Algo salió mal :(',
                icon: 'error',
                width: "500px",
                text: 'Favor de contactar a Soporte Técnico. (Error #039)'
            });
            console.error('Hubo un error:', error);
            return; // editPermit() failed execution
        }
    }
 */





// deletePermit button
async function deletePermit(button) {
    const permitObject = JSON.parse(button.getAttribute('permitObject'));

    Swal.fire({
        html: `

                <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                    <i class="fa-solid fa-trash-can" style="margin-right:0.9rem;"></i>Eliminar permiso
                </h2>
                <p>¿Estás seguro que deseas eliminar el permiso? (Esta acción no se puede deshacer)</p>

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
            try {

                // borra las files que pertenecen al permiso antes de borrarlo                         
                async function processDeletes() {
                    for (const file of permitObject.docPaths) {
                        try {
                            // Realizamos la solicitud para eliminar el archivo
                            const responseDelete = await fetch('/permisos/deleteFile', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json', // Asegúrate de que es el tipo de contenido correcto
                                },
                                body: JSON.stringify({
                                    dbName: file.filename,
                                    _id: file._id
                                }), // Enviamos el nombre del archivo y el id como JSON
                            });

                            // Comprobamos si la respuesta de la eliminación fue exitosa
                            if (!responseDelete.ok) {
                                throw new Error(`Error al eliminar el archivo: ${file.filename}`);
                            }

                        } catch (error) {
                            // Si hay algún error, mostramos un mensaje al usuario
                            Swal.fire({
                                title: 'Algo salió mal :(',
                                icon: 'error',
                                width: '500px',
                                text: 'Favor de contactar a Soporte Técnico. (Error #037)',
                            }).then(() => {
                                location.reload(); // Recargamos la página después del mensaje de error
                            });
                            return; // Si ocurre un error, detenemos la ejecución
                        }
                    }
                }
                await processDeletes(); // critical, must be executed async 

                const response = await fetch('/permisos/deletePermit', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: permitObject._id,
                    })
                });


                const data = await response.json();

                // Catch from Controller "/deletePermit"
                if (!data.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #041)'
                    });
                    return; // deletePermit() failed execution
                } else {
                    Swal.fire({
                        title: 'Permiso eliminado ',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha eliminado el permiso correctamente.'
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // deletePermit() successful execution
                }


                // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #042)'
                });
                console.error('Hubo un error:', error);
                return; // deletePermit() failed execution
            }
        }
    })
};


// sendPermit button
async function sendPermit(button) {
    const permitObject = JSON.parse(button.getAttribute('permitObject'));

    Swal.fire({
        html: `
                <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                    <i class="fa-solid fa-check" style="margin-right:0.9rem;"></i>Enviar permiso
                </h2>
                <p>¿Estás seguro que deseas enviar este permiso para aprobación? (Esta acción no se puede deshacer)</p>

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
            try {


                const response = await fetch('/permisos/sendPermit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: permitObject._id,
                    })
                });


                const data = await response.json();

                // Catch from Controller "/sendPermit"
                if (!data.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #052)'
                    });
                    return; // sendPermit() failed execution
                } else {
                    Swal.fire({
                        title: 'Permiso enviado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha enviado el permiso correctamente.'
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // sendPermit() successful execution
                }


                // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #051)'
                });
                console.error('Hubo un error:', error);
                return; // sendPermit() failed execution
            }
        }
    })
};