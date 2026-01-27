const fs = require('fs');
const path = require('path');

// 1. Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 2. The "Chain Link" SVG Logo
const logoSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 60">
  <defs>
    <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6C63FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8A84FF;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <g transform="translate(10, 10)">
    <path fill="none" stroke="url(#linkGrad)" stroke-width="6" stroke-linecap="round" 
          d="M15,20 L25,20 C30.5,20 35,15.5 35,10 C35,4.5 30.5,0 25,0 L15,0 C9.5,0 5,4.5 5,10 C5,15.5 9.5,20 15,20 Z" 
          transform="translate(0, 10) rotate(-45 20 10)" />
          
    <path fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" 
          d="M15,20 L25,20 C30.5,20 35,15.5 35,10 C35,4.5 30.5,0 25,0 L15,0 C9.5,0 5,4.5 5,10 C5,15.5 9.5,20 15,20 Z" 
          transform="translate(20, 10) rotate(135 20 10)" />
  </g>

  <text x="75" y="42" font-family="Arial, sans-serif" font-weight="bold" font-size="36" fill="#ffffff" letter-spacing="-1">Link</text>
  <text x="148" y="42" font-family="Arial, sans-serif" font-weight="300" font-size="36" fill="#6C63FF" letter-spacing="-1">Shorty</text>
</svg>
`;

// 3. Save the Logo file
fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSVG.trim());
console.log("🔗 Chain Link Logo Created: public/logo.svg");

// 4. Update Header
const headerPath = path.join(__dirname, 'views', 'partials', 'header.ejs');

const newHeaderContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkShorty</title>
  <link rel="stylesheet" href="/style.css">
  <link rel="icon" type="image/svg+xml" href="/logo.svg">
</head>
<body>
  <nav>
    <a href="/" class="logo">
      <img src="/logo.svg" alt="LinkShorty" style="height: 45px; vertical-align: middle;">
    </a>
    
    <div class="nav-links">
      <% if (locals.user) { %>
        <span style="color:#555; margin-right:15px; font-size:0.9rem;">
          Hi, <b style="color:var(--primary)"><%= locals.username %></b>
          <% if (locals.role === 'admin') { %><span class="admin-badge">ADMIN</span><% } %>
        </span>
        <% if (locals.role === 'admin') { %> <a href="/admin" style="color:var(--danger)">Admin Panel</a> <% } %>
        <a href="/dashboard">Dashboard</a>
        <a href="/logout">Logout</a>
      <% } else { %>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      <% } %>
    </div>
  </nav>`;

fs.writeFileSync(headerPath, newHeaderContent);
console.log("✅ Header Updated!");
console.log("👉 Run: node install_logo.js then npm start");