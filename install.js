const fs = require('fs');
const path = require('path');

const files = {
  // Package Configuration
  'package.json': JSON.stringify({
    "name": "url-shortener-pro",
    "version": "3.7.0",
    "description": "Premium URL Shortener (Dark Glassmorphism)",
    "main": "server.js",
    "scripts": { "start": "node server.js" },
    "dependencies": {
      "bcryptjs": "^2.4.3",
      "connect-mongo": "^5.1.0",
      "dotenv": "^16.3.1",
      "ejs": "^3.1.9",
      "express": "^4.18.2",
      "express-session": "^1.17.3",
      "mongoose": "^7.6.3",
      "qrcode": "^1.5.4",
      "shortid": "^2.2.16"
    }
  }, null, 2),

  // Environment Variables
  '.env': `PORT=3000\nMONGO_URI=mongodb://127.0.0.1:27017/urlshortener\nBASE_URL=http://localhost:3000\nSESSION_SECRET=supersecretkey\nADMIN_SECRET=admin123`,

  // --- MODELS ---
  'models/User.js': `const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);`,

  'models/Url.js': `const mongoose = require("mongoose");
const urlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  qrCode: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Url", urlSchema);`,

  // --- CSS (PREMIUM DARK GLASSMORPHISM) ---
  'public/style.css': `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');

:root {
  --primary: #6C63FF; 
  --danger: #ff4757;
  --bg: #1F2029;
  --card: #2B2E38;
  --text: #ffffff;
  --border: #3d4050;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%);
}

/* Navbar */
nav {
  width: 100%;
  padding: 20px 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  box-sizing: border-box;
}
.logo { font-size: 1.5rem; font-weight: bold; color: var(--primary); text-decoration: none; letter-spacing: 1px; }
.nav-links a { color: #ccc; text-decoration: none; margin-left: 20px; transition: 0.3s; font-size: 0.9rem; }
.nav-links a:hover { color: white; }
.admin-badge { background: var(--danger); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; margin-left: 5px; vertical-align: middle; }

/* Standard Container */
.container {
  width: 90%;
  max-width: 500px;
  margin-top: 40px;
  background: rgba(255, 255, 255, 0.05);
  padding: 40px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
}

/* Compact Container for Dashboard */
.container-small {
  padding: 25px;
  max-width: 600px;
  margin-top: 30px;
}

h1, h2 { margin-bottom: 10px; color: #fff; font-weight: 600; }
p { color: #aaa; margin-bottom: 25px; }

/* Inputs & Buttons */
input { width: 100%; padding: 14px; margin-bottom: 15px; background: rgba(0,0,0,0.3); border: 1px solid #444; border-radius: 8px; color: white; outline: none; box-sizing: border-box; font-size: 1rem; }
input:focus { border-color: var(--primary); }
button { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s; font-size: 1rem; }
button:hover { background: #5a52d5; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(108, 99, 255, 0.3); }

/* Table Styles */
.table-wrapper {
  width: 95%;
  max-width: 1200px;
  margin-top: 30px;
  background: var(--card);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow-x: auto;
  margin-bottom: 40px;
}

.section-title {
  width: 95%; max-width: 1200px; margin-top: 40px; margin-bottom: 10px;
  text-align: left; font-size: 1rem; color: #aaa; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
}

table { width: 100%; border-collapse: separate; border-spacing: 0; }
th { text-align: left; padding: 15px; color: #ccc; font-size: 0.8rem; text-transform: uppercase; font-weight: 600; border-bottom: 1px solid var(--border); }
td { padding: 15px; border-bottom: 1px solid #333; vertical-align: middle; font-size: 0.9rem; color: #eee; }
tr:last-child td { border-bottom: none; }

.col-short { color: var(--primary); font-weight: 500; white-space: nowrap; }
.col-target { word-break: break-all; min-width: 250px; color: #fff; }
.col-owner { color: #ddd; white-space: nowrap; }
.col-center { text-align: center; white-space: nowrap; }

a { text-decoration: none; color: inherit; }
.col-short a { color: var(--primary); }
.col-short a:hover { text-decoration: underline; }

.qr-mini { width: 35px; height: 35px; border-radius: 4px; background: #fff; padding: 2px; cursor: pointer; transition: transform 0.2s; }
.qr-mini:hover { transform: scale(3); z-index: 100; position: relative; box-shadow: 0 0 15px rgba(0,0,0,0.5); }

.btn-delete { background: var(--danger); color: white; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: 500; display: inline-block; transition: 0.2s; }
.btn-delete:hover { background: #d63031; }

.modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); }
.modal-content { margin: 10% auto; display: block; width: 300px; border-radius: 10px; animation: zoom 0.3s; }
.close { position: absolute; top: 20px; right: 40px; color: #fff; font-size: 40px; cursor: pointer; }
@keyframes zoom { from {transform:scale(0)} to {transform:scale(1)} }

/* Success Box */
.success-box {
  margin-top: 15px;
  padding: 15px;
  background: rgba(108, 99, 255, 0.1);
  border: 1px solid var(--primary);
  border-radius: 8px;
  animation: fadeIn 0.5s;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
`,

  // --- ADMIN VIEW ---
  'views/admin.ejs': `<%- include('partials/header') %>
  
  <div class="section-title">All Shortened Links</div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th style="width: 20%;">Short Link</th>
          <th style="width: 35%;">Target URL</th>
          <th style="width: 15%;">Owner</th>
          <th style="width: 10%;" class="col-center">Clicks</th>
          <th style="width: 10%;" class="col-center">QR</th>
          <th style="width: 10%;" class="col-center">Action</th>
        </tr>
      </thead>
      <tbody>
        <% urls.forEach(url => { %>
          <tr>
            <td class="col-short"><a href="<%= baseUrl %>/<%= url.shortCode %>" target="_blank"><%= baseUrl %>/<%= url.shortCode %></a></td>
            <td class="col-target"><%= url.longUrl %></td>
            <td class="col-owner"><%= url.user ? url.user.username : 'Guest' %></td>
            <td class="col-center"><%= url.clicks %></td>
            <td class="col-center"><img src="<%= url.qrCode %>" class="qr-mini" onclick="openQR(this.src)"></td>
            <td class="col-center"><a href="/admin/delete/url/<%= url._id %>" class="btn-delete" onclick="return confirm('Delete this link?')">Delete</a></td>
          </tr>
        <% }) %>
      </tbody>
    </table>
  </div>

  <div class="section-title">Registered Users</div>
  <div class="table-wrapper">
    <table>
      <thead><tr><th>Username</th><th>Role</th><th class="col-center">Action</th></tr></thead>
      <tbody>
        <% users.forEach(u => { %>
          <tr>
            <td style="color:white;"><%= u.username %></td>
            <td style="color:#aaa;"><%= u.role %></td>
            <td class="col-center">
              <% if(u.role !== 'admin') { %>
                <a href="/admin/delete/user/<%= u._id %>" class="btn-delete">Remove User</a>
              <% } else { %>
                <span style="color:#555;">Super Admin</span>
              <% } %>
            </td>
          </tr>
        <% }) %>
      </tbody>
    </table>
  </div>
  <%- include('partials/footer') %>`,

  // --- VIEWS ---
  'views/partials/header.ejs': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkShorty</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <nav>
    <a href="/" class="logo">LinkShorty</a>
    <div class="nav-links">
      <% if (locals.user) { %>
        <span style="color:#fff; margin-right:15px; font-size:0.9rem;">
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
  </nav>`,

  'views/partials/footer.ejs': `
  <div id="qrModal" class="modal">
    <span class="close" onclick="document.getElementById('qrModal').style.display='none'">&times;</span>
    <img class="modal-content" id="img01">
  </div>
  <script>
    var modal = document.getElementById("qrModal");
    var modalImg = document.getElementById("img01");
    function openQR(src) { modal.style.display = "block"; modalImg.src = src; }
    window.onclick = function(event) { if (event.target == modal) { modal.style.display = "none"; } }
  </script>
</body>
</html>`,

  'views/index.ejs': `<%- include('partials/header') %>
  <div class="container">
    <h1>Shorten Your Link</h1>
    <p>Paste long URL to get short link & QR.</p>
    <% if (locals.error) { %> <div style="color:#ff6b6b; margin-bottom:15px;"><%= error %></div> <% } %>
    <form action="/shorten" method="POST">
      <input type="url" name="longUrl" placeholder="Paste URL here..." required>
      <input type="text" name="customCode" placeholder="Alias (Optional)">
      <button type="submit">Shorten Now</button>
    </form>
    <% if (locals.shortUrl) { %>
      <div style="margin-top:20px; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px;">
        <p style="color:#fff; margin-bottom:5px;">Success! Your Link:</p>
        <a href="<%= shortUrl %>" target="_blank" style="color:var(--primary); font-size:1.1rem;"><%= shortUrl %></a><br><br>
        <img src="<%= qrCode %>" width="120" style="border-radius:8px;">
      </div>
    <% } %>
  </div>
  <%- include('partials/footer') %>`,

  'views/login.ejs': `<%- include('partials/header') %>
  <div class="container">
    <h1>Login</h1>
    <% if (error) { %> <div style="color:#ff6b6b; margin-bottom:10px;"><%= error %></div> <% } %>
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    <p style="margin-top:15px;">New? <a href="/register" style="color:var(--primary)">Register</a></p>
  </div>
  <%- include('partials/footer') %>`,

  'views/register.ejs': `<%- include('partials/header') %>
  <div class="container">
    <h1>Create Account</h1>
    <% if (error) { %> <div style="color:#ff6b6b; margin-bottom:10px;"><%= error %></div> <% } %>
    <form action="/register" method="POST">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <input type="password" name="adminSecret" placeholder="Admin Key (Optional)">
      <button type="submit">Sign Up</button>
    </form>
    <p style="margin-top:15px;">Joined? <a href="/login" style="color:var(--primary)">Login</a></p>
  </div>
  <%- include('partials/footer') %>`,

  // --- DASHBOARD (Compact Form + Table) ---
  'views/dashboard.ejs': `<%- include('partials/header') %>
  
  <div class="container container-small">
    <h2>Shorten Your Link</h2>
    <p style="margin-bottom: 15px;">Paste your URL below.</p>
    
    <% if (locals.error) { %> <div style="color:#ff6b6b; margin-bottom:15px;"><%= error %></div> <% } %>

    <form action="/shorten" method="POST">
      <input type="url" name="longUrl" placeholder="Paste URL here..." required>
      <input type="text" name="customCode" placeholder="Custom Alias (Optional)">
      <button type="submit">Shorten Now</button>
    </form>

    <% if (locals.shortUrl) { %>
      <div class="success-box">
        <p style="color:#fff; margin-bottom:5px;"><b>Success! Link Created:</b></p>
        <a href="<%= shortUrl %>" target="_blank" style="color:var(--primary); font-size:1.1rem; word-break:break-all;"><%= shortUrl %></a><br><br>
        <img src="<%= qrCode %>" width="100" style="border-radius:4px;">
      </div>
    <% } %>
  </div>

  <div class="section-title">Your Shortened Links</div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th style="width: 25%;">Short Link</th>
          <th style="width: 40%;">Original URL</th>
          <th class="col-center" style="width: 10%;">Clicks</th>
          <th class="col-center" style="width: 10%;">QR</th>
          <th class="col-center" style="width: 15%;">Action</th>
        </tr>
      </thead>
      <tbody>
        <% if(urls.length === 0) { %> <tr><td colspan="5" class="col-center" style="padding:30px; color:#666;">No links created yet.</td></tr> <% } %>
        <% urls.forEach(url => { %>
          <tr>
            <td class="col-short"><a href="<%= baseUrl %>/<%= url.shortCode %>" target="_blank"><%= baseUrl %>/<%= url.shortCode %></a></td>
            <td class="col-target"><%= url.longUrl %></td>
            <td class="col-center"><%= url.clicks %></td>
            <td class="col-center"><img src="<%= url.qrCode %>" class="qr-mini" onclick="openQR(this.src)"></td>
            <td class="col-center">
              <a href="/delete/<%= url._id %>" class="btn-delete" onclick="return confirm('Delete this link?')">Delete</a>
            </td>
          </tr>
        <% }) %>
      </tbody>
    </table>
  </div>
  <%- include('partials/footer') %>`,

  // --- SERVER ---
  'server.js': `const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const QRCode = require("qrcode");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();
const Url = require("./models/Url");
const User = require("./models/User");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}));

app.use((req, res, next) => {
  res.locals.user = req.session.userId;
  res.locals.username = req.session.username;
  res.locals.role = req.session.role;
  next();
});

const isAdmin = (req, res, next) => {
  if (req.session.role === 'admin') return next();
  res.status(403).send("Admins Only");
};

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect("/login");
};

app.get("/", (req, res) => res.render("index", { error: null }));
app.get("/login", (req, res) => res.render("login", { error: null }));
app.get("/register", (req, res) => res.render("register", { error: null }));

app.post("/register", async (req, res) => {
  const { username, password, adminSecret } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = (adminSecret === process.env.ADMIN_SECRET) ? 'admin' : 'user';
    await User.create({ username, password: hashedPassword, role });
    res.redirect("/login");
  } catch (err) { res.render("register", { error: "Username taken!" }); }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.redirect("/dashboard");
  } else { res.render("login", { error: "Invalid credentials" }); }
});

app.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/")));

app.get("/dashboard", isAuthenticated, async (req, res) => {
  const urls = await Url.find({ user: req.session.userId }).sort({ createdAt: -1 });
  res.render("dashboard", { urls, baseUrl: process.env.BASE_URL });
});

app.get("/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (url && url.user.toString() === req.session.userId) {
      await Url.findByIdAndDelete(req.params.id);
    }
  } catch (err) { console.log(err); }
  res.redirect("/dashboard");
});

app.get("/admin", isAuthenticated, isAdmin, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const urls = await Url.find().populate('user').sort({ createdAt: -1 });
  res.render("admin", { users, urls, baseUrl: process.env.BASE_URL });
});

app.get("/admin/delete/user/:id", isAuthenticated, isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Url.deleteMany({ user: req.params.id });
  res.redirect("/admin");
});

app.get("/admin/delete/url/:id", isAuthenticated, isAdmin, async (req, res) => {
  await Url.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

app.post("/shorten", async (req, res) => {
  const { longUrl, customCode } = req.body;
  const shortCode = customCode || shortid.generate();
  try {
    const existing = await Url.findOne({ shortCode });
    if (existing) {
       if(req.session.userId) {
         const urls = await Url.find({ user: req.session.userId }).sort({ createdAt: -1 });
         return res.render("dashboard", { urls, baseUrl: process.env.BASE_URL, error: "Alias taken", shortUrl: null });
       }
       return res.render("index", { error: "Alias taken", shortUrl: null });
    }
    
    const fullShortUrl = \`\${process.env.BASE_URL}/\${shortCode}\`;
    const qrImage = await QRCode.toDataURL(fullShortUrl);
    
    await Url.create({ longUrl, shortCode, qrCode: qrImage, user: req.session.userId || null });
    
    if (req.session.userId) { 
      const urls = await Url.find({ user: req.session.userId }).sort({ createdAt: -1 });
      res.render("dashboard", { 
        urls, 
        baseUrl: process.env.BASE_URL,
        shortUrl: fullShortUrl, 
        qrCode: qrImage,        
        error: null
      }); 
    } else { 
      res.render("index", { error: null, shortUrl: fullShortUrl, qrCode: qrImage }); 
    }
  } catch (err) { 
    if(req.session.userId) res.redirect("/dashboard");
    else res.render("index", { error: "Error", shortUrl: null }); 
  }
});

app.get("/:code", async (req, res) => {
  const url = await Url.findOne({ shortCode: req.params.code });
  if (!url) return res.status(404).send("Not Found");
  url.clicks++; await url.save();
  res.redirect(url.longUrl);
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT, () => console.log("Server running on 3000"));
}).catch(err => console.log(err));`
};

Object.keys(files).forEach(fileName => {
  const filePath = path.join(__dirname, fileName);
  const dirName = path.dirname(filePath);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
  fs.writeFileSync(filePath, files[fileName]);

});
console.log("\nSetup Complete! Run: node install.js");