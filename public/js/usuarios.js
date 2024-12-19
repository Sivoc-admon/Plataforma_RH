function newUser() {
    Swal.fire({
        html: `
                <div>
                    <div class="add-provider-container" style="margin-top: 0px;">
                    <h1>Agregar nuevo usuario</h1>
                    </div>
                </div>

                <form>

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
};