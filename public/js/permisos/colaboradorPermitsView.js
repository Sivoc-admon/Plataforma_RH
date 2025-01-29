// createPermit button
async function createPermit() { // async function to perform fetch chain

    let archivosSeleccionados = []; // Lista para almacenar los archivos seleccionados

    Swal.fire({
        html: `
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-clipboard-user" style="margin-right:0.9rem;"></i>Crear Permiso
        </h2>

        <div class="columns is-multiline">

            <!-- Fields -->
            <div class="column">

                            <div class="column">

                <label class="label">Tipo de registro</label>
                <select id="registro" class="input">
                    <option value="" hidden>Seleccione tipo</option>
                    <option value="Incapacidad">Incapacidad</option>
                    <option value="Permiso">Permiso</option>
                </select>
                </div>

                            <div class="column">
                <label class="label">Filtro de permiso</label>
                <select id="filtro" class="input">
                    <option value="" hidden>Seleccione filtro</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Cita Medica">Cita Medica</option>
                    <option value="Asunto Familiar">Asunto Familiar</option>
                </select> 
                </div>


                            <div class="column">
                <label class="label">Fecha inicio</label>
                <input type="datetime-local" class="input" id="fechaYHoraInicio" required>
                </div>


                            <div class="column">
                <label class="label">Fecha de termino</label>
                <input type="datetime-local" class="input" id="fechaYHoraFinal" required>
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

            // format styles and user experience for calendars (fechaYHoraInicio) !!
            const todayIn = new Date();
            const formattedISODateIn = todayIn.toISOString().split('T')[0];
            const dateInputIn = document.getElementById("fechaYHoraInicio");
            dateInputIn.value = formattedISODateIn;

            dateInputIn.addEventListener("click", (event) => {
                event.preventDefault(); // Previene comportamiento predeterminado
                dateInputIn.showPicker(); // Fuerza mostrar el calendario
            });

            // format styles and user experience for calendars (fechaYHoraFinal) !!
            const todayOut = new Date();
            const formattedISODateOut = todayOut.toISOString().split('T')[0];
            const dateInputOut = document.getElementById("fechaYHoraFinal");
            dateInputOut.value = formattedISODateOut;
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
                subidosDiv.innerHTML = ''; // Limpiar lista anterior
                archivosSeleccionados.forEach((file, index) => {
                    subidosDiv.innerHTML += `
                        <div class="file-item columns is-vcentered" style="margin-top:0.6rem;">
                            <div>
                                <button class="default-button-css table-button-css" onclick="deletePermitFromArrayAndHtml(${index})">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <div class="column" style="align-self:center; justify-self:center;">
                                <p>${file.name} ${(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        </div>
                    `;
                });
            }
            // Función para eliminar un archivo
            window.deletePermitFromArrayAndHtml = function (index) {
                archivosSeleccionados.splice(index, 1); // Eliminar archivo del array
                updateFileList(); // Actualizar el DOM
            };

        },
        preConfirm: async () => {
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


            
            // Fetch documents if there is any (return file objects as an array "files" so it gets referenced by the permitUnit inside collection TODO)
            if (archivosSeleccionados.length !== 0) try {
                const formData = new FormData(); // Crear un objeto FormData
        
                // Agregar los archivos al FormData
                archivosSeleccionados.forEach((file, index) => {
                    formData.append('files', file, file.name); // Agregar cada archivo al FormData
                });
        
                // Realizar la solicitud fetch para enviar los archivos al servidor
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
                    return; // createPermit() failed execution

                // On successul upload, save up all paths into docPaths to be saved inside mongodb
                } else {
                    dataFile.message.forEach(item => {
                        docPaths.push(item._id);
                    });
                }
        
            } catch (error) {
                console.error('Error al cargar los archivos:', error);
                Swal.fire({
                    title: 'Error en la carga de archivos',
                    icon: 'error',
                    text: 'Hubo un problema al intentar cargar tus archivos. Intenta de nuevo más tarde. #033',
                }).then(() => {
                    location.reload(); // reload after popup
                });
                return; // createPermit() failed execution
            }
    

            // newTodo aqui agregar: response.message.docPaths = docPaths; (guardar array en variable array)
            // Fetch 01 - createPermitRequest
            try {
                const responsePermit = await fetch('/permisos/createPermitRequest', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        registro: registro,
                        filtro: filtro,
                        fechaInicio: fechaInicio,
                        fechaTermino: fechaTermino,
                        docPaths: docPaths,
                        estatus: "Pendiente",
                        isSent: false,
                        isVerified: false,
                        userId: localUserId,
                    })
                });

                const dataPermit = await responsePermit.json();
                if (dataPermit.success) {
                    Swal.fire({
                        title: 'Permiso creado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se añadió el permiso correctamente.'
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // createPermit() successful execution

                // Catch from Controller "/permisos/createPermit"
                } else {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #031)'
                    });
                    return; // createPermit() failed execution
                }

            // Catch from Fetch #02
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #032)'
                });
                console.error('Hubo un error:', error);
                return; // createPermit() failed execution
            }

        }
    })
};

// downloadFile button
async function downloadFile(button) {
    const docPath = JSON.parse(button.getAttribute('docPath')); // Convertimos el JSON en un objeto
    window.open(`/permisos/downloadFile/${docPath.filename}`);  // 200 iq, "fakePost" the filename into the url, this means u can post tiny information INTO A GET ROUTE
};


// editPermit button
async function editPermit(button) { // async function to perform fetch chain
    const permitObject = JSON.parse(button.getAttribute('permitObject'));

    // Función para convertir fechas del formato legible a ISO
    function formatFecha(fechaString) {
        const meses = {
            enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
            julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
        };

        return new Date(fechaString.replace(/(\d{1,2}) de (\w+) de (\d{4}), (\d{2}):(\d{2})/, function(_, dia, mes, anio, hora, minuto) {
            return `${anio}-${meses[mes] || '01'}-${dia.padStart(2, '0')}T${hora}:${minuto}`;
        }));
    }

    // Usamos la función para formatear ambas fechas
    const formattedFechaInicio = formatFecha(permitObject.fechaInicio).toISOString().slice(0, 16);
    const formattedFechaTermino = formatFecha(permitObject.fechaTermino).toISOString().slice(0, 16);

    let archivosSeleccionados = []; // Lista para almacenar los archivos seleccionados
    let archivosOriginales = []; // Lista para almacenar los archivos que fueron detectados para eliminar

    Swal.fire({
        html: `
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-clipboard-user" style="margin-right:0.9rem;"></i>Crear Permiso
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
                    <option value="Cita Medica">Cita Medica</option>
                    <option value="Asunto Familiar">Asunto Familiar</option>
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
            if (permitObject.docPaths && permitObject.docPaths.length > 0) {
                permitObject.docPaths.forEach(doc => {
                    const fileObject = {"name": doc.originalname, "isFile": false, "dbName": doc.filename, "_id": doc._id}
                    archivosOriginales.push(fileObject); // Agregar archivo a la lista
                    archivosSeleccionados.push(fileObject); // Agregar archivo a la lista
                });
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
                subidosDiv.innerHTML = ''; // Limpiar lista anterior
                archivosSeleccionados.forEach((file, index) => {
                    subidosDiv.innerHTML += `
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
                    `;
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


            
            // Fetch documents if there is any (return file objects as an array "files" so it gets referenced by the permitUnit inside collection TODO)
            if (archivosSeleccionados.length !== 0) try {
                const formData = new FormData(); // Crear un objeto FormData
        
                // 1. Agregar los archivos al FormData
                archivosSeleccionados.forEach((file, index) => {
                    // Verificamos si el archivo tiene el atributo 'isFile'
                    if (file.isFile !== false) {  // Si 'isFile' no existe o es diferente de 'false', lo agregamos
                        formData.append('files', file, file.name);
                    }
                    // Si uno de los archivos se mantuvo, agrega su docPath a los docpaths
                    else {
                        // tienes que enviar el objectId de dicha imagen no del permiso
                        docPaths.push(file._id); 
                        console.log(`El archivo ${file.name} no es un archivo válido o no tiene 'isFile'`);
                    }
                });

                // 2. Eliminar los archivos deseleccionados
                for (const file of archivosOriginales) {
                    if (!archivosSeleccionados.includes(file)) {
                        try {
                            const responseDelete = await fetch('/permisos/deleteFile', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json', // Si es necesario especificar tipo de contenido
                                },
                                body: JSON.stringify({ dbName: file.dbName }), // Envolvemos el 'dbName' en un objeto JSON
                            });

                            if (!responseDelete.ok) {
                                // TODO, this way of standrized errors is better because is only 1 Swal for each fetch and not 2.
                                throw new Error(`Error al eliminar el archivo: ${file.dbName}`);
                            }

                        } catch (error) {
                            Swal.fire({
                                title: 'Algo salió mal :(',
                                icon: 'error',
                                width: '500px',
                                text: 'Favor de contactar a Soporte Técnico. (Error #037)',
                            }).then(() => {
                                location.reload(); // reload after popup
                            });
                            return; // editPermit() failed execution
                        }
                    }
                };

                // 3. Realizar la solicitud fetch para enviar los archivos al servidor
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
        
            } catch (error) {
                console.error('Error al cargar los archivos:', error);
                Swal.fire({
                    title: 'Error en la carga de archivos',
                    icon: 'error',
                    text: 'Hubo un problema al intentar cargar tus archivos. Intenta de nuevo más tarde. #033',
                }).then(() => {
                    location.reload(); // reload after popup
                });
                return; // editPermit() failed execution
            }
    

            // newTodo aqui agregar: response.message.docPaths = docPaths; (guardar array en variable array)
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
    })
};