
document.addEventListener("DOMContentLoaded", function () {

    // ==================================
    // 1. SELECT HTML ELEMENTS
    // ==================================

    const loginForm = document.getElementById("loginForm");

    const loginEmail = document.getElementById("loginEmail");

    const loginPassword = document.getElementById("loginPassword");

    const rememberMe = document.getElementById("rememberMe");

    const loginButton = document.getElementById("loginBtn");

    const forgotPassword = document.getElementById("forgotPassword");

    const togglePassword = document.getElementById("toggleLoginPassword");

    const authToast = document.getElementById("authToast");

    const authToastMessage = document.getElementById("authToastMessage");

    let toastTimer;


    // ==================================
    // 2. NOTIFICATION
    // ==================================

    function showNotification(message, type = "success") {

        const icon = authToast.querySelector("i");

        authToastMessage.textContent = message;

        if (type === "error") {

            icon.className = "fa-solid fa-circle-exclamation";

            icon.style.color = "#fb7185";

        } else {

            icon.className = "fa-solid fa-circle-check";

            icon.style.color = "#4ade80";

        }

        authToast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            authToast.classList.remove("show");

        }, 3000);

    }


    // ==================================
    // 3. ERROR HANDLING
    // ==================================

    function showError(input, errorId, message) {

        document.getElementById(errorId).textContent = message;

        input.closest(".form-group")
             .querySelector(".input-wrapper")
             .classList.add("invalid");

    }


    function clearError(input, errorId) {

        document.getElementById(errorId).textContent = "";

        input.closest(".form-group")
             .querySelector(".input-wrapper")
             .classList.remove("invalid");

    }


    // ==================================
    // 4. SHOW / HIDE PASSWORD
    // ==================================

    togglePassword.addEventListener("click", function () {

        const icon = togglePassword.querySelector("i");

        if (loginPassword.type === "password") {

            loginPassword.type = "text";

            icon.classList.replace("fa-eye", "fa-eye-slash");

            togglePassword.setAttribute("aria-label", "Hide password");

        } else {

            loginPassword.type = "password";

            icon.classList.replace("fa-eye-slash", "fa-eye");

            togglePassword.setAttribute("aria-label", "Show password");

        }

    });


    // ==================================
    // 5. INPUT VALIDATION
    // ==================================

    loginEmail.addEventListener("input", function () {

        clearError(loginEmail, "loginEmailError");

    });


    loginPassword.addEventListener("input", function () {

        clearError(loginPassword, "loginPasswordError");

    });


    function validateLoginForm() {

        let isValid = true;

        const emailValue = loginEmail.value.trim();

        const passwordValue = loginPassword.value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


        if (!emailValue) {

            showError(
                loginEmail,
                "loginEmailError",
                "Please enter your email address."
            );

            isValid = false;

        } else if (!emailRegex.test(emailValue)) {

            showError(
                loginEmail,
                "loginEmailError",
                "Enter a valid email address."
            );

            isValid = false;

        } else {

            clearError(loginEmail, "loginEmailError");

        }


        if (!passwordValue) {

            showError(
                loginPassword,
                "loginPasswordError",
                "Please enter your password."
            );

            isValid = false;

        } else {

            clearError(loginPassword, "loginPasswordError");

        }

        return isValid;

    }


    // ==================================
    // 6. FORGOT PASSWORD
    // ==================================

    forgotPassword.addEventListener("click", function () {

        showNotification(
            "Password recovery will be implemented in a future version.",
            "error"
        );

    });


    // ==================================
    // 7. USER AUTHENTICATION
    // ==================================

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!validateLoginForm()) {

            showNotification("Please enter valid login details.", "error");

            return;

        }


        const emailValue = loginEmail.value.trim().toLowerCase();

        const passwordValue = loginPassword.value;


        loginButton.disabled = true;

        loginButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';


        try {

            // Get registered accounts
            const users = getUsers();


            // Find account using email
            const user = users.find(function (account) {

                return account.email.toLowerCase() === emailValue;

            });


            // Check whether account exists
            if (!user) {

                showNotification("Invalid email or password.", "error");

                return;

            }


            // Check account status
            if (user.status === "blocked") {

                showNotification(
                    "Your account has been blocked. Contact the administrator.",
                    "error"
                );

                return;

            }


            // Verify password
            const isPasswordValid = await verifyPassword(
                passwordValue,
                user.passwordHash,
                user.salt
            );


            if (!isPasswordValid) {

                showNotification("Invalid email or password.", "error");

                return;

            }


            // Only normal users can use this login page
            if (user.role !== "user") {

                showNotification(
                    "Please use the appropriate login portal.",
                    "error"
                );

                return;

            }


            // Create session
            createSession(user, rememberMe.checked);


            showNotification("Login successful! Welcome back.");


            // Redirect to user dashboard
            setTimeout(function () {

                window.location.href = "user-dashboard.html";

            }, 1200);


        } catch (error) {

            console.error("Login error:", error);

            showNotification(
                "Something went wrong. Please try again.",
                "error"
            );

        } finally {

            loginButton.disabled = false;

            loginButton.innerHTML =
                'Sign In <i class="fa-solid fa-arrow-right"></i>';

        }

    });

});
