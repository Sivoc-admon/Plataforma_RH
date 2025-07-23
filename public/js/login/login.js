// login.js
function logInLogic() { // Renamed to avoid conflicts and encapsulate logic
    return {
        email: '',
        password: '',
        remember: false,
        showPassword: false,
        isLoading: false,
        errorMessage: '',

        async logIn() {
            this.errorMessage = ''; // Limpiar mensaje previo

            const email = this.email;
            const password = this.password;
            const remember = this.remember;

            const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (!email || !password || !isEmailValid) {
                this.errorMessage = 'Asegúrate de llenar todos los campos correctamente.';
                this.isLoading = false;
                return;
            }

            this.isLoading = true;

            try {
                const response = await fetch("/login/POSTAUTH", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password, remember })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error de autenticación.');
                }

                const data = await response.json();

                if (data.success && data.authorized) {
                    window.location.href = data.redirectUrl;
                } else {
                    this.errorMessage = data.message || 'Credenciales incorrectas.';
                }

            } catch (error) {
                console.error('[Login Error]:', error);
                this.errorMessage = error.message || 'No se pudo conectar con el servidor.';
            } finally {
                this.isLoading = false;
            }
        },

        init() {
            // Add event listener for 'Enter' key press
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !this.isLoading) {
                    event.preventDefault();
                    this.logIn();
                }
            });
        }
    };
}