const express = require("express");
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
    
    const fullShortUrl = `${process.env.BASE_URL}/${shortCode}`;
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
}).catch(err => console.log(err));