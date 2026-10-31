
// ==================================
// AUTHIFY STORAGE MANAGEMENT
// ==================================

const USER_STORAGE_KEY = "authify_users";
const ADMIN_STORAGE_KEY = "authify_admin";


// ==================================
// 1. GET ALL REGISTERED USERS
// ==================================

function getUsers() {

    const users = localStorage.getItem(USER_STORAGE_KEY);

    return users ? JSON.parse(users) : [];

}


// ==================================
// 2. SAVE USERS
// ==================================

function saveUsers(users) {

    localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(users)
    );

}


// ==================================
// 3. CHECK DUPLICATE EMAIL
// ==================================

function emailExists(email) {

    const users = getUsers();

    return users.some(function (user) {

        return user.email.toLowerCase() === email.toLowerCase();

    });

}


// ==================================
// 4. GENERATE SECURE PASSWORD HASH
// ==================================

async function hashPassword(password) {

    const encoder = new TextEncoder();

    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Convert password into cryptographic key material
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    // Derive password hash
    const hash = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 150000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    // Convert binary data into Base64
    function toBase64(buffer) {

        return btoa(
            String.fromCharCode(...new Uint8Array(buffer))
        );

    }

    return {
        passwordHash: toBase64(hash),
        salt: toBase64(salt)
    };

}


// ==================================
// 5. VERIFY PASSWORD
// ==================================

async function verifyPassword(password, storedHash, storedSalt) {

    const encoder = new TextEncoder();

    // Convert stored Base64 salt into bytes
    const saltBytes = Uint8Array.from(
        atob(storedSalt),
        char => char.charCodeAt(0)
    );

    // Import entered password
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    // Generate hash using original salt
    const derivedHash = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: 150000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    // Convert generated hash into Base64
    const generatedHash = btoa(
        String.fromCharCode(...new Uint8Array(derivedHash))
    );

    // Compare generated hash with stored hash
    return generatedHash === storedHash;

}


// ==================================
// 6. CREATE LOGIN SESSION
// ==================================

function createSession(user, rememberMe) {

    const sessionData = {

        userId: user.id,

        name: user.name,

        email: user.email,

        role: user.role,

        loginTime: new Date().toISOString()

    };

    // Clear previous demo session
    clearSession();

    if (rememberMe) {

        // Persistent browser storage
        localStorage.setItem(
            "authify_session",
            JSON.stringify(sessionData)
        );

    } else {

        // Session storage lasts for the tab session
        sessionStorage.setItem(
            "authify_session",
            JSON.stringify(sessionData)
        );

    }

}


// ==================================
// 7. GET CURRENT SESSION
// ==================================

function getSession() {

    const session =
        sessionStorage.getItem("authify_session") ||
        localStorage.getItem("authify_session");

    return session ? JSON.parse(session) : null;

}


// ==================================
// 8. CLEAR SESSION
// ==================================

function clearSession() {

    sessionStorage.removeItem("authify_session");

    localStorage.removeItem("authify_session");

}


// ==================================
// ADMIN ACCOUNT STORAGE
// ==================================

function getAdmin() {
    const admin = localStorage.getItem(ADMIN_STORAGE_KEY);
    return admin ? JSON.parse(admin) : null;
}

function saveAdmin(admin) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
}

// ==================================
// ADMIN SESSION MANAGEMENT
// ==================================

function createAdminSession(admin) {
    clearSession();

    const adminSession = {
        userId: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin",
        loginTime: new Date().toISOString()
    };

    sessionStorage.setItem("authify_session", JSON.stringify(adminSession));
}

function isAdminSession() {
    const session = getSession();
    const admin = getAdmin();

    return Boolean(
        session && admin &&
        session.role === "admin" &&
        session.userId === admin.id
    );
}
