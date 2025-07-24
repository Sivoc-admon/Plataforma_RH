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
            let error_message = '';

            try {
                const response = await fetch(`${URL_TAG}/login/postAuth`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password, remember })
                });
                const data = await response.json();
                error_message = data.message;
                if (!response.ok) throw new Error;
                if (data.success) window.location.href = `${URL_TAG}/inicio`;
            } catch (error) {
                this.errorMessage = error_message;
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