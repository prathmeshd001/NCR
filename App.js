//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var mysql = require('mysql2');
const session = require("express-session");
const app = express();

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
let io = 1;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Rushi1313",
  database: "ncr"
});

con.connect(function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected!");
  }

});

app.get("/", function(req, res) {
  res.render('signIn');

});

app.post("/", function(req, res) {

  const user = req.body.userid;
  const pass = req.body.password;

  con.query(`select * from logininfo where username = ? and password= ?`, [user, pass], function(err, result, fields) {
    if (err) {
      console.log(err);
    } else if (result.length > 0) {
      req.session.loggedin = true;
      console.log(result);
      req.session.userid = user;
      if (user === 'a') {
        res.redirect('/adminHome');
      } else {
        res.redirect('/user');
      }
    } else {
      res.send('Incorrect Username and/or Password!');
    }
    res.end();

  })

});


app.get("/adminHome", function(req, res) {
  if (req.session.loggedin) {
    res.render('home');
  } else {
    res.send('Please login to view this page!');
  }
  res.end();
});


app.get("/adminHome/createNCR", function(req, res) {
  if (req.session.loggedin) {
    res.render('adminForm');
  } else {
    res.send('Please login to view this page!');
  }
});


app.post("/adminHome/createNCR", function(req, res) {
  if (req.session.loggedin) {
    const year = new Date().getFullYear();
    const date = new Date().toLocaleString();

    const ioNo = 'FCSQANCR' + year + '-' + io;
    //const sEmai = req.body.EmailAddress;
    const sName = req.body.supplierName;
    const category = req.body.category;
    const partName = req.body.partName;
    const pojo = req.body.pojo;
    const challan = req.body.challanNo;
    const rcvdQuantity = req.body.totalRCVD;
    const nQuantity = req.body.NCRquantity;
    //const image = req.body.image;
    console.log("checl");
    let insert = `INSERT INTO adminncr
          (date, ioNo, supplierName, category, partName, pojo, challanNo, totalRCVD, NCRQuantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    con.query(insert, [date, ioNo, sName, category, partName, pojo, challan, rcvdQuantity, nQuantity], function(err, rows) {
      if (err) {
        console.log(err);
      } else {
        console.log("euuuuuuuuuu");
        res.redirect("/adminHome");
      }
    })
    io = io + 1;;
  } else {
    console.log("not authorised");
  }

});

// app.get('/users/:userId/books/:bookId', function (req, res) {
//   res.send(req.params)
// })

app.get("/:user", function(req, res) {

  // if (req.session.loggedin) {
    const requestedSupplier = req.params.user;
    console.log(requestedSupplier);


    con.query(`SELECT iono FROM adminncr WHERE supplierName = ?`,[requestedSupplier], function(err, answer, fields){
      if(err)
      {
        console.log(err);
      }
      else{

        console.log(answer);
       res.render("supplierHome", {answer: answer});
      }
    });
  // } else {
  //   res.send('Please login to view this page!');
  // }
  // res.end();
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server ");
});

