const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const fs= require('fs');
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const request = require('request');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://itechpanda-default-rtdb.firebaseio.com",
});

const csrfMiddleware = csrf({ cookie: true });

const PORT = process.env.PORT || 5000;
const app = express();

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.get("/login", function (req, res) {
  res.render("login.html");
});

app.get("/signup", function (req, res) {
  res.render("signup.html");
});

app.get("/profile", function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.render("profile.html");
    })
    .catch((error) => {
      res.redirect("/login");
    });
});

app.get("/", function (req, res) {

request({
  url:'https://script.google.com/macros/s/AKfycbz224XPAfDneZPbMWjzc-Bjt3L-Qj-InRE0EGOVCjGeYa_X5XNT/exec',
  json:true
},(err,response,body)=>{
  console.log(body)
  fs.writeFile('./static/postData.json',JSON.stringify(body),err=>{
    if(err){
      console.log(err);
    }else{
      console.log('filesaved...!');
    }
  })

});




  res.render("index.html");
});

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

app.get('/apps', function (req, res) {
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then(() => {
      res.render("apps.html");
    })
    .catch((error) => {
      res.redirect("/login");
    });
});



function loadJson(filename = '') {

  return JSON.parse(
      fs.existsSync(filename)
          ? fs.readFileSync(filename).toString()
          : '""'
  )
}