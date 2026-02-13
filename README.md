# csr_auto


fetch('https://raw.githubusercontent.com/jun7867/csr_auto/main/GEMINI.js?t=' + new Date().getTime())
  .then(v => v.text())
  .then(eval);