'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _monk = require('monk');

var _monk2 = _interopRequireDefault(_monk);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

// require('node-monkey').start({host: "localhost", port: "5050"})

var app = (0, _express2['default'])();
var db = (0, _monk2['default'])('localhost:27017/nodetest1');

app.set('views', './views');
app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);

app.use(_bodyParser2['default'].json());
app.use(_bodyParser2['default'].urlencoded({ extended: true }));

app.get('/', function (req, res) {
  return res.render('index.html');
});
app.get('/about', function (req, res) {
  return res.render('about.html');
});
app.get('/contact', function (req, res) {
  return res.render('contact.html');
});

app.get('/list', function (req, res) {
  var collection = db.get("User");
  collection.find({}, {}, function (e, docs) {
    res.render("list_users.jade", {
      "userlist": docs
    });
  });
});

app.get('/add_user', function (req, res) {
  return res.render("add_user.jade");
});
app.get('/finduser', function (req, res) {
  return res.render('finduser.jade');
});

//Form handling.
app.post('/createuser', function (req, res) {
  var name = req.body.name;
  var username = req.body.username;
  var address = req.body.address;
  var phone = req.body.phone;

  var record = { "name": name, "username": username, "address": address, "phone": phone };
  db.get('User').insert(record);

  res.redirect("/");
});

app.get('/find_a_user', function (req, res) {
  var username = req.query.username;
  console.log("username: " + username);
  db.get('User').find({ username: "" + username }, {}, function (err, result) {
    console.log(result[0].username);
    res.render("usershow.jade", { "data": result[0] });
  });
});

//Server listening on port 5005
app.use(function (req, res, next) {
  req.db = db;
  next(db);
});
app.listen(5005, function () {
  return console.log("The server is sucessfully started on port 5005!");
});