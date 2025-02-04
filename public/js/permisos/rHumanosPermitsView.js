// downloadFile button
async function downloadFile(button) {
    const docPath = JSON.parse(button.getAttribute('docPath')); // Convertimos el JSON en un objeto
    window.open(`/permisos/downloadFile/${docPath.filename}`);  // 200 iq, "fakePost" the filename into the url, this means u can post tiny information INTO A GET ROUTE
};


// changeStatus button
async function changeStatus(button) {
    const permitObject = JSON.parse(button.getAttribute('permitObject'));
    console.log(permitObject);

    Swal.fire({
        html: `
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-rotate" style="margin-right:0.9rem;"></i>Cambiar estatus
        </h2>

        <p>Elija el nuevo estatus del permiso</p>

        <div class="column">
            <select id="estatus" class="is-fullwidth input">
                <option value="${permitObject.estatus}" hidden>${permitObject.estatus}</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Justificado">Justificado</option>
                <option value="Injustificado">Injustificado</option>
            </select> 
        </div>

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
            const estatus = $('#estatus').val().trim(); 
            try {
                const response = await fetch('/permisos/changeStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: permitObject._id,
                        estatus: estatus,
                    })
                });
                
                
                const data = await response.json();

                // Catch from Controller "/changeStatus"
                if (!data.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #055)'
                    });
                    return; // changeStatus() failed execution
                } else {
                    Swal.fire({
                        title: 'Estatus cambiado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha enviado el permiso correctamente.'
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // changeStatus() successful execution
                }
               

                // Catch from Fetch #01
            } catch (error) {
                Swal.fire({
                    title: 'Algo salió mal :(',
                    icon: 'error',
                    width: "500px",
                    text: 'Favor de contactar a Soporte Técnico. (Error #054)'
                });
                console.error('Hubo un error:', error);
                return; // changeStatus() failed execution
            }
        }
    })
};


// verifyPermit button
async function verifyPermit(button) {
    const permitObject = JSON.parse(button.getAttribute('permitObject'));

    Swal.fire({
        html: `
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-check" style="margin-right:0.9rem;"></i>Aceptar permiso
        </h2>
        <p>¿Estás seguro que deseas aceptar/verificar este permiso para aprobación? (Esta acción no se puede deshacer)</p>

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


                const response = await fetch('/permisos/verifyPermit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: permitObject._id,
                    })
                });
                
                
                const data = await response.json();

                // Catch from Controller "/verifyPermit"
                if (!data.success) {
                    Swal.fire({
                        title: 'Algo salió mal :(',
                        icon: 'error',
                        width: "500px",
                        text: 'Favor de contactar a Soporte Técnico. (Error #052)'
                    });
                    return; // verifyPermit() failed execution
                } else {
                    Swal.fire({
                        title: 'Permiso aceptado',
                        icon: 'success',
                        width: "500px",
                        text: 'Se ha enviado el permiso correctamente.'
                    }).then(() => {
                        location.reload(); // reload after popup
                    });
                    return; // verifyPermit() successful execution
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
                return; // verifyPermit() failed execution
            }
        }
    })
};