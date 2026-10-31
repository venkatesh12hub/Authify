
// ==================================
// 1. SELECT HTML ELEMENTS
// ==================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");


// ==================================
// 2. MOBILE NAVIGATION
// ==================================

menuToggle.addEventListener("click", function () {

    navLinks.classList.toggle("show");

    const isOpen = navLinks.classList.contains("show");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';

});


// Close mobile menu after clicking a link

document.querySelectorAll(".nav-links a").forEach(function (link) {

    link.addEventListener("click", function () {

        navLinks.classList.remove("show");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

    });

});


// ==================================
// 3. TOAST NOTIFICATION
// ==================================

let toastTimer;

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {

        toast.classList.remove("show");

    }, 3000);

}


// ==================================
// 4. NAVIGATION BUTTONS
// ==================================

const actionButtons = document.querySelectorAll("[data-action]");

actionButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const action = button.dataset.action;

        
switch (action) {

    case "register":
        window.location.href = "pages/register.html";
        break;

    case "login":
        window.location.href = "pages/login.html";
        break;

    case "admin":
        window.location.href = "pages/admin-login.html";
        break;

    default:
        showToast("Invalid action.");

}


    });

});


// ==================================
// 5. NAVBAR ACTIVE LINK
// ==================================

const sections = document.querySelectorAll("main section");

const navigationLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", function () {

    let currentSection = "home";

    sections.forEach(function (section) {

        const sectionTop = section.offsetTop - 120;

        if (window.scrollY >= sectionTop) {

            currentSection = section.id;

        }

    });

    navigationLinks.forEach(function (link) {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + currentSection) {

            link.classList.add("active");

        }

    });

});
