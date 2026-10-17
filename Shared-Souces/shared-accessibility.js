(function () {
var menuToggleButton = document.getElementById("accessibility-menu-toggle");
var accessibilityPanel = document.getElementById("accessibility-panel");
var contrastToggleButton = document.getElementById("contrast-toggle");
var largeTextToggleButton = document.getElementById("large-text-toggle");
var dyslexiaToggleButton = document.getElementById("dyslexia-toggle");
if (!menuToggleButton || !accessibilityPanel || !contrastToggleButton || !largeTextToggleButton || !dyslexiaToggleButton)
{
return;
}

var contrastStorageKey = "contrastMode";
var largeTextStorageKey = "largeTextMode";
var dyslexiaStorageKey = "dyslexiaMode";

function getButtonLabel(button, type, fallback)
{
if (type === "enable" && button.hasAttribute("data-label-enable"))
{
return button.getAttribute("data-label-enable");
}
if (type === "disable" && button.hasAttribute("data-label-disable"))
{
return button.getAttribute("data-label-disable");
}
return fallback;
}

function setHighContrast(enabled)
{
document.body.classList.toggle("high-contrast", enabled);
contrastToggleButton.setAttribute("aria-pressed", enabled ? "true" : "false");
contrastToggleButton.textContent = enabled
? getButtonLabel(contrastToggleButton, "disable", "Disable high contrast")
: getButtonLabel(contrastToggleButton, "enable", "Enable high contrast");
}

function setLargeText(enabled)
{
document.body.classList.toggle("large-text", enabled);
largeTextToggleButton.setAttribute("aria-pressed", enabled ? "true" : "false");
largeTextToggleButton.textContent = enabled
? getButtonLabel(largeTextToggleButton, "disable", "Disable larger text")
: getButtonLabel(largeTextToggleButton, "enable", "Enable larger text");
}

function setDyslexiaFriendlyText(enabled)
{
document.body.classList.toggle("dyslexia-friendly", enabled);
dyslexiaToggleButton.setAttribute("aria-pressed", enabled ? "true" : "false");
dyslexiaToggleButton.textContent = enabled
? getButtonLabel(dyslexiaToggleButton, "disable", "Disable dyslexia friendly text")
: getButtonLabel(dyslexiaToggleButton, "enable", "Enable dyslexia friendly text");
}

var savedContrastChoice = localStorage.getItem(contrastStorageKey);
var savedLargeTextChoice = localStorage.getItem(largeTextStorageKey);
var savedDyslexiaChoice = localStorage.getItem(dyslexiaStorageKey);
setHighContrast(savedContrastChoice === "high");
setLargeText(savedLargeTextChoice === "large");
setDyslexiaFriendlyText(savedDyslexiaChoice === "enabled");

menuToggleButton.addEventListener("click", function () {
var isOpen = !accessibilityPanel.hasAttribute("hidden");
if (isOpen)
{
accessibilityPanel.setAttribute("hidden", "");
menuToggleButton.setAttribute("aria-expanded", "false");
}
else
{
accessibilityPanel.removeAttribute("hidden");
menuToggleButton.setAttribute("aria-expanded", "true");
}
});

contrastToggleButton.addEventListener("click", function () {
var nowEnabled = !document.body.classList.contains("high-contrast");
setHighContrast(nowEnabled);
localStorage.setItem(contrastStorageKey, nowEnabled ? "high" : "normal");
});

largeTextToggleButton.addEventListener("click", function () {
var nowEnabled = !document.body.classList.contains("large-text");
setLargeText(nowEnabled);
localStorage.setItem(largeTextStorageKey, nowEnabled ? "large" : "normal");
});

dyslexiaToggleButton.addEventListener("click", function () {
var nowEnabled = !document.body.classList.contains("dyslexia-friendly");
setDyslexiaFriendlyText(nowEnabled);
localStorage.setItem(dyslexiaStorageKey, nowEnabled ? "enabled" : "disabled");
});
})();
