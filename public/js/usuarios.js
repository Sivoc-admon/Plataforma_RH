$(document).ready(function() {
    $('#example').DataTable();
  
    $('#addSchoolButton').click(function() {
        var letterInfo = document.getElementById("letters_info").dataset.letters
        letterInfo = JSON.parse(letterInfo)
        

        let optionsHtml = '<option value="">Selecciona una carta descriptiva</option>';
        letterInfo.forEach(item => {
            optionsHtml += `<option value="${item._id}">${item.name}</option>`;
        });

        Swal.fire({
            html: `
                <div>
                    <div class="add-provider-container" style="margin-top: 0px;">
                    <h1 class="title">Agregar Escuela</h1>
                    </div>
                </div>

                <form id="schoolForm">

                    <label style="font-size: x-large;text-align: left;">Nombre</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="text" id="name" class="input" required> 
                            <br><br><br>
                        </div>
                    </div>

                    <label style="font-size: x-large;text-align: left;">Dirección</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="text" id="address" class="input" required> 
                            <br><br><br>
                        </div>
                    </div>

                    <label style="font-size: x-large;text-align: left;">Escolaridad</label> <br>
                    <div class="field">
                        <div class="control">
                            <select id="escolarity" class="select is-fullwidth input">
                            <option>Selecciona una escolaridad</option>
                            <option>Preescolar</option>
                            <option>Primaria</option>
                            <option>Secundaria</option>
                            </select> 
                            <br><br><br>
                        </div>
                    </div>
    
                    <label style="font-size: x-large;text-align: left;">Carta Descriptiva</label> <br>
                    <div class="field">
                        <div class="control">
                            <select id="carta" class="select is-fullwidth input">
                            ${optionsHtml}
                            </select>
                        </div>
                    </div>
                </form>
            `,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: '#f0466e',
            preConfirm: () => {
                let name = $('#name').val();
                let address = $('#address').val();
                let escolarity = $('#escolarity').val(); // Valor del dropdown
                let letter = $('#carta').val();
            
                if (!name || !address || !escolarity) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Todos los campos son requeridos.",
                        confirmButtonText: "Aceptar",
                        showConfirmButton: true,
                        width: "500px",
                    })
                    return false;
                }
                // Filter out special characters
                else if (/[\{\}\:\$\=\'\*\[\]]/.test(name) ||
                        /[\{\}\:\$\=\'\*\[\]]/.test(address) ||
                        /[\{\}\:\$\=\'\*\[\]]/.test(escolarity)) {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Uno o más campos contienen caracteres no permitidos: {} $ : = '' * [] ",
                            confirmButtonText: "Aceptar",
                            showConfirmButton: true,
                            width: "500px",
                        })
                        return false;
            
                } else if (letter === "") {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Selecciona una carta descriptiva.",
                        confirmButtonText: "Aceptar",
                        showConfirmButton: true,
                        width: "500px",
                    })
                    return false;
                } else if (escolarity === "Selecciona una escolaridad") {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Selecciona una escolaridad.",
                        confirmButtonText: "Aceptar",
                        showConfirmButton: true,
                        width: "500px",
                    })
                    return false;
                }
            
                // Continúa con el fetch si todo está validado.
                fetch('/schools/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        address: address,
                        escolarity: escolarity,
                        id_letter: letter
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            title: '¡Escuela agregada!',
                            icon: 'success',
                            width: "500px",
                            text: data.message
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            icon: 'error',
                            width: "500px",
                            text: data.message
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        title: 'Error',
                        icon: 'error',
                        width: "500px",
                        text: 'Ocurrió un problema al agregar la escuela.'
                    });
                    console.error('Error al enviar los datos:', error);
                });
            }            
        });
    });
  
    $('#schools').on('click', '.viewSchoolButton', function () {
        let index = $(this).data('index');
        let name = $(this).data('name');
        let address = $(this).data('address');
        let escolarity = $(this).data('escolarity');

        Swal.fire({
            title: 'Detalles de la escuela',
            html: `
                <strong>Id de Escuela:</strong> ${index} <br>
                <strong>Escuela:</strong> ${name} <br>
                <strong>Dirección:</strong> ${address} <br>
                <strong>Escolaridad:</strong> ${escolarity} <br>
            `,
            icon: 'info',
            width: '800px'
        });
    });

    // Button edit school details, fixed 2nd page not working
    $('#schools').on('click', '.editSchoolButton', function() {
        var letterInfo = document.getElementById("letters_info").dataset.letters
        letterInfo = JSON.parse(letterInfo)

        let id = $(this).data('index');
        let name = $(this).data('name');
        let address = $(this).data('address');
        let escolarity = $(this).data('escolarity');
        let letter = $(this).data('letter');

        const buscarIdPorNombreLetra = (data, letterName) => {
            const resultado = data.find(item => item.name === letterName);
            const index = data.findIndex(item => item.name === letterName);
            if (index !== -1) {
                data.splice(index, 1);
            }
            return resultado ? resultado._id : null;
        };
        
        const idLetter = buscarIdPorNombreLetra(letterInfo, letter);
        
        let optionsHtml

        if (idLetter) {
            optionsHtml = '<option value="'+idLetter+'">'+letter+'</option>';
            letterInfo.forEach(item => {
                optionsHtml += `<option value="${item._id}">${item.name}</option>`;
            });
        }else{
            optionsHtml = '<option value="">Selecciona una carta descriptiva</option>';
            letterInfo.forEach(item => {
                optionsHtml += `<option value="${item._id}">${item.name}</option>`;
            });
        }
        
        Swal.fire({
            html: `
                <div>
                    <div class="add-provider-container" style="margin-top: 0px;">
                    <h1 class="title">Editar Escuela</h1>
                    </div>
                </div>

                <form id="schoolForm">

                    <label style="font-size: x-large;text-align: left;">Nombre</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="text" id="name" class="input" value="${name}" required> <br><br><br>
                        </div>
                    </div>

                    <label style="font-size: x-large;text-align: left;">Dirección</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="text" id="address" class="input" value="${address}" required> <br><br><br>
                        </div>
                    </div>

                    <label style="font-size: x-large;text-align: left;">Escolaridad</label> <br>
                    <div class="field">
                        <div class="control">
                            <select id="escolarity" class="select is-fullwidth input">
                            <option value="Preescolar" ${escolarity === 'Preescolar' ? 'selected' : ''}>Preescolar</option>
                            <option value="Primaria" ${escolarity === 'Primaria' ? 'selected' : ''}>Primaria</option>
                            <option value="Secundaria" ${escolarity === 'Secundaria' ? 'selected' : ''}>Secundaria</option>
                            </select> <br><br>
                        </div>
                    </div>
    
                    <label style="font-size: x-large;text-align: left;">Carta Descriptiva</label> <br>
                    <div class="field">
                        <div class="control">
                            <select id="carta" class="select is-fullwidth input">
                            ${optionsHtml}
                            </select>
                        </div>
                    </div>
                </form>
            `,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: '#f0466e',
            preConfirm: () => {
                let updatedName = $('#name').val();
                let updatedAddress = $('#address').val();
                let updatedEscolarity = $('#escolarity').val();
                let updatedLetter = $('#carta').val();
                console.log(id);

                if (updatedAddress == "" || updatedName == "" || updatedEscolarity == "" || updatedLetter == ""){
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Todos los campos son requeridos.",
                        confirmButtonText: "Aceptar",
                        showConfirmButton: true,
                        width: "500px",
                    })
                    return false;
                } else if (/[\{\}\:\$\=\'\*\[\]]/.test(updatedName) ||
                    /[\{\}\:\$\=\'\*\[\]]/.test(updatedAddress)) {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Uno o más campos contienen caracteres no permitidos: {} $ : = '' * [] ",
                            confirmButtonText: "Aceptar",
                            showConfirmButton: true,
                            width: "500px",
                        })
                        return false;
                }
                
                fetch(`/schools/edit/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: updatedName,
                        address: updatedAddress,
                        escolarity: updatedEscolarity,
                        id_letter: updatedLetter
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            title: '¡Escuela editada!',
                            icon: 'success',
                            width: "500px",
                            text: data.message
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            icon: 'error',
                            width: "500px",
                            text: data.message
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        title: 'Error',
                        icon: 'error',
                        width: "500px",
                        text: data.message
                    });
                    console.error('Error al enviar los datos:', error);
                });        
            }
        });
    });
  
    $('.deleteSchoolButton').click(function() {
      let id = $(this).data('index');
      let name = $(this).data('name');
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¡Esta acción eliminará la escuela con nombre ' + name + '!',
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        width: "500px",
        cancelButtonColor: '#f0466e',
        preConfirm: () => {
            console.log(id);
            fetch(`/schools/delete/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: '¡Fue eliminada!',
                        icon: 'success',
                        width: "500px",
                        text: data.message
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        icon: 'error',
                        width: "500px",
                        text: data.message
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error',
                    icon: 'error',
                    width: "500px",
                    text: data.message
                });
                console.error('Error al enviar los datos:', error);
            });
        }
      });
    });

    $('#addAdminButton').click(function() {
        // TODO ALFONSO
        Swal.fire({
            html: `
                <div>
                    <div class="add-provider-container" style="margin-top: 0px;">
                    <h1 class="title">Agregar Administrador</h1>
                    </div>
                </div>

                <form id="adminForm">

                    <label for="name" style="font-size: x-large;text-align: left;">Nombre</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="text" id="name" class="input" required pattern="[A-Za-záéíóúÁÉÍÓÚ\s]+" title="Solo se permiten letras y espacios."> 
                            <br><br><br>
                        </div>
                    </div>

                    <label for="surnameP" style="font-size: x-large;text-align: left;">Apellido Paterno</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="text" id="surnameP" class="input" required pattern="[A-Za-záéíóúÁÉÍÓÚ\s]+" title="Solo se permiten letras y espacios.">
                            <br><br><br>
                        </div>
                    </div>

                    <label for="surnameM" style="font-size: x-large;text-align: left;">Apellido Materno</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="text" id="surnameM" class="input" required pattern="[A-Za-záéíóúÁÉÍÓÚ\s]+" title="Solo se permiten letras y espacios.">
                            <br><br><br>
                        </div>
                    </div>

                    <label for="mail" style="font-size: x-large;text-align: left;">Correo</label> <br>
                    <div class="field">
                        <div class="control">
                            <input type="email" id="mail" class="input" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Introduce un correo válido.">
                        </div>
                    </div>
                </form>
            `,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Guardar',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: '#f0466e',
            preConfirm: () => {
                let name = $('#name').val();
                let surnameP = $('#surnameP').val();
                let surnameM = $('#surnameM').val();
                let mail = $('#mail').val();

                if (!name || !surnameP || !surnameM || !mail) {
                    Swal.showValidationMessage('Todos los campos son requeridos.');
                    return false;
                // Validate each input to deny code input
                } else if (/[\{\}\:\$\=\'\*\[\]]/.test(name) ||
                    /[\{\}\:\$\=\'\*\[\]]/.test(surnameP) ||
                    /[\{\}\:\$\=\'\*\[\]]/.test(surnameM) ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || /[\{\}\:\$\=\'\*\[\]]/.test(mail)) {
                    Swal.showValidationMessage("Uno o más campos contienen caracteres no permitidos: {} $ : = '' * [] ");
                    return false;
                }
            
    
                return fetch('/administradores/registrar-administrador', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        surnameP: surnameP,
                        surnameM: surnameM,
                        mail: mail
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al registrar administrador');
                    }
                    return response.json();
                })
                .catch(error => {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: '¡Administrador agregado!',
                    icon: 'success',
                    width: "500px",
                    text: 'El administrador fue registrado correctamente.'
                }).then(() => {
                    location.reload();
                });
            }
        });
    });    

    $('#admins').on('click', '.editAdminButton', function() {
        // TODO ALFONSO
        var letterInfo = document.getElementById("letters_info").dataset.letters
        letterInfo = JSON.parse(letterInfo)
    
        let id = $(this).data('index');
        let name = $(this).data('name');
        let address = $(this).data('address');
        let escolarity = $(this).data('escolarity');
        let letter = $(this).data('letter');
    
        const buscarIdPorNombreLetra = (data, letterName) => {
            const resultado = data.find(item => item.name === letterName);
            const index = data.findIndex(item => item.name === letterName);
            if (index !== -1) {
                data.splice(index, 1);
            }
            return resultado ? resultado._id : null;
        };
    
        const idLetter = buscarIdPorNombreLetra(letterInfo, letter);
    
        let optionsHtml;
    
        if (idLetter) {
            optionsHtml = '<option value="' + idLetter + '">' + letter + '</option>';
            letterInfo.forEach(item => {
                optionsHtml += `<option value="${item._id}">${item.name}</option>`;
            });
        } else {
            optionsHtml = '<option value="">Selecciona una carta descriptiva</option>';
            letterInfo.forEach(item => {
                optionsHtml += `<option value="${item._id}">${item.name}</option>`;
            });
        }
    
        Swal.fire({
            html: `
               
            `,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: '#f0466e',
            preConfirm: () => {
                let updatedName = $('#name').val();
                let updatedSurnameP = $('#surnameP').val();
                let updatedSurnameM = $('#surnameM').val();
                let updatedMail = $('#mail').val();

                if (/[\{\}\:\$\=\'\*\[\]]/.test(updatedName) ||
                    /[\{\}\:\$\=\'\*\[\]]/.test(updatedSurnameP) ||
                    /[\{\}\:\$\=\'\*\[\]]/.test(updatedSurnameM) ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedMail) || /[\{\}\:\$\=\'\*\[\]]/.test(updatedMail)) {
                    Swal.showValidationMessage("Uno o más campos contienen caracteres no permitidos: {} $ : = '' * [] ");
                    return false;
                }

                return fetch(`/schools/edit/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: updatedName,
                        address: updatedAddress,
                        escolarity: updatedEscolarity,
                        id_letter: updatedLetter
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        throw new Error(data.message || 'Ocurrió un error.');
                    }
                    return data;
                })
                .catch(error => {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: '¡Escuela editada!',
                    icon: 'success',
                    width: "500px",
                    text: 'La escuela fue actualizada correctamente.'
                }).then(() => {
                    location.reload();
                });
            }
        });
    });
    

    $('#admins').on('click', '.deleteAdminButton', function() {
        // TODO ALFONSO
        let id = $(this).data('index');
        let name = $(this).data('name');
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Esta acción eliminará al administrador ' + name + '!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            width: "500px",
            preConfirm: () => {
                return fetch(`/administradores/eliminar-administrador/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            title: '¡Fue eliminado!',
                            icon: 'success',
                            width: "500px",
                            text: 'Administrador eliminado exitosamente'
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            icon: 'error',
                            width: "500px",
                            text: data.message
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        title: 'Error',
                        icon: 'error',
                        width: "500px",
                        text: 'Ocurrió un problema al eliminar.'
                    });
                    console.error('Error:', error);
                });
            }
        });
    });    
});