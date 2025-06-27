// Color palettes for different modes
const colorPalettes = {
  dark: [
    "#2C3E50", "#34495E", "#2C2C2C", "#616A6B", "#4A235A", "#2F4F4F", 
    "#0E4B5A", "#36454F", "#2C3E50", "#800020", "#1a1a2e", "#16213e",
    "#0f3460", "#533483", "#2d1b69", "#1b1b2f", "#162447", "#1f4068"
  ],
  bright: [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFE66D", "#DDA0DD",
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471", "#82E0AA",
    "#F1948A", "#85C1E9", "#F7DC6F", "#D7BDE2", "#A9CCE3", "#FAD7A0"
  ],
  pastel: [
    "#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA", "#FFB3F7", "#B3FFB3",
    "#B3D9FF", "#FFE6B3", "#E6B3FF", "#B3F0FF", "#FFB3D9", "#D9FFB3",
    "#B3E6FF", "#FFD9B3", "#F0B3FF", "#B3FFE6", "#FFB3B3", "#B3B3FF"
  ],
  gradient: [
    "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
    "linear-gradient(45deg, #A8E6CF, #DCEDC8)",
    "linear-gradient(45deg, #FFD3B6, #FFAAA5)",
    "linear-gradient(45deg, #D4A5A5, #9B59B6)",
    "linear-gradient(45deg, #3498DB, #2980B9)",
    "linear-gradient(45deg, #E74C3C, #C0392B)",
    "linear-gradient(45deg, #2ECC71, #27AE60)",
    "linear-gradient(45deg, #F1C40F, #F39C12)",
    "linear-gradient(45deg, #9B59B6, #8E44AD)",
    "linear-gradient(45deg, #1ABC9C, #16A085)"
  ]
};

// Predefined color palettes for suggestions
const predefinedPalettes = [
  {
    name: "Sunset",
    colors: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1", "#96CEB4"]
  },
  {
    name: "Ocean",
    colors: ["#1ABC9C", "#16A085", "#3498DB", "#2980B9", "#5DADE2"]
  },
  {
    name: "Forest",
    colors: ["#27AE60", "#2ECC71", "#58D68D", "#82E0AA", "#A9DFBF"]
  },
  {
    name: "Berry",
    colors: ["#8E44AD", "#9B59B6", "#BB8FCE", "#D7BDE2", "#E8DAEF"]
  },
  {
    name: "Fire",
    colors: ["#E74C3C", "#EC7063", "#F1948A", "#F5B7B1", "#FADBD8"]
  },
  {
    name: "Gold",
    colors: ["#F39C12", "#F1C40F", "#F7DC6F", "#F8C471", "#FAD7A0"]
  }
];

// Global variables
let currentColor = "#110815";
let colorHistory = [];
let autoMode = false;
let autoInterval = null;
let animationSpeed = 2;

// DOM elements
const body = document.querySelector("body");
const colorPreview = document.querySelector("#color-preview");
const bgHexCode = document.querySelector("#bg-hex-code");
const colorRgb = document.querySelector("#color-rgb");
const changeBtn = document.querySelector("#change-btn");
const autoBtn = document.querySelector("#auto-btn");
const copyBtn = document.querySelector("#copy-btn");
const colorModeSelect = document.querySelector("#color-mode");
const animationSpeedSlider = document.querySelector("#animation-speed");
const speedValue = document.querySelector("#speed-value");
const colorHistoryGrid = document.querySelector("#color-history");
const paletteGrid = document.querySelector("#palette-grid");
const notification = document.querySelector("#notification");

// Initialize the application
function init() {
  setupEventListeners();
  generateColor();
  updateColorHistory();
  generatePaletteSuggestions();
  updateSpeedValue();
}

// Setup all event listeners
function setupEventListeners() {
  changeBtn.addEventListener("click", generateColor);
  autoBtn.addEventListener("click", toggleAutoMode);
  copyBtn.addEventListener("click", copyColorToClipboard);
  colorModeSelect.addEventListener("change", generateColor);
  animationSpeedSlider.addEventListener("input", updateSpeedValue);
  colorPreview.addEventListener("click", generateColor);
  
  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts);
  
  // Add click listeners to history colors
  colorHistoryGrid.addEventListener("click", handleHistoryClick);
  
  // Add click listeners to palette items
  paletteGrid.addEventListener("click", handlePaletteClick);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
  switch(event.code) {
    case "Space":
      event.preventDefault();
      generateColor();
      break;
    case "KeyG":
      event.preventDefault();
      toggleAutoMode();
      break;
    case "KeyC":
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        copyColorToClipboard();
      }
      break;
  }
}

// Generate a random color based on selected mode
function generateColor() {
  const mode = colorModeSelect.value;
  let newColor;
  
  if (mode === "gradient") {
    newColor = getRandomGradient();
    body.style.background = newColor;
    body.classList.add("gradient-mode");
  } else {
    body.classList.remove("gradient-mode");
    newColor = getRandomColor(mode);
    body.style.background = newColor;
  }
  
  updateColorDisplay(newColor);
  addToHistory(newColor);
  
  // Add animation effect
  addColorChangeAnimation();
}

// Get random color from specified palette
function getRandomColor(mode) {
  const palette = colorPalettes[mode] || colorPalettes.dark;
  const randomIndex = Math.floor(Math.random() * palette.length);
  return palette[randomIndex];
}

// Get random gradient
function getRandomGradient() {
  const gradients = colorPalettes.gradient;
  const randomIndex = Math.floor(Math.random() * gradients.length);
  return gradients[randomIndex];
}

// Update color display elements
function updateColorDisplay(color) {
  currentColor = color;
  
  if (color.startsWith("linear-gradient")) {
    // For gradients, we'll use a fallback color for display
    const fallbackColor = getRandomColor("bright");
    colorPreview.style.background = fallbackColor;
    bgHexCode.textContent = fallbackColor;
    colorRgb.textContent = hexToRgb(fallbackColor);
  } else {
    colorPreview.style.background = color;
    bgHexCode.textContent = color;
    colorRgb.textContent = hexToRgb(color);
  }
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return "rgb(0, 0, 0)";
}

// Add color change animation
function addColorChangeAnimation() {
  body.style.transition = `background ${animationSpeed}s ease-in-out`;
  setTimeout(() => {
    body.style.transition = "var(--transition)";
  }, animationSpeed * 1000);
}

// Toggle auto mode
function toggleAutoMode() {
  autoMode = !autoMode;
  
  if (autoMode) {
    autoBtn.textContent = "🛑 Stop Auto";
    autoBtn.classList.add("auto-active");
    startAutoMode();
    showNotification("Auto mode enabled! Press G to stop.", "success");
  } else {
    autoBtn.textContent = "🔄 Auto Change";
    autoBtn.classList.remove("auto-active");
    stopAutoMode();
    showNotification("Auto mode disabled.", "info");
  }
}

// Start auto mode
function startAutoMode() {
  const interval = (animationSpeed + 1) * 1000;
  autoInterval = setInterval(generateColor, interval);
}

// Stop auto mode
function stopAutoMode() {
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
  }
}

// Update speed value display
function updateSpeedValue() {
  animationSpeed = parseFloat(animationSpeedSlider.value);
  speedValue.textContent = `${animationSpeed}s`;
  
  if (autoMode) {
    stopAutoMode();
    startAutoMode();
  }
}

// Add color to history
function addToHistory(color) {
  if (!colorHistory.includes(color)) {
    colorHistory.unshift(color);
    if (colorHistory.length > 12) {
      colorHistory.pop();
    }
    updateColorHistory();
  }
}

// Update color history display
function updateColorHistory() {
  colorHistoryGrid.innerHTML = "";
  
  colorHistory.forEach(color => {
    const historyColor = document.createElement("div");
    historyColor.className = "history-color";
    historyColor.style.background = color;
    historyColor.setAttribute("data-color", color);
    colorHistoryGrid.appendChild(historyColor);
  });
}

// Handle history color clicks
function handleHistoryClick(event) {
  if (event.target.classList.contains("history-color")) {
    const color = event.target.getAttribute("data-color");
    updateColorDisplay(color);
    body.style.background = color;
    body.classList.remove("gradient-mode");
    addColorChangeAnimation();
    showNotification("Color restored from history!", "success");
  }
}

// Generate palette suggestions
function generatePaletteSuggestions() {
  paletteGrid.innerHTML = "";
  
  predefinedPalettes.forEach(palette => {
    const paletteItem = document.createElement("div");
    paletteItem.className = "palette-item";
    
    const paletteColors = document.createElement("div");
    paletteColors.className = "palette-colors";
    
    palette.colors.forEach(color => {
      const colorDiv = document.createElement("div");
      colorDiv.className = "palette-color";
      colorDiv.style.background = color;
      colorDiv.setAttribute("data-color", color);
      paletteColors.appendChild(colorDiv);
    });
    
    const paletteName = document.createElement("div");
    paletteName.className = "palette-name";
    paletteName.textContent = palette.name;
    
    paletteItem.appendChild(paletteColors);
    paletteItem.appendChild(paletteName);
    paletteGrid.appendChild(paletteItem);
  });
}

// Handle palette item clicks
function handlePaletteClick(event) {
  if (event.target.classList.contains("palette-color")) {
    const color = event.target.getAttribute("data-color");
    updateColorDisplay(color);
    body.style.background = color;
    body.classList.remove("gradient-mode");
    addColorChangeAnimation();
    addToHistory(color);
    showNotification(`Applied ${color} from palette!`, "success");
  }
}

// Copy color to clipboard
async function copyColorToClipboard() {
  try {
    await navigator.clipboard.writeText(currentColor);
    showNotification("Color copied to clipboard!", "success");
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = currentColor;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showNotification("Color copied to clipboard!", "success");
  }
}

// Show notification
function showNotification(message, type = "info") {
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Generate complementary colors
function generateComplementaryColors(baseColor) {
  const colors = [];
  const hsl = hexToHsl(baseColor);
  
  // Add base color
  colors.push(baseColor);
  
  // Add complementary color
  const complementaryHue = (hsl.h + 180) % 360;
  colors.push(hslToHex(complementaryHue, hsl.s, hsl.l));
  
  // Add triadic colors
  const triadic1 = (hsl.h + 120) % 360;
  const triadic2 = (hsl.h + 240) % 360;
  colors.push(hslToHex(triadic1, hsl.s, hsl.l));
  colors.push(hslToHex(triadic2, hsl.s, hsl.l));
  
  return colors;
}

// Convert hex to HSL
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to hex
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;
  
  if (h < 1/6) {
    r = c; g = x; b = 0;
  } else if (h < 2/6) {
    r = x; g = c; b = 0;
  } else if (h < 3/6) {
    r = 0; g = c; b = x;
  } else if (h < 4/6) {
    r = 0; g = x; b = c;
  } else if (h < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
