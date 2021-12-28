//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var mysql = require('mysql2');
const session = require("express-session");
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const flash = require('connect-flash');
const toastr = require('express-toastr');
require('events').EventEmitter.defaultMaxListeners = 15;
const app = express();
app.use(toastr());
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/data/uploads/');
  },

  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
});



app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
// let io = 1;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
//app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Rushi1313",
  database: "ncr"
  // queueLimit: 0,
  // connectionLimit: 0
});

con.connect(function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected!");
  }

});

var io;

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
      //  console.log(result);
      req.session.user_id = user;
      //console.log(req.session.user_id);
      if (user === 'a') {
      //  req.toastr.success('Successfully logged in.', "You're in!");
        res.redirect('/adminHome');
      } else {
        res.redirect('/supplier/pending/' + user);
      }
    } else {
      res.send('Incorrect Username and/or Password!');
    }
    res.end();

  })

});

var array2 = [];
app.get("/adminHome", function(req, res) {
  if (req.session.loggedin) {
    var query = "SELECT ioNo,supplierName,date from adminncr where isfilled = ? and isaprooved = ? and isrejected=?";
    con.query(query, [true, false,false], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        array2 = result;
        const len = result.length;
        console.log(len);
        console.log(result);
        console.log(typeof(array2));
        res.render('home', {
          array2: array2,
          len: len
        });
      }
      res.end();
    });

  } else {
    res.send('Please login to view this page!');
  }
  // res.end();
});


app.get("/adminHome/createNCR", function(req, res) {
  if (req.session.loggedin) {
    res.render('adminForm');
  } else {
    res.send('Please login to view this page!');
  }
});




app.post("/adminHome/createNCR", upload.array('uploaded_file'), function(req, res) {
  if (req.session.loggedin) {

    let query = "SELECT MAX(identity) AS max_srno FROM adminncr";
    con.query(query, function(err, ans) {
      if (err) {
        console.log(err);
      } else {
        if (ans[0].max_srno == null) {
          id = 1;
          const year = new Date().getFullYear();
          var ioNo = 'FCSQANCR' + year + '-' + id;
          const date = new Date().toLocaleString();
          let supplierEmail = req.body.supplierEmail;
          const sName = req.body.supplierName;
          const category = req.body.category;
          const partName = req.body.partName;
          const pojo = req.body.pojo;
          const challan = req.body.challanNo;
          const rcvdQuantity = req.body.totalRCVD;
          const nQuantity = req.body.NCRquantity;
          //const image = req.body.image;
          const status = "Open";
          const fpath = req.files[0].path;
          JSON.stringify(fpath);
          var imagepath = fpath.slice(6);
          var productDescription = req.body.productDescription;
          var productName = req.body.productName;
          var descriptionncr = req.body.descriptionncr;
          var partNumber = req.body.partNumber;

          const file = req.files;
          let insert = `INSERT INTO adminncr
                (date, ioNo, supplierName, category, partName, pojo, challanNo, totalRCVD, NCRQuantity,status, isFilled, isaprooved , productName , productdescription , descriptionncr , partNumber,  isrejected, image) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?,?,?,?);`;
          con.query(insert, [date, ioNo, sName, category, partName, pojo, challan, rcvdQuantity, nQuantity, status, false, false, productName, productDescription , descriptionncr, partNumber , false, imagepath], function(err, rows) {
            if (err) {
              console.log(err);
            } else {
              let supQuery = "insert into supplierncr (iono) VALUES(?);";
              con.query(supQuery, [ioNo], function(err, answ){
                if(err){
                  console.log(err);
                }
                else{
                  res.redirect("/adminHome");
                }
              });
            }
          })

        } else {

          id = ans[0].max_srno + 1;
          console.log(id);
          const year = new Date().getFullYear();
          var ioNo = 'FCSQANCR' + year + '-' + id;
          console.log(ioNo);

          const date = new Date().toLocaleString();
          let supplierEmail = req.body.supplierEmail;

          //console.log(id);


          //  const sEmai = req.body.EmailAddress;
          const sName = req.body.supplierName;
          const category = req.body.category;
          const partName = req.body.partName;
          const pojo = req.body.pojo;
          const challan = req.body.challanNo;
          const rcvdQuantity = req.body.totalRCVD;
          const nQuantity = req.body.NCRquantity;
          //const image = req.body.image;
          const status = "Open";
          const fpath = req.files[0].path;
          JSON.stringify(fpath);
          var imagepath = fpath.slice(6);
          console.log(imagepath);
          var productDescription = req.body.productDescription;
          var productName = req.body.productName;
          var descriptionncr = req.body.descriptionncr;
          var partNumber = req.body.partNumber;

          const file = req.files;
          let insert = `INSERT INTO adminncr
                (date, ioNo, supplierName, category, partName, pojo, challanNo, totalRCVD, NCRQuantity,status, isFilled, isaprooved , productName , productdescription , descriptionncr , partNumber,  isrejected, image) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?,?,?,?);`;
          con.query(insert, [date, ioNo, sName, category, partName, pojo, challan, rcvdQuantity, nQuantity, status, false, false, productName, productDescription , descriptionncr, partNumber , false, imagepath], function(err, rows) {
            if (err) {
              console.log(err);
            } else {
              //  console.log("euuuuuuuuuu");
              let suppQuery = "insert into supplierncr (iono) VALUES(?);";
              con.query(suppQuery, [ioNo], function(err, ans){
                if(err){
                  console.log(err);
                }
                else{
                  res.redirect("/adminHome");
                }
              });

            }
          })
          // io = io + 1;;
        }

        let sEmail = req.body.supplierEmail;
        let mailOptions = {
          from: 'dummyfluid71@gmail.com',
          to: ` ${sEmail}`,
          subject: 'Pending NCR',
          text: 'you need to fill your NCR form asap'
        };

        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'dummyfluid71@gmail.com',
            pass: 'Rushi@1313'
          }
        });


        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

      }
    });
  } else {
    console.log("not authorised");
  }

});



app.get("/supplier/pending/:user", function(req, res) {
  //console.log(req.params.user);
  if (req.session.loggedin) {

    const requestedSupplier = req.params.user;
    //console.log(requestedSupplier);
    if (req.session.user_id === requestedSupplier) {
      const insert = `SELECT iono FROM adminncr WHERE supplierName = ? and isfilled= ?`;
      con.query(insert, [requestedSupplier, false], function(err, answer, fields) {
        if (err) {
          console.log(err);
        } else {
          //console.log(answer);
          res.render("supplierHome", {
            answer: answer,
            requestedSupplier: requestedSupplier
          });
        }
        res.end();
      });
    } else {
      res.send('Please login to view this page!');
    }
  } else {
    res.send('Please login to view this page!');
  }
});
app.get("/reject/:user", function(req, res) {
  //console.log(req.params.user);
  if (req.session.loggedin) {

    const requestedSupplier = req.params.user;

    console.log(requestedSupplier);
    if (req.session.user_id === requestedSupplier) {
      const insert = `SELECT iono FROM adminncr WHERE supplierName = ? and isfilled= ? and isrejected = ?`;
      con.query(insert, [requestedSupplier, true,true], function(err, answer, fields) {
        if (err) {
          console.log(err);
        } else {
          //console.log(answer);
          res.render("supplierreject", {
            answer: answer,
            requestedSupplier: requestedSupplier
          });
        }
        res.end();
      });
    } else {
      res.send('Please login to view this page!');
    }
  } else {
    res.send('Please login to view this page!');
  }
});

var array = [];
var count = 0;


app.get("/supplier/pending/:user/:iono", function(req, res) {
  let temp = req.session.user_id;
  console.log(temp);
  console.log("euuuuuuuuu");
  const dynamicIono = req.params.iono;
  const dynamicSupplier = req.params.user;

  if (req.session.loggedin) {
    if (temp == dynamicSupplier) {
      var query = "SELECT * FROM adminncr where ioNo = ?";
      con.query(query, [dynamicIono], function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          array = result[0];
          console.log(typeof(array));
          res.render("supplierForm", {
            dynamicIono: dynamicIono,
            dynamicSupplier: dynamicSupplier,
            array: array
          });
          console.log(req.url);
        }
        return;
        res.end();
      });

    } else {
      res.send('Please login to view this page!');
    }
  } else {
    res.send('Please login to view this page!');
  }
});

app.post("/supplier/pending/:user/:iono", function(req, res) {
  // const dynamicIono = req.params.iono;
  const dynamicSupplier = req.params.user;
  const ionos = req.params.iono;
  const reason = req.body.reason;
  const immediateCorrectiveAction = req.body.immediateCorrectiveAction;
  const rootcause1 = req.body.WhyMade1;
  const rootcause2 = req.body.Why1;
  const ca1 = req.body.WhyMade2;
  const ca2 = req.body.Why2;
  const responsibility1 = req.body.responsibility1;
  const targetDate1 = req.body.targetDate1;
  const responsibility2 = req.body.responsibility2;
  const targetDate2 = req.body.targetDate2;
  const preventiveAction = req.body.preventiveAction;
  var CTFTeam1 = req.body.CTFTeam1;
  var Title1 = req.body.Title1
  var Email1 = req.body.Email1
  var CTFTeam2 = req.body.CTFTeam2
  var Title2 = req.body.Title2;
  var Email2 = req.body.Email2;
  var CTFTeam3 = req.body.CTFTeam3;
  var Title3 = req.body.Title3;
  var Email3 = req.body.Email3;
  var closure = req.body.closure;
  const update = "UPDATE adminncr SET isFilled = ? where iono = ?";
  let insert = `update supplierncr set immediateCorrectiveAction=?,rootcause1 =?,rootcause2 =?,ca1=?,ca2=?,teammember1=?, title1=? , email1=?,teammember2=?,title2=?, email2=? , teammember3=?, title3=?,email3=?, responsibility1=?, responsibility2=?, targetDate1=? ,targetDate2=?, preventiveAction=?, closure=? where ioNo = ?;`;
  con.query(insert, [ immediateCorrectiveAction, rootcause1,rootcause2,ca1,ca2, CTFTeam1, Title1,Email1, CTFTeam2, Title2,Email2,CTFTeam3, Title3,Email3,responsibility1,responsibility2,targetDate1,targetDate2,preventiveAction,closure, ionos], function(err, rows) {
    if (err) {
      console.log(err);
    } else {
      con.query(update, [true, ionos], function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
        }
      });
      res.redirect("/supplier/pending/" + dynamicSupplier);
    }
  })
});
var array5 =[];
app.get("/reject/:user/:iono", function(req, res) {
  let temp = req.session.user_id;
  console.log(temp);
  console.log("ptk");
  const dynamicIono = req.params.iono;
  const dynamicSupplier = req.params.user;

  if (req.session.loggedin) {
    if (temp == dynamicSupplier) {
      const query = "select * from adminncr left join supplierncr on adminncr.iono = supplierncr.iono where adminncr.iono = ?;"
      con.query(query, [dynamicIono], function(err, result) {
        if (err) {
          console.log(err);
        } else {
          array5 = result;
          console.log(array5);
          //count++;
          //console.log(count);
          console.log(req.url);
          res.render("supplierrejectform",{
            array5:array5,
            dynamicIono:dynamicIono,
            dynamicSupplier:dynamicSupplier
          });
        }
        res.end()
      });



    } else {
      res.send('Please login to view this page!');
    }
  } else {
    res.send('Please login to view this page!');
  }
});

app.post("/reject/:user/:iono", function(req, res) {
  // const dynamicIono = req.params.iono;
  const dynamicSupplier = req.params.user;
  const ionos = req.params.iono;
  const reason = req.body.reason;

  const immediateCorrectiveAction = req.body.immediateCorrectiveAction;
  const rootcause1 = req.body.WhyMade1;
  const rootcause2 = req.body.Why1;
  const ca1 = req.body.WhyMade2;
  const ca2 = req.body.Why2;

  let insert = `update supplierncr set immediateCorrectiveAction=?,rootcause1 =?,rootcause2 = ?,ca1 = ? , ca2 = ? where ioNo = ?;`;
  let update  = `update adminncr set isrejected = ? where ioNo=?`;
  con.query(insert, [immediateCorrectiveAction,rootcause1,rootcause2,ca1,ca2,ionos], function(err, rows) {
    if (err) {
      console.log(err);
    } else {
      con.query(update,[false,ionos],function(err,rows){
        if(err)
        {
          console.log(err);
        }
        else{
          res.redirect("/reject/" + dynamicSupplier);
        }
      });

  }
});
});


var array3 = [];
var count = 0;
app.get("/adminHome/review/:ioNo", function(req, res) {
  var dio = req.params.ioNo;
  if (req.session.loggedin) {
    const query = "select * from adminncr left join supplierncr on adminncr.iono = supplierncr.iono where adminncr.iono = ?;"
    con.query(query, [dio], function(err, result) {
      if (err) {
        console.log(err);
      } else {
        array3 = result;
        console.log(array3);
        count++;
        console.log(count);
        console.log(req.url);
        res.render('adminView', {
          array3: array3
        });
      }
      res.end()
    })

  } else {
    res.send("Please Login to view this page!")
  }

});

// app.post("/adminHome/approve/second/:ioNo", function(req, res) {
//   var dynamicIono = req.params.ioNo;
//   var query = "DELETE FROM supplierncr WHERE ioNo = ?";
//   var sql = "UPDATE adminncr SET isfilled = false WHERE isfilled = ? and ioNo = ?";
//   con.query(sql, [true, dynamicIono], function(err, result) {
//     if (err) {
//       console.log(err);
//     } else {
//
//       con.query(query, [dynamicIono], function(err, ans) {
//         if (err) {
//           console.log(err);
//         } else {
//           res.redirect("/adminHome");
//         }
//       })
//     }
//   });
// });
//
// // app.get("/adminHome/approve/second/:ioNo", function(req,res)){
// //   res.render('editView', {array3: array3})
// // };
//
// app.post("/adminHome/approve/first/:ioNo", function(req, res) {
//   var dynamicIono = req.params.ioNo;
//   var sql = "UPDATE adminncr SET isaprooved = true WHERE isaprooved = ? and ioNo = ?";
//   con.query(sql, [false, dynamicIono], function(err, result) {
//     if (err) {
//       console.log(err);
//     } else {
//       var q = "update adminncr set status = ? where ioNo = ?"
//       con.query(q, ["Closed", dynamicIono], function(err, answ) {
//         if (err) {
//           console.log(err);
//         } else {
//           res.redirect("/adminHome");
//         }
//       });
//     }
//   });
// });

app.post("/adminHome/review/reject/:ioNo", function(req, res) {
var dynamicIono = req.params.ioNo;


var sql = `update adminncr set isrejected = ?  where ioNo = ?;`;
con.query(sql, [true, dynamicIono], function(err, result) {
  if (err) {
    console.log(err);
  }
  else
  {
    res.redirect("/adminHome");
  }
})
});





app.post("/adminHome/review/approve/:ioNo", function(req, res) {
  var dynamicIono = req.params.ioNo;
  var query = `update adminncr set isaprooved = ?,status=?  where ioNo = ?;`;
  con.query(query, [true,"Closed" ,dynamicIono], function(err, result) {
    if (err) {
      console.log(err);
    } else {

          res.redirect("/adminHome");
        }
  })
});
var array4 = [];
app.get("/dashboard", function(req, res) {
  if (req.session.loggedin) {
    if(req.session.user_id == "a"){
        const query = "select * from adminncr left join supplierncr on adminncr.iono = supplierncr.iono;"
        con.query(query, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            array4 = result;
            console.log(array4);
            res.render('dashboard', {
              array4: array4
            });
          }
          res.end();
        });
    }
    else{
        res.send("You are not authorised!")
    }
  }
  else{
     res.send("Please login to view this page!")
  }

});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server ");
});
