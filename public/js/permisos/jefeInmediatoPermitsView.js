// viewPermitsRowFile : Done
async function viewPermitsRowFile(button) {
    window.open(DOMPurify.sanitize(`/permisos/viewPermitsRowFile/${button.getAttribute('permitId')}/${button.getAttribute('filename')}`));
};

// changeStatus : ---
async function changeStatus(button) {
    const permitId = button.getAttribute('permitId');
    const currentStatus = button.getAttribute('currentStatus');

    Swal.fire({
        html: DOMPurify.sanitize(`
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-rotate" style="margin-right:0.9rem;"></i>Cambiar estatus
        </h2>
        
        <p>Elija el nuevo estatus del permiso</p>
        <div class="column">
            <select id="estatus" class="is-fullwidth input">
                <option value="${currentStatus}" hidden>${currentStatus}</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Justificado">Justificado</option>
                <option value="Injustificado">Injustificado</option>
            </select> 
        </div>
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
            const estatus = $('#estatus').val().trim();
            try {
                const response = await fetch('/permisos/changeStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        permitId: permitId,
                        estatus: estatus,
                    })
                });
                const data = await response.json();


                await Swal.fire({
                    title: data.success ? 'Estatus cambiado' : data.messageTitle,
                    icon: data.success ? 'success' : 'error',
                    text: data.success ? 'Se ha cambiado el estatus correctamente.' : data.messageText,
                    width: "500px"
                });
                
                location.reload();

            } catch (error) {
                location.reload();
            }
        }
    })
};

// verifyPermit : ---
async function verifyPermit(button) {
    const permitId = button.getAttribute('permitId');
    const currentStatus = button.getAttribute('currentStatus');

    Swal.fire({
        html: DOMPurify.sanitize(`
        <h2 style="font-size:2.61rem; display: block; padding: 0.6rem; margin-bottom:1.5rem;">
            <i class="fa-solid fa-check" style="margin-right:0.9rem;"></i>Enviar permiso
        </h2>
        <p>¿Estás seguro que deseas enviar este permiso con el estatus de "${currentStatus}" al colaborador? (Esta acción no se puede deshacer)</p>

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
                const response = await fetch('/permisos/verifyPermit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        permitId: permitId,
                    })
                });
                const data = await response.json();

                await Swal.fire({
                    title: data.success ? 'Permiso verificado' : data.messageTitle,
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

// downloadPDF : Done
async function downloadPDF() {
    try {
        window.location.href = '/permisos/downloadPDF';
        Swal.fire({
            title: 'PDF descargado',
            icon: 'success',
            width: "500px",
            text: 'El archivo se descargó correctamente.'
        });
    } catch (error) {
        location.reload();
    }
};

// downloadExcel : ---
async function downloadExcel() {
    try {
        window.location.href = '/permisos/downloadExcel';
        Swal.fire({
            title: 'Excel descargado',
            icon: 'success',
            width: "500px",
            text: 'El archivo se descargó correctamente.'
        });
    } catch (error) {
        location.reload();
    }
};
