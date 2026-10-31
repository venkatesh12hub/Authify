
document.addEventListener("DOMContentLoaded", function () {

    const isAdminLogin =
        document.getElementById("adminLoginForm");

    const isAdminDashboard =
        document.getElementById("adminTableBody");

    // ==================================
    // ADMIN LOGIN
    // ==================================

    if (isAdminLogin) {

        const form = isAdminLogin;
        const email = document.getElementById("adminEmail");
        const password = document.getElementById("adminPassword");

        const toast = document.getElementById("authToast");
        const toastMessage = document.getElementById("authToastMessage");

        function notify(message, error = false) {

            toastMessage.textContent = message;

            const icon = toast.querySelector("i");

            icon.className = error
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";

            toast.classList.add("show");

            setTimeout(() => toast.classList.remove("show"), 3000);

        }

        document.getElementById("adminTogglePassword")
            .addEventListener("click", function () {

                password.type =
                    password.type === "password" ? "text" : "password";

                this.querySelector("i").classList.toggle("fa-eye");
                this.querySelector("i").classList.toggle("fa-eye-slash");

            });

        form.addEventListener("submit", async function (event) {

            event.preventDefault();

            document.getElementById("adminEmailError").textContent = "";
            document.getElementById("adminPasswordError").textContent = "";

            const emailValue = email.value.trim().toLowerCase();
            const passwordValue = password.value;

            let valid = true;

            if (!emailValue) {
                document.getElementById("adminEmailError").textContent =
                    "Email is required.";
                valid = false;
            }

            if (!passwordValue) {
                document.getElementById("adminPasswordError").textContent =
                    "Password is required.";
                valid = false;
            }

            if (!valid) return;

            const admin = getAdmin();

            if (!admin) {
                notify("No admin account found. Please register first.", true);
                setTimeout(() => {
                    window.location.href = "admin-register.html";
                }, 1200);
                return;
            }

            const passwordMatches = await verifyPassword(
                passwordValue,
                admin.passwordHash,
                admin.salt
            );

            if (emailValue === admin.email && passwordMatches) {
                createAdminSession(admin);
                notify("Admin login successful!");

                setTimeout(() => {
                    window.location.href = "admin-dashboard.html";
                }, 800);
            } else {
                notify("Invalid administrator email or password.", true);
            }

        });

    }


    // ==================================
    // ADMIN DASHBOARD
    // ==================================

    if (isAdminDashboard) {

        if (!isAdminSession()) {
            window.location.replace("admin-login.html");
            return;
        }

        initializeAdminDashboard();

    }

});


// ==================================
// ADMIN DASHBOARD INITIALIZATION
// ==================================

function initializeAdminDashboard() {

    let users = getUsers();

    const tableBody = document.getElementById("adminTableBody");

    const searchInput = document.getElementById("userSearch");

    const toast = document.getElementById("adminToast");
    const toastMessage = document.getElementById("adminToastMessage");

    let editingUserId = null;

    function notify(message, error = false) {

        toastMessage.textContent = message;

        toast.classList.toggle("error", error);

        toast.classList.add("show");

        setTimeout(() => toast.classList.remove("show"), 3000);

    }


    // ==================================
    // LOAD STATISTICS
    // ==================================

    function updateStatistics() {

        users = getUsers();

        document.getElementById("totalUsers").textContent =
            users.length;

        document.getElementById("activeUsers").textContent =
            users.filter(user => user.status === "active").length;

        document.getElementById("blockedUsers").textContent =
            users.filter(user => user.status === "blocked").length;

    }


    // ==================================
    // DISPLAY USERS
    // ==================================

    function renderUsers(query = "") {

        users = getUsers();

        const filteredUsers = users.filter(user => {

            const searchText = query.toLowerCase();

            return (
                user.name.toLowerCase().includes(searchText) ||
                user.email.toLowerCase().includes(searchText) ||
                user.phone.includes(searchText)
            );

        });

        tableBody.innerHTML = "";

        if (filteredUsers.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table">
                        No registered users found.
                    </td>
                </tr>
            `;

            return;

        }

        filteredUsers.forEach(user => {

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = user.name;

            const emailCell = document.createElement("td");
            emailCell.textContent = user.email;

            const phoneCell = document.createElement("td");
            phoneCell.textContent = user.phone;

            const dateCell = document.createElement("td");
            dateCell.textContent = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN")
                : "--";

            const statusCell = document.createElement("td");
            const status = document.createElement("span");

            status.className =
                user.status === "blocked" ? "admin-status blocked" : "admin-status active";

            status.textContent = user.status || "active";
            statusCell.appendChild(status);

            const actionCell = document.createElement("td");
            actionCell.className = "admin-actions";

            const editButton = document.createElement("button");
            editButton.className = "edit-action";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editUser(user.id));

            const blockButton = document.createElement("button");
            blockButton.className = "block-action";
            blockButton.textContent =
                user.status === "blocked" ? "Unblock" : "Block";

            blockButton.addEventListener("click", () => toggleBlock(user.id));

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-action";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteUser(user.id));

            actionCell.append(editButton, blockButton, deleteButton);

            row.append(
                nameCell,
                emailCell,
                phoneCell,
                dateCell,
                statusCell,
                actionCell
            );

            tableBody.appendChild(row);

        });

    }


    // ==================================
    // SEARCH USERS
    // ==================================

    searchInput.addEventListener("input", function () {
        renderUsers(this.value.trim());
    });


    // ==================================
    // EDIT USER
    // ==================================

    function editUser(id) {

        users = getUsers();

        const user = users.find(user => user.id === id);

        if (!user) return;

        editingUserId = id;

        document.getElementById("editUserName").value = user.name;
        document.getElementById("editUserEmail").value = user.email;
        document.getElementById("editUserPhone").value = user.phone;

        document.getElementById("editModal").classList.add("show");

    }


    document.getElementById("editUserForm")
        .addEventListener("submit", function (event) {

            event.preventDefault();

            const name = document.getElementById("editUserName").value.trim();
            const email = document.getElementById("editUserEmail").value.trim().toLowerCase();
            const phone = document.getElementById("editUserPhone").value.trim();

            const nameRegex = /^[A-Za-z][A-Za-z .'-]{1,48}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            const phoneRegex = /^[6-9]\d{9}$/;

            if (!nameRegex.test(name) || !emailRegex.test(email) ||
                !phoneRegex.test(phone)) {

                notify("Please enter valid user details.", true);
                return;

            }

            users = getUsers();

            const user = users.find(user => user.id === editingUserId);

            if (!user) return;

            const duplicate = users.some(
                item => item.email.toLowerCase() === email &&
                        item.id !== editingUserId
            );

            if (duplicate) {
                notify("Email already belongs to another user.", true);
                return;
            }

            user.name = name;
            user.email = email;
            user.phone = phone;

            saveUsers(users);

            document.getElementById("editModal").classList.remove("show");

            notify("User details updated successfully.");

            renderUsers(searchInput.value);
            updateStatistics();

        });


    // ==================================
    // CANCEL EDIT
    // ==================================

    document.getElementById("cancelEdit")
        .addEventListener("click", function () {

            document.getElementById("editModal").classList.remove("show");

        });


    // ==================================
    // BLOCK / UNBLOCK USER
    // ==================================

    function toggleBlock(id) {

        users = getUsers();

        const user = users.find(user => user.id === id);

        if (!user) return;

        user.status =
            user.status === "blocked" ? "active" : "blocked";

        saveUsers(users);

        notify(
            user.status === "blocked"
                ? "User blocked successfully."
                : "User unblocked successfully."
        );

        renderUsers(searchInput.value);
        updateStatistics();

    }


    // ==================================
    // DELETE USER
    // ==================================

    function deleteUser(id) {

        users = getUsers();

        const user = users.find(user => user.id === id);

        if (!user) return;

        const confirmed = confirm(
            `Are you sure you want to permanently delete ${user.name}?`
        );

        if (!confirmed) return;

        users = users.filter(user => user.id !== id);

        saveUsers(users);

        notify("User deleted successfully.");

        renderUsers(searchInput.value);
        updateStatistics();

    }


    // ==================================
    // LOGOUT
    // ==================================

    document.getElementById("adminLogout")
        .addEventListener("click", function () {

            if (!confirm("Are you sure you want to logout?")) return;

            clearSession();

            window.location.replace("../index.html");

        });


    // INITIAL LOAD

    updateStatistics();
    renderUsers();

}
