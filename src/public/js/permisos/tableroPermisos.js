// users-module.js - Simplified version

function usersModule() {
    return {
        // Data properties
        usersRows: [],
        searchQuery: '',
        table: null,
        isLoading: true,
        hasError: false,
        show: false,
        descripcion: '',

        // Initialize
        init() {
            this.loadUsersData();
        },

        // Load users data from API
        async loadUsersData() {
            this.isLoading = true;
            this.hasError = false;

            if (dataJson) {
                this.usersRows = dataJson;
            } else {
                this.usersRows = [];
                console.error(ERROR_MESSAGE, '012');
            }

            // Initialize table after data is loaded
            this.$nextTick(() => {
                this.initializeTable();
            });

            this.isLoading = false;
        },

        // Initialize Tabulator table
        initializeTable() {
            // Destroy existing table if it exists
            if (this.table) {
                this.table.destroy();
                this.table = null;
            }

            this.table = new Tabulator("#users-table", {
                data: this.usersRows,
                layout: "fitColumns",
                //responsiveLayout: "hide",
                paginationSize: 15,
                //movableColumns: true,
                //resizableRows: true,
                //headerFilterPlaceholder: "Filtrar...",
                height: "240px",
                columns: [
                    {
                        title: "Nombre del solicitante",
                        field: "solicitante_fullName", // usuario.dato_personal.nombre||apellido_m||apellido_p ...
                        minWidth: 125
                    },
                    {
                        title: "Tipo",
                        field: "tipo",
                        width: 155
                    },
                    {
                        title: "Descripción",
                        field: "descripcion",
                        width: 150,
                        formatter: function (cell) {
                            const rawValue = cell.getValue() || '';
                            
                            // Escapamos para seguridad
                            const safeValue = rawValue
                                .replace(/&/g, '&amp;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#039;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;');

                            return `
                                <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                    onclick="openDescripcionModal('${safeValue}')">
                                    Ver más
                                </button>
                            `;
                        }
                    },
                    {
                        title: "Inicio",
                        field: "fecha_inicio",
                        width: 150
                    },
                    {
                        title: "Termino",
                        field: "fecha_termino",
                        width: 125
                    },
                    {
                        title: "¿Solicitado?",
                        field: "solicitado", // gestion_permiso.solicitado
                        formatter: "tickCross",
                        //editor: "tickCross", // Permite editar con click la casilla
                        hozAlign: "center",
                        width: 125
                    },
                    {
                        title: "¿Revisado?",
                        field: "revisado", // gestion_permiso.revisado
                        formatter: "tickCross",
                        //editor: "tickCross", // Permite editar con click la casilla
                        hozAlign: "center",
                        width: 125
                    },
                    {
                        title: "Estado",
                        field: "estado", // gestion_permiso.estado
                        width: 125
                    }
                ]
            });
        },

        // Filter table based on search query // TO WORK
        filterTable() {
            /*
            if (this.table) {
                if (this.searchQuery.trim()) {
                    this.table.setFilter([
                        [
                            { field: "nombre", type: "like", value: this.searchQuery },
                            { field: "apellidoP", type: "like", value: this.searchQuery },
                            { field: "apellidoM", type: "like", value: this.searchQuery },
                            { field: "area", type: "like", value: this.searchQuery },
                            { field: "email", type: "like", value: this.searchQuery }
                        ]
                    ]);
                } else {
                    this.table.clearFilter();
                }
            }
                */
        },

        // Show notification
        showNotification(title, message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`;
            notification.innerHTML = `
                <div class="flex items-center">
                    <div class="flex-1">
                        <h4 class="font-bold">${DOMPurify.sanitize(title)}</h4>
                        <p class="text-sm">${DOMPurify.sanitize(message)}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
        },

        // Download functions using Tabulator's built-in functionality
        async downloadPDF() {
            try {
                if (this.table) {
                    this.table.download("pdf", "usuarios.pdf", {
                        orientation: "landscape",
                        title: "Lista de Usuarios - SIVOC"
                    });
                    this.showNotification('Éxito', 'PDF descargado correctamente.');
                } else {
                    this.showNotification('Error', 'No hay datos para descargar.', 'error');
                }
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al descargar PDF.', 'error');
            }
        },

        async downloadExcel() {
            try {
                if (this.table) {
                    this.table.download("xlsx", "usuarios.xlsx", {
                        sheetName: "Usuarios"
                    });
                    this.showNotification('Éxito', 'Excel descargado correctamente.');
                } else {
                    this.showNotification('Error', 'No hay datos para descargar.', 'error');
                }
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al descargar Excel.', 'error');
            }
        }
    };
}