function newUser() {
    Swal.fire({
        html: `
            <div>
                <h2>DATOS DEL COLABORADOR</h2>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Nombre</label><br>
                    <input class="input" id="nombre" required></input>
                </div>
                <div class="column">
                    <label>Apellido Paterno</label><br>
                    <input class="input" id="apellidoP" required></input>
                </div>
                <div class="column">
                    <label>Apellido Materno</label><br>
                    <input class="input" id="apellidoM" required></input>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Email</label><br>
                    <input class="input" id="email" required></input>
                </div>
                <div class="column">
                    <label>Contraseña</label><br>
                    <input class="input" id="password" required></input>
                </div>
                <div class="column">
                    <label>Fecha de ingreso</label><br>
                    <input class="input" id="fechaIngreso" required></input>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Área</label><br>
                    <input class="input" id="area" required></input>
                </div>
                <div class="column">
                    <label>Puesto</label><br>
                    <input class="input" id="puesto" required></input>
                </div>
                <div class="column">
                    <label>Jefe Inmediato</label><br>
                    <input class="input" id="jefeInmediato" required></input>
                </div>
            </div>

            <div class="columns is-vcentered">
                <div class="column">
                    <label>Fecha de baja</label><br>
                    <input class="input" id="fechaBaja" required></input>
                </div>
                <div class="column">
                    <label>Foto</label><br>
                    <input class="input" id="foto" required></input>
                </div>
            </div>

`,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#f0466e',
        showCancelButton: true,
        allowOutsideClick: false,
        width: '1000px',
        customClass: {
            confirmButton: 'default-button-css', 
            cancelButton: 'default-button-css',   
          },

        preConfirm: () => {
            // Recoge los datos del formulario antes de enviarlos o guardarlos
            let nombre = $('#nombre').val();
            let apellidoP = $('#apellidoP').val();
            let apellidoM = $('#apellidoM').val();
            let email = $('#email').val();

            let password = $('#password').val();
            let area = $('#area').val();

            let fechaBaja = $('#fechaBaja').val();
            let fechaIngreso = $('#fechaIngreso').val();
            let foto = $('#foto').val();

            let jefeInmediato = $('#jefeInmediato').val();

            let puesto = $('#puesto').val();  // puesto can only be sent if its not disabled

            if (/[\{\}\:\$\=\'\*\[\]]/.test(nombre) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(area) || /[\{\}\:\$\=\'\*\[\]]/.test(fechaBaja) || /[\{\}\:\$\=\'\*\[\]]/.test(fechaIngreso) ||
                /[\{\}\:\$\=\'\*\[\]]/.test(foto) || /[\{\}\:\$\=\'\*\[\]]/.test(jefeInmediato)) {
                Swal.showValidationMessage('Uno o más campos contienen caracteres no permitidos.');
                return false;
            } else if (!nombre || !apellidoP || !apellidoM || !email || !password || !area || !fechaBaja || !fechaIngreso || !foto || !jefeInmediato || !puesto) {
                Swal.showValidationMessage('Todos los campos son requeridos.');
                return false;
            }

            //updateNewUser(nombre, apellidoP, apellidoM, email, nombre, area, fechaBaja, fechaIngreso, foto, jefeInmediato)
            // updateNewHour
        }
    })
};