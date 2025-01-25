// createPermit button
async function createPermit() { // async function to perform fetch chain

    let archivosSeleccionados = []; // Lista para almacenar los archivos seleccionados
    let archivosEliminados = []; // Lista para almacenar los archivos eliminados
    
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

                console.log(formData);
        
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
                } else {
                    // do nothing, just save up the doctPaths from the documents
                    // aqui agregar: response.message.docPaths = docPaths; (guardar array en variable array)
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
                        docPaths: ["empty1", "empty2"], // placeholder data
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