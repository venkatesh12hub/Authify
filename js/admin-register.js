document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("adminRegisterForm");
    const nameInput = document.getElementById("adminName");
    const emailInput = document.getElementById("adminRegisterEmail");
    const passwordInput = document.getElementById("adminRegisterPassword");
    const confirmInput = document.getElementById("adminConfirmPassword");
    const toast = document.getElementById("authToast");
    const toastMessage = document.getElementById("authToastMessage");

    function notify(message, error = false) {
        toastMessage.textContent = message;
        const icon = toast.querySelector("i");
        icon.className = error ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    if (getAdmin()) {
        notify("An admin account is already registered. Please sign in.", true);
        setTimeout(() => window.location.replace("admin-login.html"), 1300);
        return;
    }

    document.getElementById("toggleAdminRegisterPassword").addEventListener("click", function () {
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        this.querySelector("i").classList.toggle("fa-eye");
        this.querySelector("i").classList.toggle("fa-eye-slash");
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const fields = ["adminNameError", "adminRegisterEmailError", "adminRegisterPasswordError", "adminConfirmPasswordError"];
        fields.forEach(id => document.getElementById(id).textContent = "");

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        let valid = true;

        if (!/^[A-Za-z][A-Za-z .'-]{1,48}$/.test(name)) {
            document.getElementById("adminNameError").textContent = "Enter a valid name (2–49 characters).";
            valid = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            document.getElementById("adminRegisterEmailError").textContent = "Enter a valid email address.";
            valid = false;
        }
        if (password.length < 8) {
            document.getElementById("adminRegisterPasswordError").textContent = "Password must contain at least 8 characters.";
            valid = false;
        }
        if (password !== confirmPassword) {
            document.getElementById("adminConfirmPasswordError").textContent = "Passwords do not match.";
            valid = false;
        }
        if (!valid) return;

        if (getAdmin()) {
            notify("An admin account is already registered.", true);
            return;
        }

        try {
            const { passwordHash, salt } = await hashPassword(password);
            const admin = {
                id: "admin-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
                name, email, passwordHash, salt, role: "admin",
                createdAt: new Date().toISOString()
            };
            saveAdmin(admin);
            form.reset();
            notify("Admin account created. Redirecting to login...");
            setTimeout(() => window.location.href = "admin-login.html", 1000);
        } catch (error) {
            console.error("Admin registration failed:", error);
            notify("Could not create the admin account. Use HTTPS or localhost and try again.", true);
        }
    });
});
