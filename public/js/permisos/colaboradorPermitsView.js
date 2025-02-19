// Auxiliary functions
const formatReadableDateTime = (isoDate, isIncapacidad = false) => {
    const date = new Date(isoDate);
    const readableDate = date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    
    if (isIncapacidad) return readableDate;
    
    const readableTime = date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    return `${readableDate}, ${readableTime}`;
};
const validateFile = (file, archivosSeleccionados) => {
    const allowedExtensions = ['png', 'jpeg', 'jpg', 'pdf', 'doc', 'docx'];
    const maxSize = 3 * 1024 * 1024; // 3 MB
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!file.name) return "El archivo no tiene nombre.";
    if (file.name.length > 51) return "El nombre es muy largo";
    if (!allowedExtensions.includes(fileExtension)) return "Formato de archivo inválido.";
    if (file.size > maxSize) return `El archivo ${DOMPurify.sanitize(file.name)} excede el tamaño máximo de 3 MB.`;
    if (file.size <= 0) return "No se permiten añadir archivos vacios.";
    if (archivosSeleccionados.length >= 3) return "Solo se permiten ingresar 3 archivos.";
    if (archivosSeleccionados.some(f => f.name === file.name)) return "El archivo ya se encuentra en la fila.";
    
    return null;
};
const createFileListItem = (file, index) => {
    return DOMPurify.sanitize(`
        <div class="file-item columns is-vcentered" style="margin-top: 0.6rem">
            <div>
                <button class="default-button-css table-button-css delete-file" data-index="${index}">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="column" style="align-self:center; justify-self:center;">
                <p>${file.name || "Tomar captura y favor de informar a soporte técnico. (#032)"}</p>
            </div>
        </div>
    `);
};
const setupDatePicker = (elementId, options) => {
    return flatpickr(`#${elementId}`, {
        enableTime: options.enableTime,
        dateFormat: "Y-m-d\\TH:i",
        time_24hr: true,
        locale: "es",
        minDate: options.minDate,
        defaultDate: options.defaultDate,
        maxDate: options.maxDate || "",
        onChange: options.onChange
    });
};

// viewPermitsRowFile : Done
async function viewPermitsRowFile(button) {
    window.open(DOMPurify.sanitize(`/permisos/viewPermitsRowFile/${button.getAttribute('permitId')}/${button.getAttribute('filename')}`));
};

// createPermitRequest : Done
async function createPermitRequest(theInput) {
    const registro = DOMPurify.sanitize(theInput);
    let archivosSeleccionados = [];

    const getDefaultDate = (daysToAdd) => {
        let date = new Date().fp_incr(daysToAdd);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const handleFileChange = (files, updateUI) => {
        Array.from(files).forEach(file => {
            file.name = file.name.replace(/[<>:"'/\\|?*]/g, "");
            const error = validateFile(file, archivosSeleccionados);
            if (error) return Swal.showValidationMessage(error);
            Swal.resetValidationMessage();
            archivosSeleccionados.push(file);
        });
        updateUI();
    };

    const updateFileList = () => {
        const subidosDiv = document.getElementById("subidos");
        subidosDiv.innerHTML = "";
        
        archivosSeleccionados.forEach((file, index) => {
            const template = document.createElement('template');
            template.innerHTML = createFileListItem(file, index);
            subidosDiv.appendChild(template.content.firstElementChild);
        });

        document.querySelectorAll(".delete-file").forEach(button => {
            button.addEventListener("click", () => {
                const index = parseInt(button.dataset.index);
                archivosSeleccionados.splice(index, 1);
                Swal.resetValidationMessage();
                updateFileList();
            });
        });
    };

    await Swal.fire({
        html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-clipboard-user" style="margin-right:0.9rem;"></i>Registrar Permiso
            </h2>

            <div class="columns is-multiline">
                <div class="column">
                    <div class="column">
                        <label class="label">Tipo de registro</label>
                        <input type="text" id="registro" class="input" value="${registro}" style="background: var(--cyan);" required readonly>
                    </div>

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

                    <div class="column">
                        <label class="label">Fecha inicio</label>
                        <input type="text" id="fechaYHoraInicio" style="opacity: 0; position: absolute;" required readonly>
                        <input type="text" id="fechaYHoraInicioDisplay" value="Seleccione una fecha" class="input" readonly>
                    </div>

                    <div class="column">
                        <label class="label">Fecha Termino</label>
                        <input type="text" id="fechaYHoraFinal" style="opacity: 0; position: absolute;" required readonly>
                        <input type="text" id="fechaYHoraFinalDisplay" value="Seleccione una fecha" class="input" readonly>
                    </div>
                </div>

                <div class="column">
                    <div class="column">
                        <label class="label">Agregar archivos (opcional)</label>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="file has-name is-boxed" style="flex: 1;">
                                <label class="input" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem; font-family: var(--font);">
                                    <i class="fas fa-upload" style="margin: 0rem 0.3rem; font-size: 1.1rem;"></i>
                                    <span>Subir archivo</span>
                                    <input type="file" name="files" class="file-input" id="files" style="display: none;" multiple>
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
            const fechaYHoraInicio = setupDatePicker('fechaYHoraInicio', {
                enableTime: registro !== "Incapacidad",
                minDate: getDefaultDate(1),
                defaultDate: getDefaultDate(1),
                onChange: (selectedDates) => {
                    if (selectedDates[0]) {
                        let nuevaFecha = new Date(selectedDates[0]);
                        nuevaFecha.setHours(nuevaFecha.getHours() + 24);
                        fechaYHoraFinal.set("minDate", nuevaFecha);
                    }
                }
            });

            const fechaYHoraFinal = setupDatePicker('fechaYHoraFinal', {
                enableTime: registro !== "Incapacidad",
                minDate: getDefaultDate(2),
                defaultDate: getDefaultDate(2),
                onChange: (selectedDates) => {
                    if (selectedDates[0]) {
                        let nuevaFecha = new Date(selectedDates[0]);
                        nuevaFecha.setHours(nuevaFecha.getHours() - 24);
                        fechaYHoraInicio.set("maxDate", nuevaFecha);
                    }
                }
            });

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

            document.getElementById("files").addEventListener("change", function() {
                handleFileChange(this.files, updateFileList);
            });
        },
        preConfirm: async () => {
            try {
                const filtro = document.getElementById('filtro').value;
                const fechaInicio = document.getElementById('fechaYHoraInicio').value;
                const fechaTermino = document.getElementById('fechaYHoraFinal').value;

                if (!registro || !filtro || !fechaInicio || !fechaTermino) {
                    return Swal.showValidationMessage('Todos los campos son requeridos.');
                }

                const formData = new FormData();
                formData.append("registro", registro);
                formData.append("filtro", filtro);
                formData.append("fechaInicio", fechaInicio);
                formData.append("fechaTermino", fechaTermino);

                archivosSeleccionados.forEach(file => {
                    formData.append("files", file);
                });

                const response = await fetch('/permisos/createPermitRequest', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                
                await Swal.fire({
                    title: data.success ? 'Permiso creado' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'Se añadió el permiso correctamente.' : data.messageText,
                    width: "500px"
                });
                
                location.reload();
            } catch (error) {
                location.reload();
            }
        }
    });
};

// editPermit button : Done
async function editPermit(button) {
    let archivosSeleccionados = [];
    try {
        // Fetch permit data
        const permitId = button.getAttribute('permitId');
        const permitResponse = await fetch('/permisos/editPermit/getInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ permitId })
        });
        
        const permitData = await permitResponse.json();
        if (!permitData.success) {
            return Swal.fire({
                title: permitData.messageTitle,
                icon: 'error',
                text: permitData.messageText,
            });
        }

        const isIncapacidad = permitData.message.registro === "Incapacidad";
        
        const updateFileList = () => {
            const subidosDiv = document.getElementById("subidos");
            subidosDiv.innerHTML = "";
            
            archivosSeleccionados.forEach((file, index) => {
                const template = document.createElement('template');
                template.innerHTML = createFileListItem(file, index);
                subidosDiv.appendChild(template.content.firstElementChild);
            });

            document.querySelectorAll(".delete-file").forEach(button => {
                button.addEventListener("click", () => {
                    const index = parseInt(button.dataset.index);
                    archivosSeleccionados.splice(index, 1);
                    Swal.resetValidationMessage();
                    updateFileList();
                });
            });
        };

        const handleFileChange = (files) => {
            Array.from(files).forEach(file => {
                file.name = file.name.replace(/[<>:"'/\\|?*]/g, "");
                const error = validateFile(file, archivosSeleccionados);
                
                if (error) {
                    return Swal.showValidationMessage(error);
                }
                
                Swal.resetValidationMessage();
                archivosSeleccionados.push(file);
            });
            updateFileList();
        };

        await Swal.fire({
            html: DOMPurify.sanitize(`
                <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                    <i class="fa-solid fa-pencil" style="margin-right:0.9rem;"></i>Editar Permiso
                </h2>

                <div class="columns is-multiline">
                    <div class="column">
                        <div class="column">
                            <label class="label">Tipo de registro</label>
                            <input type="text" id="registro" class="input" value="${permitData.message.registro}" style="background: var(--cyan);" required readonly>
                        </div>

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

                        <div class="column">
                            <label class="label">Fecha inicio</label>
                            <input type="text" id="fechaYHoraInicio" style="opacity: 0; position: absolute;" required readonly>
                            <input type="text" id="fechaYHoraInicioDisplay" class="input" readonly>
                        </div>

                        <div class="column">
                            <label class="label">Fecha Termino</label>
                            <input type="text" id="fechaYHoraFinal" style="opacity: 0; position: absolute;" required readonly>
                            <input type="text" id="fechaYHoraFinalDisplay" class="input" readonly>
                        </div>
                    </div>

                    <div class="column">
                        <div class="column">
                            <label class="label">Agregar archivos (opcional)</label>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div class="file has-name is-boxed" style="flex: 1;">
                                    <label class="input" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem; font-family: var(--font);">
                                        <i class="fas fa-upload" style="margin: 0rem 0.3rem; font-size: 1.1rem;"></i>
                                        <span>Subir archivo</span>
                                        <input type="file" name="files" class="file-input" id="files" style="display: none;" multiple>
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
                // Initialize date pickers
                const minDate = new Date().fp_incr(1);
                minDate.setHours(0, 0, 0, 0);

                const fechaYHoraInicio = setupDatePicker('fechaYHoraInicio', {
                    enableTime: !isIncapacidad,
                    minDate,
                    defaultDate: permitData.message.fechaInicio,
                    onChange: (selectedDates) => {
                        if (selectedDates[0]) {
                            let nuevaFecha = new Date(selectedDates[0]);
                            nuevaFecha.setHours(nuevaFecha.getHours() + 24);
                            fechaYHoraFinal.set("minDate", nuevaFecha);
                        }
                    }
                });

                const fechaYHoraFinal = setupDatePicker('fechaYHoraFinal', {
                    enableTime: !isIncapacidad,
                    minDate: new Date().fp_incr(2),
                    defaultDate: permitData.message.fechaTermino,
                    onChange: (selectedDates) => {
                        if (selectedDates[0]) {
                            let nuevaFecha = new Date(selectedDates[0]);
                            nuevaFecha.setHours(nuevaFecha.getHours() - 24);
                            fechaYHoraInicio.set("maxDate", nuevaFecha);
                        }
                    }
                });

                // Setup display inputs
                const fechaYHoraInicioDisplay = document.getElementById("fechaYHoraInicioDisplay");
                const dateInputIn = document.getElementById("fechaYHoraInicio");
                fechaYHoraInicioDisplay.addEventListener("click", (event) => {
                    event.preventDefault();
                    dateInputIn.click();
                });
                dateInputIn.addEventListener("input", () => {
                    fechaYHoraInicioDisplay.value = formatReadableDateTime(dateInputIn.value, isIncapacidad);
                });
                fechaYHoraInicioDisplay.value = formatReadableDateTime(permitData.message.fechaInicio, isIncapacidad);

                const fechaYHoraFinalDisplay = document.getElementById("fechaYHoraFinalDisplay");
                const dateInputOut = document.getElementById("fechaYHoraFinal");
                fechaYHoraFinalDisplay.addEventListener("click", (event) => {
                    event.preventDefault();
                    dateInputOut.click();
                });
                dateInputOut.addEventListener("input", () => {
                    fechaYHoraFinalDisplay.value = formatReadableDateTime(dateInputOut.value, isIncapacidad);
                });
                fechaYHoraFinalDisplay.value = formatReadableDateTime(permitData.message.fechaTermino, isIncapacidad);

                // Initialize files
                if (permitData.message.docPaths && permitData.message.docPaths.length > 0) {
                    permitData.message.docPaths.forEach(doc => {
                        archivosSeleccionados.push({ name: doc.originalname });
                    });
                    updateFileList();
                }

                document.getElementById("files").addEventListener("change", function() {
                    handleFileChange(this.files);
                });
            },
            preConfirm: async () => {
                try {
                    const filtro = document.getElementById('filtro').value;
                    const fechaInicio = document.getElementById('fechaYHoraInicio').value;
                    const fechaTermino = document.getElementById('fechaYHoraFinal').value;
                
                    console.log("filtro: " + filtro);
                    if (!filtro) return Swal.showValidationMessage('Todos los campos son requeridos.');
                
                    // Set all dates to midnight to compare only the dates
                    const currentDate = new Date();
                    const startDate = new Date(fechaInicio);
                    const endDate = new Date(fechaTermino);
                    startDate.setHours(0, 0, 0, 0);
                    currentDate.setHours(0, 0, 0, 0);
                    endDate.setHours(0, 0, 0, 0);

                    // Add one day to current date for 24-hour validation
                    const tomorrowDate = new Date(currentDate);
                    tomorrowDate.setDate(currentDate.getDate() + 1);
                    
                    if (startDate < tomorrowDate) return Swal.showValidationMessage("La fecha de inicio no puede ser menor a las próximas 24 horas.");
                    if (endDate < startDate) return Swal.showValidationMessage("La fecha de termino no puede ser menor a la fecha de inicio.");
                    
                    const formData = new FormData();
                    formData.append("permitId", permitId);
                    formData.append("filtro", filtro);
                    formData.append("fechaInicio", fechaInicio);
                    formData.append("fechaTermino", fechaTermino);
                    
                    archivosSeleccionados.forEach(file => {
                        if (file instanceof File) {
                            formData.append("files", file);
                        }
                    });
                    formData.append("archivosSeleccionados", JSON.stringify(archivosSeleccionados.map(f => ({ name: f.name }))));
                
                    const response = await fetch('/permisos/editPermit/postInfo', {
                        method: 'POST',
                        body: formData,
                    });
                
                    const data = await response.json();
                    
                    await Swal.fire({
                        title: data.success ? 'Permiso editado' : data.messageTitle,
                        icon: data.success ? 'success' : 'error',
                        text: data.success ? 'Se ha editado el permiso correctamente.' : data.messageText,
                        width: "500px"
                    });
                    
                    location.reload();
                } catch (error) {
                    location.reload();
                }
            }
        });

    } catch (error) {
        location.reload();
    }
};

// deletePermit : Done
async function deletePermit(button) {
    Swal.fire({
        html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-trash-can" style="margin-right:0.9rem;"></i>Eliminar permiso
            </h2>
            <p>¿Estás seguro que deseas eliminar el permiso? (Esta acción no se puede deshacer)</p>
        `),
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
                // 1. Fetch with permitId
                const permitId = button.getAttribute('permitId');
                const response = await fetch('/permisos/deletePermit', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        permitId: permitId,
                    })
                });

                // 2. Show response
                const data = await response.json();
                await Swal.fire({
                    title: data.success ? 'Permiso eliminado' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'Se ha eliminado el permiso correctamente.' : data.messageText,
                    width: "500px"
                });
                location.reload();

            } catch (error) {
                location.reload();
            }
        }
    })
};

// sendPermit : Done
async function sendPermit(button) {
    Swal.fire({
        html: DOMPurify.sanitize(`
            <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
                <i class="fa-solid fa-check" style="margin-right:0.9rem;"></i>Enviar permiso
            </h2>
            <p>¿Estás seguro que deseas enviar este permiso para aprobación? (Esta acción no se puede deshacer)</p>
        `),
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
                // 1. Fetch with permitId
                const permitId = button.getAttribute('permitId');
                const response = await fetch('/permisos/sendPermit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        permitId: permitId,
                    })
                });

                // 2. Show response
                const data = await response.json();
                await Swal.fire({
                    title: data.success ? 'Permiso enviado' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'Se ha enviado el permiso correctamente.' : data.messageText,
                    width: "500px"
                });
                location.reload();

            } catch (error) {
                location.reload();
            }
        }
    })
};  