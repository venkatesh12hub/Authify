document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // 1. SESSION AUTHENTICATION
    // =========================================

    const session = getSession();

    if (!session || session.role !== "user") {

        window.location.replace("login.html");

        return;

    }


    // Get registered users
    let users = getUsers();

    // Find currently logged-in user
    let currentUser = users.find(function (user) {

        return user.id === session.userId;

    });


    // Validate account
    if (!currentUser || currentUser.role !== "user" ||
        currentUser.status !== "active") {

        clearSession();

        window.location.replace("login.html");

        return;

    }


    // =========================================
    // 2. SELECT HTML ELEMENTS
    // =========================================

    const sidebar = document.getElementById("sidebar");

    const menuToggle = document.getElementById("menuToggle");

    const logoutBtn = document.getElementById("logoutBtn");

    const navItems = document.querySelectorAll(".nav-item");

    const sections = document.querySelectorAll(".dashboard-section");

    const toast = document.getElementById("dashboardToast");

    const toastMessage = document.getElementById("dashboardToastMessage");

    let toastTimer;


    // =========================================
    // 3. NOTIFICATION
    // =========================================

    function showNotification(message, type = "success") {

        const icon = toast.querySelector("i");

        toastMessage.textContent = message;

        toast.classList.toggle("error", type === "error");

        icon.className = type === "error"
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            toast.classList.remove("show");

        }, 3000);

    }


    // =========================================
    // 4. FORMAT DATE
    // =========================================

    function formatDate(dateValue) {

        if (!dateValue) return "--";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) return "--";

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    }


    // =========================================
    // 5. UPDATE DASHBOARD UI
    // =========================================

    function updateDashboard() {

        const firstLetter =
            currentUser.name.trim().charAt(0).toUpperCase();

        const createdDate = formatDate(currentUser.createdAt);

        // Sidebar
        document.getElementById("sidebarName").textContent =
            currentUser.name;

        document.getElementById("sidebarAvatar").textContent =
            firstLetter;

        // Topbar
        document.getElementById("topbarAvatar").textContent =
            firstLetter;

        document.getElementById("currentDate").textContent =
            new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });

        // Welcome section
        document.getElementById("welcomeName").textContent =
            currentUser.name.split(" ")[0];

        // Account information
        document.getElementById("overviewName").textContent =
            currentUser.name;

        document.getElementById("overviewEmail").textContent =
            currentUser.email;

        document.getElementById("overviewFullName").textContent =
            currentUser.name;

        document.getElementById("overviewEmailDetail").textContent =
            currentUser.email;

        document.getElementById("overviewPhone").textContent =
            currentUser.phone;

        document.getElementById("profileAvatar").textContent =
            firstLetter;

        // Statistics
        document.getElementById("memberSince").textContent =
            createdDate;

        document.getElementById("overviewStatus").textContent =
            "Active";

        // Profile page
        document.getElementById("editAvatar").textContent =
            firstLetter;

        document.getElementById("profileDisplayName").textContent =
            currentUser.name;

        document.getElementById("profileDisplayEmail").textContent =
            currentUser.email;

        document.getElementById("editName").value =
            currentUser.name;

        document.getElementById("editEmail").value =
            currentUser.email;

        document.getElementById("editPhone").value =
            currentUser.phone;

        document.getElementById("editRole").value =
            "User";

        // Settings page
        document.getElementById("settingsEmail").textContent =
            currentUser.email;

        document.getElementById("settingsCreated").textContent =
            createdDate;

        document.getElementById("settingsStatus").textContent =
            "Active";

        document.getElementById("statusBadge").textContent =
            "Active";

    }


    updateDashboard();


    // =========================================
    // 6. SIDEBAR NAVIGATION
    // =========================================

    function openSection(sectionId) {

        const targetSection = document.getElementById(sectionId);

        if (!targetSection ||
            !targetSection.classList.contains("dashboard-section")) {

            return;

        }

        // Hide all sections
        sections.forEach(function (section) {

            section.classList.remove("active");

        });

        // Show selected section
        targetSection.classList.add("active");

        // Update active navigation
        navItems.forEach(function (item) {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
            );

        });

        // Update page heading
        const headings = {
            overview: "Overview",
            profile: "My Profile",
            settings: "Account Settings",
            security: "Security"
        };

        document.getElementById("pageTitle").textContent =
            headings[sectionId] || "Dashboard";

        // Close mobile sidebar
        sidebar.classList.remove("open");

    }


    // Sidebar navigation buttons
    document.querySelectorAll("[data-section]").forEach(function (button) {

        button.addEventListener("click", function () {

            openSection(button.dataset.section);

        });

    });


    // =========================================
    // 7. MOBILE SIDEBAR
    // =========================================

    menuToggle.addEventListener("click", function () {

        sidebar.classList.toggle("open");

    });


    document.addEventListener("click", function (event) {

        if (
            window.innerWidth <= 768 &&
            sidebar.classList.contains("open") &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            sidebar.classList.remove("open");

        }

    });


    // =========================================
    // 8. EDIT PROFILE
    // =========================================

    const profileForm = document.getElementById("profileForm");

    const editName = document.getElementById("editName");

    const editPhone = document.getElementById("editPhone");

    const profileError = document.getElementById("profileError");


    editPhone.addEventListener("input", function () {

        editPhone.value = editPhone.value
            .replace(/\D/g, "")
            .slice(0, 10);

    });


    profileForm.addEventListener("submit", function (event) {

        event.preventDefault();

        profileError.textContent = "";

        const nameValue = editName.value.trim();

        const phoneValue = editPhone.value.trim();

        const nameRegex = /^[A-Za-z][A-Za-z .'-]{1,48}$/;

        const phoneRegex = /^[6-9]\d{9}$/;


        if (!nameRegex.test(nameValue)) {

            profileError.textContent =
                "Please enter a valid full name.";

            return;

        }


        if (!phoneRegex.test(phoneValue)) {

            profileError.textContent =
                "Please enter a valid 10-digit Indian mobile number.";

            return;

        }


        // Update user object
        currentUser.name = nameValue;

        currentUser.phone = phoneValue;


        // Update localStorage
        users = getUsers();

        const userIndex = users.findIndex(function (user) {

            return user.id === currentUser.id;

        });

        if (userIndex === -1) {

            showNotification("Account not found.", "error");

            return;

        }

        users[userIndex] = currentUser;

        saveUsers(users);


        // Update current UI
        updateDashboard();

        showNotification("Profile updated successfully!");

    });


    // =========================================
    // 9. SHOW / HIDE PASSWORD
    // =========================================

    document.querySelectorAll(".dashboard-password-toggle")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const input = document.getElementById(
                    button.dataset.target
                );

                const icon = button.querySelector("i");

                if (input.type === "password") {

                    input.type = "text";

                    icon.classList.replace(
                        "fa-eye",
                        "fa-eye-slash"
                    );

                } else {

                    input.type = "password";

                    icon.classList.replace(
                        "fa-eye-slash",
                        "fa-eye"
                    );

                }

            });

        });


    // =========================================
    // 10. CHANGE PASSWORD
    // =========================================

    const passwordForm = document.getElementById("passwordForm");

    const currentPassword =
        document.getElementById("currentPassword");

    const newPassword =
        document.getElementById("newPassword");

    const confirmNewPassword =
        document.getElementById("confirmNewPassword");

    const passwordError =
        document.getElementById("passwordError");


    passwordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        passwordError.textContent = "";


        const oldPassword = currentPassword.value;

        const newPasswordValue = newPassword.value;

        const confirmValue = confirmNewPassword.value;


        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;


        if (!oldPassword || !newPasswordValue || !confirmValue) {

            passwordError.textContent =
                "Please fill in all password fields.";

            return;

        }


        if (!passwordRegex.test(newPasswordValue)) {

            passwordError.textContent =
                "New password must contain 8+ characters, uppercase, lowercase, number and special character.";

            return;

        }


        if (newPasswordValue !== confirmValue) {

            passwordError.textContent =
                "New passwords do not match.";

            return;

        }


        if (oldPassword === newPasswordValue) {

            passwordError.textContent =
                "New password must be different from current password.";

            return;

        }


        try {

            // Verify current password
            const isValid = await verifyPassword(
                oldPassword,
                currentUser.passwordHash,
                currentUser.salt
            );


            if (!isValid) {

                passwordError.textContent =
                    "Current password is incorrect.";

                return;

            }


            // Generate new password hash
            const passwordData = await hashPassword(newPasswordValue);


            // Update password credentials
            currentUser.passwordHash =
                passwordData.passwordHash;

            currentUser.salt =
                passwordData.salt;


            // Update localStorage
            users = getUsers();

            const userIndex = users.findIndex(function (user) {

                return user.id === currentUser.id;

            });


            if (userIndex === -1) {

                passwordError.textContent =
                    "Account could not be found.";

                return;

            }


            users[userIndex] = currentUser;

            saveUsers(users);


            // Clear form
            passwordForm.reset();

            showNotification("Password updated successfully!");

        } catch (error) {

            console.error("Password update error:", error);

            showNotification(
                "Unable to update password. Please try again.",
                "error"
            );

        }

    });


    // =========================================
    // 11. LOGOUT
    // =========================================

    logoutBtn.addEventListener("click", function () {

        const confirmLogout = window.confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) {

            return;

        }


        // Remove active session
        clearSession();


        // Return to landing page
        window.location.replace("../index.html");

    });

});
