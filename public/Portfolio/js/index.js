// return an alert if Samsung browser calls for the first time.
if (window.navigator.userAgent.indexOf("SamsungBrowser") !== -1 && !getPreferredLanguage()) {
  alert('To enable website theme colors, navigate to Settings -> Labs -> and toggle "Use website dark theme" to On.')
}


// Funktion zum Setzen der bevorzugten Sprache im Local Storage
function setPreferredLanguage(language) {
    localStorage.setItem('preferredLanguage', language);
}
  
// Funktion zum Abrufen der bevorzugten Sprache aus dem Local Storage
function getPreferredLanguage() {
    return localStorage.getItem('preferredLanguage');
}

if (!getPreferredLanguage()) toggleLanguage("en");
  
// Funktion zum Ändern der Sprache durch Klick auf den Button
document.getElementById("language-button-de").addEventListener("click", () => {toggleLanguage("de")});
document.getElementById("language-button-en").addEventListener("click", () => {toggleLanguage("en")});
document.getElementById("language-button-de-1").addEventListener("click", () => {toggleLanguage("de")});
document.getElementById("language-button-en-1").addEventListener("click", () => {toggleLanguage("en")});
async function toggleLanguage(language) {
    console.log("hi");
    setPreferredLanguage(language);

    await fetch('/setlanguage', { 
        method: 'POST', 
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({language})
    });

    location.reload();
}


/*==================== MENU SHOW Y HIDDEN ====================*/
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
document.getElementById("main").addEventListener("click", () => {hideNavMenu()});
if (navClose) {navClose.addEventListener("click", () => {hideNavMenu()});}

function hideNavMenu() {
  navMenu.classList.remove("show-menu");
}

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll(".nav__link");

function linkAction() {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*==================== ACCORDION SKILLS ====================*/
const skillsContent = document.getElementsByClassName("skills__content"),
  skillsHeader = document.querySelectorAll(".skills__header");

function toggleSkills() {
  let itemClass = this.parentNode.className;

  for (i = 0; i < skillsContent.length; i++) {
    skillsContent[i].className = "skills__content skills__close";
  }
  if (itemClass === "skills__content skills__close") {
    this.parentNode.className = "skills__content skills__open";
  }
}

skillsHeader.forEach((el) => {
  el.addEventListener("click", toggleSkills);
});

/*==================== PORTFOLIO SWIPER  ====================*/
let swiperPortfolio = new Swiper(".portfolio__container", {
  cssMode: true,
  loop: true,

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  mousewheel: true,
  keyboard: true
});

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
// const sections = document.querySelectorAll("section[id]");

// function scrollActive() {
//   const scrollY = window.pageYOffset;

//   sections.forEach((current) => {
//     const sectionHeight = current.offsetHeight;
//     const sectionTop = current.offsetTop - 50;
//     sectionId = current.getAttribute("id");

//     if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
//       document
//         .querySelector(".nav__menu a[href*=" + sectionId + "]")
//         .classList.add("active-link");
//     } else {
//       document
//         .querySelector(".nav__menu a[href*=" + sectionId + "]")
//         .classList.remove("active-link");
//     }
//   });
// }
// window.addEventListener("scroll", scrollActive);

/*==================== CHANGE BACKGROUND HEADER ====================*/
function scrollHeader() {
  const nav = document.getElementById("header");
  // When the scroll is greater than 200 viewport height, add the scroll-header class to the header tag
  if (this.scrollY >= 80) nav.classList.add("scroll-header");
  else nav.classList.remove("scroll-header");
}
window.addEventListener("scroll", scrollHeader);


/*==================== DARK LIGHT THEME ====================*/
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "uil-moon";

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton.classList.contains(iconTheme) ? "uil-moon" : "uil-sun";

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  themeButton.classList[selectedIcon === "uil-moon" ? "add" : "remove"](
    iconTheme
  );
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  // Add or remove the dark / icon theme
  document.body.classList.toggle(darkTheme);
  if (getCurrentIcon() === iconTheme) {
    themeButton.classList.remove(iconTheme);
    themeButton.classList.add("uil-sun");
  } else {
    themeButton.classList.remove("uil-sun");
    themeButton.classList.add(iconTheme);
  }
  // themeButton.classList.toggle(iconTheme);
  // We save the theme and the current icon that the user chose
  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});

/*==================== COOKIES ====================*/
