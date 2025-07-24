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

            const email = this.email.trim();
            const password = this.password.trim();
            const remember = this.remember;

            const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            if (!email || !password || !isEmailValid) {
                this.errorMessage = 'Asegúrate de llenar todos los campos correctamente.';
                this.isLoading = false;
                return;
            }

            this.isLoading = true;

            try {
                const response = await fetch(`${URL_TAG}/login/postAuth`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password, remember })
                });

                if (!response.ok) throw new Error;

                const data = await response.json();

                if (data.success && data.authorized) {
                    window.location.href = `${URL_TAG}/inicio`;
                } else {
                    this.errorMessage = data.message || 'Credenciales incorrectas.';
                }

            } catch (error) {
                this.errorMessage = ERROR_MESSAGE + "004";
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