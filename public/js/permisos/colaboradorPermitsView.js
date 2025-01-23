



/*
       




            










            
            



             Ojo, aqui es DEJARLO COMO ESTÁ libre de edición hasta que se de click en confirmar. 


             
        </div>
-->

*/



// createPermit button
async function createPermit() { // async function to perform fetch chain

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
                    <option value="Cita medica">Cita medica</option>
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
                    <label class="label">Agregar archivos</label>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <!-- File Input Button -->
                        <div class="file has-name is-boxed" style="flex: 1;">
                            <label class="input" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right:0.3rem; font-family: var(--font);">
                                <i class="fas fa-upload" style="margin: 0rem 0.3rem;font-size: 1.1rem;"></i>
                                <span>Elegir archivo</span>



<input type="file" name="foto" class="file-input" id="foto" style="display: none;" onchange="validateUpload(event)" />




                                </label>
                        </div>
                    </div>
                </div>

                <div class="column" >
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

            // format styles and user experience for calendars (fechaYHoraFinal) !!
            const todayOut = new Date();
            const formattedISODateOut = todayOut.toISOString().split('T')[0];
            const dateInputOut = document.getElementById("fechaYHoraFinal");
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





            let archivosSeleccionados = []; // Lista para almacenar los archivos seleccionados
            let archivosEliminados = []; // Lista para almacenar los archivos eliminados
            
            // Función para validar y mostrar archivos
            window.validateUpload = function (event) {
                const input = event.target;
                const files = Array.from(input.files); // Convertir FileList a Array
            
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
            
                // Resetear el input[type="file"] para permitir volver a seleccionar los mismos archivos
                input.value = ''; // Restablecer el valor para poder seleccionar el mismo archivo de nuevo
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
            
                console.log('Lista de archivos en el DOM actualizada:', archivosSeleccionados); // Depuración
            }
            
            // Función para eliminar un archivo
            window.deletePermitFromArrayAndHtml = function (index) {
                const deletedFile = archivosSeleccionados.splice(index, 1)[0]; // Eliminar archivo del array
                archivosEliminados.push(deletedFile.name); // Agregar el archivo eliminado a la lista de eliminados
            
                updateFileList(); // Actualizar el DOM
            };
                        
            
            
            

        },
        preConfirm: async () => {
            const registro = $('#registro').val().trim(); 
            const filtro = $('#filtro').val().trim();
            const fechaYHoraInicio = new Date($('#fechaYHoraInicio').val().trim());
            const fechaYHoraFinal = new Date($('#fechaYHoraFinal').val().trim());
            
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
            

            // Preconfirm Fetch #01 - TPODOOOOO PNG, JPEG, PDF, DOC o DOCX


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
        




            //if (!fileInput.files[0])






                // !fileInput.files[0]
                //  help


            
            // Fetch #01 - File upload (profile picture)
            /*
            try {
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
                                foto: dataFile.message.path, 
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
            */
        }
    })
};