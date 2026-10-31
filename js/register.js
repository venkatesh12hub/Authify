
document.addEventListener("DOMContentLoaded", function () {

    // ==================================
    // 1. SELECT ELEMENTS
    // ==================================

    const registerForm = document.getElementById("registerForm");

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    const terms = document.getElementById("terms");

    const passwordBars = document.querySelectorAll(".strength-bars span");
    const strengthText = document.getElementById("strengthText");

    const authToast = document.getElementById("authToast");
    const authToastMessage = document.getElementById("authToastMessage");

    let toastTimer;


    // ==================================
    // 2. SHOW NOTIFICATION
    // ==================================

    function showNotification(message, type = "success") {

        authToastMessage.textContent = message;

        const icon = authToast.querySelector("i");

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
    // 3. ERROR MESSAGE HANDLING
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

    document.querySelectorAll(".toggle-password").forEach(function (button) {

        button.addEventListener("click", function () {

            const targetId = button.dataset.target;

            const input = document.getElementById(targetId);

            const icon = button.querySelector("i");

            if (input.type === "password") {

                input.type = "text";

                icon.classList.replace("fa-eye", "fa-eye-slash");

                button.setAttribute("aria-label", "Hide password");

            } else {

                input.type = "password";

                icon.classList.replace("fa-eye-slash", "fa-eye");

                button.setAttribute("aria-label", "Show password");

            }

        });

    });


    // ==================================
    // 5. PASSWORD STRENGTH
    // ==================================

    function checkPasswordStrength(value) {

        let score = 0;

        if (value.length >= 8) score++;

        if (/[A-Z]/.test(value)) score++;

        if (/[0-9]/.test(value)) score++;

        if (/[^A-Za-z0-9]/.test(value)) score++;

        if (/[a-z]/.test(value)) score++;

        // Maximum four strength levels
        score = Math.min(score, 4);

        const colors = [
            "#f43f5e",
            "#f97316",
            "#eab308",
            "#22c55e"
        ];

        const labels = [
            "Very Weak",
            "Weak",
            "Medium",
            "Strong",
            "Very Strong"
        ];

        passwordBars.forEach(function (bar, index) {

            bar.style.background =
                index < score ? colors[score - 1] : "#293244";

        });

        strengthText.textContent = value
            ? labels[score]
            : "Password strength";

    }


    password.addEventListener("input", function () {

        checkPasswordStrength(password.value);

    });


    // ==================================
    // 6. REAL-TIME VALIDATION
    // ==================================

    fullName.addEventListener("input", function () {
        clearError(fullName, "nameError");
    });

    email.addEventListener("input", function () {
        clearError(email, "emailError");
    });

    phone.addEventListener("input", function () {

        phone.value = phone.value.replace(/\D/g, "").slice(0, 10);

        clearError(phone, "phoneError");

    });

    password.addEventListener("input", function () {
        clearError(password, "passwordError");
    });

    confirmPassword.addEventListener("input", function () {
        clearError(confirmPassword, "confirmError");
    });


    // ==================================
    // 7. VALIDATE FORM
    // ==================================

    function validateForm() {

        let isValid = true;

        const nameValue = fullName.value.trim();
        const emailValue = email.value.trim();
        const phoneValue = phone.value.trim();

        const passwordValue = password.value;
        const confirmValue = confirmPassword.value;


        // Name validation
        const nameRegex = /^[A-Za-z][A-Za-z .'-]{1,48}$/;

        if (!nameValue) {

            showError(fullName, "nameError", "Full name is required.");

            isValid = false;

        } else if (!nameRegex.test(nameValue)) {

            showError(
                fullName,
                "nameError",
                "Enter a valid name (minimum 2 characters)."
            );

            isValid = false;

        } else {

            clearError(fullName, "nameError");

        }


        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailValue) {

            showError(email, "emailError", "Email address is required.");

            isValid = false;

        } else if (!emailRegex.test(emailValue)) {

            showError(email, "emailError", "Enter a valid email address.");

            isValid = false;

        } else if (emailExists(emailValue)) {

            showError(email, "emailError", "This email is already registered.");

            isValid = false;

        } else {

            clearError(email, "emailError");

        }


        // Phone validation
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneValue) {

            showError(phone, "phoneError", "Phone number is required.");

            isValid = false;

        } else if (!phoneRegex.test(phoneValue)) {

            showError(
                phone,
                "phoneError",
                "Enter a valid 10-digit Indian mobile number."
            );

            isValid = false;

        } else {

            clearError(phone, "phoneError");

        }


        // Password validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

        if (!passwordValue) {

            showError(password, "passwordError", "Password is required.");

            isValid = false;

        } else if (!passwordRegex.test(passwordValue)) {

            showError(
                password,
                "passwordError",
                "Use 8+ characters with uppercase, lowercase, number and special character."
            );

            isValid = false;

        } else {

            clearError(password, "passwordError");

        }


        // Confirm password
        if (!confirmValue) {

            showError(
                confirmPassword,
                "confirmError",
                "Please confirm your password."
            );

            isValid = false;

        } else if (passwordValue !== confirmValue) {

            showError(
                confirmPassword,
                "confirmError",
                "Passwords do not match."
            );

            isValid = false;

        } else {

            clearError(confirmPassword, "confirmError");

        }


        // Terms validation
        if (!terms.checked) {

            document.getElementById("termsError").textContent =
                "Please accept the Terms & Conditions.";

            isValid = false;

        } else {

            document.getElementById("termsError").textContent = "";

        }

        return isValid;

    }


    // ==================================
    // 8. REGISTER USER
    // ==================================

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!validateForm()) {

            showNotification("Please correct the errors.", "error");

            return;

        }

        const registerButton = document.getElementById("registerBtn");

        registerButton.disabled = true;

        registerButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';


        try {

            // Hash the password
            const passwordData = await hashPassword(password.value);

            // Create user object
            const newUser = {

                id: crypto.randomUUID(),

                name: fullName.value.trim(),

                email: email.value.trim().toLowerCase(),

                phone: phone.value.trim(),

                passwordHash: passwordData.passwordHash,

                salt: passwordData.salt,

                role: "user",

                status: "active",

                createdAt: new Date().toISOString()

            };


            // Get existing users
            const users = getUsers();

            // Check again before saving
            if (emailExists(newUser.email)) {

                showError(
                    email,
                    "emailError",
                    "This email is already registered."
                );

                showNotification("Email already registered.", "error");

                return;

            }


            // Add new user
            users.push(newUser);

            // Save in localStorage
            saveUsers(users);


            showNotification("Registration successful!");

            registerForm.reset();

            checkPasswordStrength("");

            // Redirect to login page
            setTimeout(function () {

                window.location.href = "login.html";

            }, 1500);


        } catch (error) {

            console.error("Registration error:", error);

            showNotification(
                "Unable to create account. Please try again.",
                "error"
            );

        } finally {

            registerButton.disabled = false;

            registerButton.innerHTML =
                'Create Account <i class="fa-solid fa-arrow-right"></i>';

        }

    });

});
