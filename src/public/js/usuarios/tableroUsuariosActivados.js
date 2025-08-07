// users-module.js

function usersModule() {
    return {
        // Data properties
        // usersRows: dataUsuarios,
        usersRows: [
            // Sample data - replace with actual server data
            {
                id: '1',
                nombre: 'Juan',
                apellidoP: 'Pérez',
                apellidoM: 'González',
                email: 'juan.perez@company.com',
                fechaIngreso: '2023-01-15',
                area: 'Administración',
                puesto: 'Director General',
                privilegio: 'direccion'
            }
        ],
        searchQuery: '',
        table: null,
        showModal: false,
        modalContent: '',
        newUser: {
            nombre: '',
            apellidoP: '',
            apellidoM: '',
            email: '',
            password: '',
            fechaIngreso: '',
            area: '',
            puesto: '',
            privilegio: ''
        },
        availablePuestos: [],

        // Configuration
        areaToPuestos: {
            "Administración": ["Director General", "Coordinador de Finanzas", "Gestora de Tesorería", "Coordinador de Recursos Humanos", "Gestor de Recursos Humanos", "Analista de Recursos Humanos"],
            "Ventas": ["Coordinador Comercial", "Gestor de Ventas", "Analista de Ventas"],
            "Calidad": ["Coordinador de Calidad", "Gestor de Calidad", "Analista de Calidad"],
            "Operativo": ["Coordinador Operacional", "Gestor de Ingeniería", "Analista de Ingeniería", "Gestor de Compras", "Analista de Compras", "Gestor de Manufactura", "Analista de Manufactura", "Analista de Almacén"],
            "Pruebas": ["Gestor de Pruebas", "Ingeniero de Servicio A", "Ingeniero de Servicio B", "Ingeniero de Servicio C"]
        },

        // Initialize
        init() {
            // Initialize with server data if available
            if (typeof window.usersData !== 'undefined') {
                this.usersRows = window.usersData;
            }

            // Initialize Tabulator table
            this.$nextTick(() => {
                this.initializeTable();
            });
        },

        // Initialize Tabulator table
        initializeTable() {
            this.table = new Tabulator("#users-table", {
                data: this.usersRows,
                layout: "fitColumns",
                responsiveLayout: "hide",
                pagination: "local",
                paginationSize: 10,
                paginationSizeSelector: [5, 10, 15, 20],
                movableColumns: true,
                resizableRows: true,
                headerFilterPlaceholder: "Filtrar...",
                height: "400px",
                columns: [
                    {
                        title: "Nombre Completo",
                        field: "fullName",
                        formatter: (cell) => {
                            const data = cell.getRow().getData();
                            return `${data.nombre} ${data.apellidoP} ${data.apellidoM}`;
                        },
                        headerFilter: "input",
                        headerFilterFunc: (headerValue, rowValue, rowData) => {
                            const fullName = `${rowData.nombre} ${rowData.apellidoP} ${rowData.apellidoM}`.toLowerCase();
                            return fullName.includes(headerValue.toLowerCase());
                        },
                        minWidth: 200
                    },
                    {
                        title: "Fecha de Ingreso",
                        field: "fechaIngreso",
                        formatter: (cell) => {
                            const date = new Date(cell.getValue());
                            return date.toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        },
                        headerFilter: "input",
                        width: 180
                    },
                    {
                        title: "Área",
                        field: "area",
                        headerFilter: "select",
                        headerFilterParams: {
                            values: Object.keys(this.areaToPuestos).reduce((acc, area) => {
                                acc[area] = area;
                                return acc;
                            }, {})
                        },
                        width: 150
                    },
                    {
                        title: "Puesto",
                        field: "puesto",
                        headerFilter: "input",
                        width: 180
                    },
                    {
                        title: "Privilegio",
                        field: "privilegio",
                        formatter: (cell) => {
                            const privilegio = cell.getValue();
                            const text = this.getPrivilegeText(privilegio);
                            const className = this.getPrivilegeClass(privilegio);
                            return `<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${className}">${text}</span>`;
                        },
                        headerFilter: "select",
                        headerFilterParams: {
                            values: {
                                'colaborador': 'Colaborador',
                                'rHumanos': 'Recursos Humanos',
                                'jefeInmediato': 'Jefe Inmediato',
                                'direccion': 'Dirección'
                            }
                        },
                        width: 150
                    },
                    {
                        title: "Acciones",
                        field: "actions",
                        formatter: (cell) => {
                            return DOMPurify.sanitize(`
                                <div class="flex justify-center space-x-2">
                                    <button class="edit-btn inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-150">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button class="deactivate-btn inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-150">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                    <button class="password-btn inline-flex items-center justify-center w-8 h-8 text-yellow-600 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors duration-150">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2L3.257 9.257a6 6 0 018.486-8.486L18 7.257zm-6 6l-2-2"></path>
                                        </svg>
                                    </button>
                                </div>
                            `);
                        },
                        width: 150,
                        hozAlign: "center",
                        headerSort: false,
                        cellClick: (e, cell) => {
                            const user = cell.getRow().getData();
                            if (e.target.closest('.edit-btn')) {
                                this.editUser(user);
                            } else if (e.target.closest('.deactivate-btn')) {
                                this.deactivateUser(user);
                            } else if (e.target.closest('.password-btn')) {
                                this.changePassword(user);
                            }
                        }
                    }
                ]
            });
        },

        // Filter table based on search query
        filterTable() {
            if (this.table) {
                if (this.searchQuery.trim()) {
                    this.table.setFilter([
                        [
                            { field: "nombre", type: "like", value: this.searchQuery },
                            { field: "apellidoP", type: "like", value: this.searchQuery },
                            { field: "apellidoM", type: "like", value: this.searchQuery },
                            { field: "area", type: "like", value: this.searchQuery }
                        ]
                    ]);
                } else {
                    this.table.clearFilter();
                }
            }
        },

        // Utility functions
        formatReadableDateTime(isoDate) {
            const date = new Date(isoDate);
            return date.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        // Privilege display helpers
        getPrivilegeText(privilegio) {
            const privileges = {
                'colaborador': 'Colaborador',
                'rHumanos': 'Recursos Humanos',
                'jefeInmediato': 'Jefe Inmediato',
                'direccion': 'Dirección'
            };
            return privileges[privilegio] || 'Error #099';
        },

        getPrivilegeClass(privilegio) {
            const classes = {
                'colaborador': 'bg-blue-100 text-blue-800',
                'rHumanos': 'bg-green-100 text-green-800',
                'jefeInmediato': 'bg-yellow-100 text-yellow-800',
                'direccion': 'bg-purple-100 text-purple-800'
            };
            return classes[privilegio] || 'bg-red-100 text-red-800';
        },

        // Modal management
        openModal(content) {
            this.modalContent = content;
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.modalContent = '';
        },

        // Show notification
        showNotification(title, message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`;
            notification.innerHTML = DOMPurify.sanitize(`
                <div class="flex items-center">
                    <div class="flex-1">
                        <h4 class="font-bold">${title}</h4>
                        <p class="text-sm">${message}</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `);
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
        },

        // Update puesto options based on selected area
        updatePuestoOptions() {
            this.availablePuestos = this.areaToPuestos[this.newUser.area] || [];
            this.newUser.puesto = '';
        },

        // Reset new user form
        resetNewUserForm() {
            this.newUser = {
                nombre: '',
                apellidoP: '',
                apellidoM: '',
                email: '',
                password: '',
                fechaIngreso: '',
                area: '',
                puesto: '',
                privilegio: ''
            };
            this.availablePuestos = [];
        },

        // Add User functionality
        addUser() {
            this.resetNewUserForm();
            this.openModal(
                DOMPurify.sanitize(`
                <div class="px-6 py-4">
                    <div class="flex items-center mb-6">
                        <svg class="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                        <h2 class="text-2xl font-bold text-gray-800">Añadir Usuario</h2>
                    </div>

                    <form @submit.prevent="submitAddUser()">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input x-model="newUser.nombre" type="text" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno</label>
                                <input x-model="newUser.apellidoP" type="text" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                                <input x-model="newUser.apellidoM" type="text" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input x-model="newUser.email" type="email" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                                <input x-model="newUser.password" type="password" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de ingreso</label>
                                <input x-model="newUser.fechaIngreso" type="date" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Área</label>
                                <select x-model="newUser.area" @change="updatePuestoOptions()" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecciona un área</option>
                                    <template x-for="area in Object.keys(areaToPuestos)" :key="area">
                                        <option :value="area" x-text="area"></option>
                                    </template>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
                                <select x-model="newUser.puesto" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecciona un puesto</option>
                                    <template x-for="puesto in availablePuestos" :key="puesto">
                                        <option :value="puesto" x-text="puesto"></option>
                                    </template>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Privilegio</label>
                                <select x-model="newUser.privilegio" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecciona un privilegio</option>
                                    <option value="colaborador">Colaborador</option>
                                    <option value="rHumanos">Recursos Humanos</option>
                                    <option value="jefeInmediato">Jefe Inmediato</option>
                                    <option value="direccion">Dirección</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil (opcional)</label>
                            <input type="file" accept="image/*" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div class="flex justify-end space-x-4">
                            <button type="button" @click="closeModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                                Guardar Usuario
                            </button>
                        </div>
                    </form>
                </div>
            `));
        },

        // Submit add user form
        async submitAddUser() {
            try {
                // Validation
                const forbiddenCharsPattern = /[\{\}\:\$\=\'\*\[\]]/;
                if (forbiddenCharsPattern.test(this.newUser.nombre) ||
                    forbiddenCharsPattern.test(this.newUser.apellidoP) ||
                    forbiddenCharsPattern.test(this.newUser.apellidoM) ||
                    forbiddenCharsPattern.test(this.newUser.email)) {
                    this.showNotification('Error', 'Uno o más campos contienen caracteres no permitidos.', 'error');
                    return;
                }

                if (!validator.isEmail(this.newUser.email)) {
                    this.showNotification('Error', 'El formato del correo electrónico no es válido.', 'error');
                    return;
                }

                // Check if email exists
                const emailResponse = await fetch('/usuarios/doesEmailExists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.newUser.email })
                });
                const emailData = await emailResponse.json();

                if (!emailData.success) {
                    this.showNotification('Error', 'Error técnico #130.', 'error');
                    return;
                }

                if (emailData.exists) {
                    this.showNotification('Error', 'El correo electrónico ya se encuentra ocupado.', 'error');
                    return;
                }

                // Create FormData for file upload
                const formData = new FormData();
                Object.keys(this.newUser).forEach(key => {
                    formData.append(key, this.newUser[key]);
                });

                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput?.files[0]) {
                    formData.append('files', fileInput.files[0]);
                }

                const response = await fetch('/usuarios/addUser', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    this.showNotification('Éxito', 'Usuario añadido correctamente.');
                    this.closeModal();
                    // Add to table
                    this.table.addData([{
                        ...this.newUser,
                        id: data.userId || Date.now().toString()
                    }]);
                } else {
                    this.showNotification('Error', data.messageText || 'Error al añadir usuario.', 'error');
                }

            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error de conexión.', 'error');
            }
        },

        // Edit User functionality
        editUser(user) {
            // Populate form with user data
            this.newUser = { ...user };
            this.availablePuestos = this.areaToPuestos[user.area] || [];

            this.openModal(
                DOMPurify.sanitize(`
                <div class="px-6 py-4">
                    <div class="flex items-center mb-6">
                        <svg class="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        <h2 class="text-2xl font-bold text-gray-800">Editar Usuario</h2>
                    </div>

                    <form @submit.prevent="submitEditUser('${user.id}')">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input x-model="newUser.nombre" type="text" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno</label>
                                <input x-model="newUser.apellidoP" type="text" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                                <input x-model="newUser.apellidoM" type="text" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input x-model="newUser.email" type="email" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de ingreso</label>
                                <input x-model="newUser.fechaIngreso" type="date" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de término</label>
                                <input x-model="newUser.fechaTermino" type="date" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Área</label>
                                <select x-model="newUser.area" @change="updatePuestoOptions()" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecciona un área</option>
                                    <template x-for="area in Object.keys(areaToPuestos)" :key="area">
                                        <option :value="area" x-text="area"></option>
                                    </template>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
                                <select x-model="newUser.puesto" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecciona un puesto</option>
                                    <template x-for="puesto in availablePuestos" :key="puesto">
                                        <option :value="puesto" x-text="puesto"></option>
                                    </template>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Privilegio</label>
                                <select x-model="newUser.privilegio" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Selecciona un privilegio</option>
                                    <option value="colaborador">Colaborador</option>
                                    <option value="rHumanos">Recursos Humanos</option>
                                    <option value="jefeInmediato">Jefe Inmediato</option>
                                    <option value="direccion">Dirección</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-4">
                            <button type="button" @click="closeModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            `));
        },

        // Submit edit user form
        async submitEditUser(userId) {
            try {
                // Validation
                const forbiddenCharsPattern = /[\{\}\:\$\=\'\*\[\]]/;
                if (forbiddenCharsPattern.test(this.newUser.nombre) ||
                    forbiddenCharsPattern.test(this.newUser.apellidoP) ||
                    forbiddenCharsPattern.test(this.newUser.apellidoM) ||
                    forbiddenCharsPattern.test(this.newUser.email)) {
                    this.showNotification('Error', 'Uno o más campos contienen caracteres no permitidos.', 'error');
                    return;
                }

                if (!validator.isEmail(this.newUser.email)) {
                    this.showNotification('Error', 'El formato del correo electrónico no es válido.', 'error');
                    return;
                }

                const jsonData = {
                    userId: userId,
                    nombre: this.newUser.nombre,
                    apellidoP: this.newUser.apellidoP,
                    apellidoM: this.newUser.apellidoM,
                    email: this.newUser.email,
                    area: this.newUser.area,
                    puesto: this.newUser.puesto,
                    fechaIngreso: this.newUser.fechaIngreso,
                    privilegio: this.newUser.privilegio
                };

                if (this.newUser.fechaTermino) {
                    jsonData.fechaTermino = this.newUser.fechaTermino;
                }

                const response = await fetch('/usuarios/editUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(jsonData)
                });

                const data = await response.json();

                if (data.success) {
                    this.showNotification('Éxito', 'Usuario editado correctamente.');
                    this.closeModal();
                    // Update table data
                    this.table.updateData([{ id: userId, ...this.newUser }]);
                } else {
                    this.showNotification('Error', data.messageText || 'Error al editar usuario.', 'error');
                }

            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error de conexión.', 'error');
            }
        },

        // Deactivate User functionality
        deactivateUser(user) {
            this.openModal(
                DOMPurify.sanitize(`
                <div class="px-6 py-4">
                    <div class="flex items-center mb-6">
                        <svg class="w-8 h-8 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <h2 class="text-2xl font-bold text-gray-800">Desactivar Usuario</h2>
                    </div>

                    <div class="mb-6">
                        <p class="text-gray-600">
                            ¿Deseas desactivar a "<strong>${user.nombre} ${user.apellidoP} ${user.apellidoM}</strong>"?
                        </p>
                        <p class="text-gray-600 mt-2">
                            Este usuario ya no podrá acceder a la plataforma.
                        </p>
                    </div>

                    <div class="flex justify-end space-x-4">
                        <button type="button" @click="closeModal()" 
                                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="button" @click="confirmDeactivateUser('${user.id}')" 
                                class="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700">
                            Desactivar
                        </button>
                    </div>
                </div>
            `));
        },

        // Confirm deactivate user
        async confirmDeactivateUser(userId) {
            try {
                const response = await fetch('/usuarios/deactivateUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });

                const data = await response.json();

                if (data.success) {
                    this.showNotification('Éxito', 'Usuario desactivado correctamente.');
                    this.closeModal();
                    // Remove from table
                    this.table.deleteRow(userId);
                } else {
                    this.showNotification('Error', data.messageText || 'Error al desactivar usuario.', 'error');
                }

            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error de conexión.', 'error');
            }
        },

        // Change Password functionality
        changePassword(user) {
            this.openModal(
                DOMPurify.sanitize(`
                <div class="px-6 py-4">
                    <div class="flex items-center mb-6">
                        <svg class="w-8 h-8 mr-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2L3.257 9.257a6 6 0 018.486-8.486L18 7.257zm-6 6l-2-2"></path>
                        </svg>
                        <h2 class="text-2xl font-bold text-gray-800">Reiniciar Contraseña</h2>
                    </div>

                    <form @submit.prevent="confirmChangePassword('${user.id}')">
                        <div class="mb-6">
                            <p class="text-gray-600 mb-4">
                                Escribe la nueva contraseña para "<strong>${user.nombre} ${user.apellidoP} ${user.apellidoM}</strong>".
                            </p>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                                <input x-model="newPassword" type="password" required maxlength="54"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div class="flex justify-end space-x-4">
                            <button type="button" @click="closeModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-yellow-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-yellow-700">
                                Cambiar Contraseña
                            </button>
                        </div>
                    </form>
                </div>
            `));
        },

        // Confirm change password
        async confirmChangePassword(userId) {
            try {
                if (!this.newPassword) {
                    this.showNotification('Error', 'La contraseña es obligatoria.', 'error');
                    return;
                }

                const invalidCharsRegex = /[\{\}\:\$\=\'\*\[\]]/;
                if (invalidCharsRegex.test(this.newPassword)) {
                    this.showNotification('Error', 'La contraseña contiene caracteres no permitidos.', 'error');
                    return;
                }

                const response = await fetch('/usuarios/changePassword', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, password: this.newPassword })
                });

                const data = await response.json();

                if (data.success) {
                    this.showNotification('Éxito', 'Contraseña reiniciada correctamente.');
                    this.closeModal();
                } else {
                    this.showNotification('Error', data.messageText || 'Error al cambiar contraseña.', 'error');
                }

            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error de conexión.', 'error');
            }
        },

        // Navigation functions
        async restoreUsersView() {
            try {
                window.location.href = '${NGINX_TAG}/usuarios/restoreUsersView';
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al navegar.', 'error');
            }
        },

        async configureTeamView() {
            try {
                window.location.href = '${NGINX_TAG}/usuarios/configureTeamView';
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al navegar.', 'error');
            }
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
                }
            } catch (error) {
                console.log("error catch", error);
                this.showNotification('Error', 'Error al descargar Excel.', 'error');
            }
        }
    };
}