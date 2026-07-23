"use strict";

const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const backToTop = document.getElementById("backToTop");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const toast = document.getElementById("toast");

function setMenu(open) {
  mainNav.classList.toggle("open", open);
  menuToggle.classList.toggle("active", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
}

menuToggle.addEventListener("click", () => setMenu(!mainNav.classList.contains("open")));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

function handleScroll() {
  header.classList.toggle("scrolled", window.scrollY > 20);
  backToTop.classList.toggle("visible", window.scrollY > 650);

  let currentId = "home";
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 180) currentId = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
  });
}

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -35px" });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const wasOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("open");
      faq.querySelector(".faq-question").setAttribute("aria-expanded", "false");
    });

    if (!wasOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

function showToast(message) {
  toast.querySelector("span").textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3800);
}

document.getElementById("quickForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const application = document.getElementById("applicationForm");
  application.elements.fullName.value = data.get("name");
  application.elements.phone.value = data.get("phone");
  application.elements.city.value = data.get("city");
  document.getElementById("apply").scrollIntoView({ behavior: "smooth" });
  showToast("Great start — complete the remaining details to submit.");
});

const applicationForm = document.getElementById("applicationForm");
const successMessage = document.getElementById("formSuccess");

function fieldMessage(input) {
  if (input.validity.valueMissing) return "This field is required.";
  if (input.validity.typeMismatch) return "Enter a valid email address.";
  if (input.validity.patternMismatch) return "Enter a valid phone number.";
  return "Please check this field.";
}

function validateField(input) {
  const field = input.closest(".field");
  if (!field) return input.validity.valid;
  const error = field.querySelector(".field-error");
  const valid = input.validity.valid;
  field.classList.toggle("invalid", !valid);
  error.textContent = valid ? "" : fieldMessage(input);
  return valid;
}

applicationForm.querySelectorAll("input, select, textarea").forEach((input) => {
  input.addEventListener("blur", () => validateField(input));
  input.addEventListener("input", () => {
    if (input.closest(".field")?.classList.contains("invalid")) validateField(input);
  });
});

applicationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const requiredFields = [...applicationForm.querySelectorAll("[required]")];
  const allValid = requiredFields.map(validateField).every(Boolean);

  if (!allValid || !applicationForm.checkValidity()) {
    applicationForm.querySelector(":invalid")?.focus();
    showToast("Please complete all required fields.");
    return;
  }

  // Integration point: send FormData to Web3Forms, Formspree, PHP or your CRM endpoint here.
  // Example: fetch("YOUR_FORM_ENDPOINT", { method: "POST", body: new FormData(applicationForm) });
  successMessage.classList.add("show");
  applicationForm.reset();
  applicationForm.querySelectorAll(".field").forEach((field) => field.classList.remove("invalid"));
  applicationForm.querySelectorAll(".field-error").forEach((error) => { error.textContent = ""; });
  successMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("year").textContent = new Date().getFullYear();
