// app.js
// RailNav — Smart Railway Station Navigation System
// Express + EJS + MVC architecture, session-based auth, MongoDB Atlas.

const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const appRoutes = require("./routes/appRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ---------- View engine ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layout-app"); // default layout for logged-in passenger pages
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// ---------- Core middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // lets <form> submit PUT/DELETE via a hidden ?_method= field
app.use(express.static(path.join(__dirname, "public")));

// ---------- Sessions ----------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "railnav_dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(flash());

// ---------- Locals available to every view ----------
app.use((req, res, next) => {
  res.locals.currentUser = null;
  res.locals.currentAdmin = null;
  res.locals.currentPath = req.path;
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  next();
});

// ---------- Routes ----------
app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", appRoutes);
app.use("/admin", adminRoutes);

// ---------- Error handling ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`RailNav server running on http://localhost:${PORT}`);
  });
});

module.exports = app;
