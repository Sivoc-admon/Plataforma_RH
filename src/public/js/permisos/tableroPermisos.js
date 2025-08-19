// users-module.js - Multi-table version

function usersModule() {
    return {
        // Data properties for three tables
        dataRows1: [],
        dataRows2: [],
        dataRows3: [],
        searchQuery: '',
        table1: null,
        table2: null,
        table3: null,
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
                this.dataRows1 = dataJson.cargarTodosLosPermisos || [];
                this.dataRows2 = dataJson.cargarPermisosEquipo || [];
                this.dataRows3 = dataJson.cargarTusPermisos || [];
            } else {
                this.dataRows1 = [];
                this.dataRows2 = [];
                this.dataRows3 = [];
                console.error(ERROR_MESSAGE, '012');
            }

            // Initialize tables after data is loaded
            this.$nextTick(() => {
                this.initializeTable1();
                this.initializeTable2();
                this.initializeTable3();
            });

            this.isLoading = false;
        },

        // Get table configuration
        getTableConfig(data) {
            return {
                data: data,
                layout: "fitColumns",
                //responsiveLayout: "hide",
                pagination: true,
                paginationSize: 3,
                //movableColumns: true,
                //resizableRows: true,
                //headerFilterPlaceholder: "Filtrar...",
                height: "241px",
                columns: [
                    {
                        title: "Nombre del solicitante",
                        field: "solicitante_fullName", // usuario.dato_personal.nombre||apellido_m||apellido_p ...
                        minWidth: 220,
                        //hozAlign: "center",
                    },
                    {
                        title: "Tipo",
                        field: "tipo",
                        width: 125,
                        //hozAlign: "center",
                    },
                    {
                        title: "Inicio",
                        field: "fecha_inicio",
                        width: 110,
                        //hozAlign: "center",
                    },
                    {
                        title: "Termino",
                        field: "fecha_termino",
                        width: 110,
                        //hozAlign: "center",
                    },
                    {
                        title: "¿Solicitado?",
                        field: "solicitado", // gestion_permiso.solicitado
                        formatter: "tickCross",
                        //editor: "tickCross", // Permite editar con click la casilla
                        width: 115
                    },
                    {
                        title: "¿Revisado?",
                        field: "revisado", // gestion_permiso.revisado
                        formatter: "tickCross",
                        //editor: "tickCross", // Permite editar con click la casilla
                        width: 110
                    },
                    {
                        title: "Estado",
                        field: "estado", // gestion_permiso.estado
                        width: 110,
                        //hozAlign: "center",
                    },
                    {
                        title: "Acciones",
                        field: "descripcion",
                        width: 260,
                        hozAlign: "center",
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
                                <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 mr-2 ml-2"
                                    onclick="openDescripcionModal('${safeValue}')">
                                    Consultar
                                </button>
                                <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 mr-2 ml-2"
                                    onclick="openDescripcionModal('${safeValue}')">
                                    Editar
                                </button>
                                <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 mr-2 ml-2"
                                    onclick="openDescripcionModal('${safeValue}')">
                                    Enviar
                                </button>
                            `;
                        }
                    }
                ],
            };
        },

        // Initialize Tabulator table 1
        initializeTable1() {
            // Destroy existing table if it exists
            if (this.table1) {
                this.table1.destroy();
                this.table1 = null;
            }

            this.table1 = new Tabulator("#data-table-1", this.getTableConfig(this.dataRows1));
        },

        // Initialize Tabulator table 2
        initializeTable2() {
            // Destroy existing table if it exists
            if (this.table2) {
                this.table2.destroy();
                this.table2 = null;
            }

            this.table2 = new Tabulator("#data-table-2", this.getTableConfig(this.dataRows2));
        },

        // Initialize Tabulator table 3
        initializeTable3() {
            // Destroy existing table if it exists
            if (this.table3) {
                this.table3.destroy();
                this.table3 = null;
            }

            this.table3 = new Tabulator("#data-table-3", this.getTableConfig(this.dataRows3));
        },

        // Filter table based on search query // TO WORK
        filterTable(tableNumber = null) {
            /*
            const tables = tableNumber ? [this[`table${tableNumber}`]] : [this.table1, this.table2, this.table3];
            
            tables.forEach(table => {
                if (table) {
                    if (this.searchQuery.trim()) {
                        table.setFilter([
                            [
                                { field: "solicitante_fullName", type: "like", value: this.searchQuery },
                                { field: "tipo", type: "like", value: this.searchQuery },
                                { field: "estado", type: "like", value: this.searchQuery },
                                { field: "descripcion", type: "like", value: this.searchQuery }
                            ]
                        ]);
                    } else {
                        table.clearFilter();
                    }
                }
            });
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

        // Download functions for Table 3
        /*
        async downloadPDF3() {
            try {
                if (this.table3) { // wanna do table 2? just do: this.table2
                    this.table3.download("pdf", "usuarios_tabla3.pdf", {
                        orientation: "landscape",
                        title: "Lista de Usuarios - Tabla 3 - SIVOC"
                    });
                    this.showNotification('Éxito', 'PDF de Tabla 3 descargado correctamente.');
                } else {
                    this.showNotification('Error', 'No hay datos para descargar en Tabla 3.', 'error');
                }
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al descargar PDF de Tabla 3.', 'error');
            }
        },
        async downloadExcel1() {
            try {
                if (this.table1) {
                    this.table1.download("xlsx", "usuarios_tabla1.xlsx", {
                        sheetName: "Usuarios Tabla 1"
                    });
                    this.showNotification('Éxito', 'Excel de Tabla 1 descargado correctamente.');
                } else {
                    this.showNotification('Error', 'No hay datos para descargar en Tabla 1.', 'error');
                }
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al descargar Excel de Tabla 1.', 'error');
            }
        },
        */


        // Combined download functions (downloads all tables data in one file)
        async downloadPDF() {
            try {
                // Combine all data from the three tables
                const combinedData = [
                    ...this.dataRows1,
                    ...this.dataRows2,
                    ...this.dataRows3
                ];

                if (combinedData.length > 0) {
                    // Create a temporary table with combined data for download
                    const tempTable = new Tabulator(document.createElement("div"), this.getTableConfig(combinedData));

                    tempTable.download("pdf", "permisos.pdf", {
                        orientation: "landscape",
                        title: "Lista Completa de Usuarios - SIVOC"
                    });

                    this.showNotification('Éxito', 'PDF con todas las tablas descargado correctamente.');

                    // Clean up temporary table
                    tempTable.destroy();
                } else {
                    this.showNotification('Error', 'No hay datos para descargar.', 'error');
                }
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al descargar PDF combinado.', 'error');
            }
        },

        async downloadExcel() {
            try {
                // Combine all data from the three tables
                const combinedData = [
                    ...this.dataRows1,
                    ...this.dataRows2,
                    ...this.dataRows3
                ];

                if (combinedData.length > 0) {
                    // Create a temporary table with combined data for download
                    const tempTable = new Tabulator(document.createElement("div"), this.getTableConfig(combinedData));

                    tempTable.download("xlsx", "permisos.xlsx", {
                        sheetName: "Usuarios Completo"
                    });

                    this.showNotification('Éxito', 'Excel con todas las tablas descargado correctamente.');

                    // Clean up temporary table
                    tempTable.destroy();
                } else {
                    this.showNotification('Error', 'No hay datos para descargar.', 'error');
                }
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al descargar Excel combinado.', 'error');
            }
        }
    };
}