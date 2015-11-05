'use strict'
import express from 'express'
import mongo from 'mongodb'
import monk from 'monk'
import bodyParser from 'body-parser'
// require('node-monkey').start({host: "localhost", port: "5050"})

let app = express();
let db = monk('localhost:27017/nodetest1')

app.set('views', './views');
app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => res.render('index.html'))
app.get('/about', (req, res) => res.render('about.html'))
app.get('/contact', (req, res) => res.render('contact.html'))

app.get('/list', (req, res) => {
  let collection = db.get("User")
  collection.find({}, {}, (e, docs) => {
    res.render("list_users.jade", {
      "userlist": docs
    })
  })
})

app.get('/add_user', (req, res) => res.render("add_user.jade"))
app.get('/finduser', (req, res) => res.render('finduser.jade'))

//Form handling.
app.post('/createuser', (req, res) => {
  let name = req.body.name
  let username = req.body.username
  let address = req.body.address
  let phone = req.body.phone

  let record = {"name": name, "username": username, "address": address, "phone": phone}
  db.
    get('User').
    insert(record)

  res.redirect("/")
})

app.get('/find_a_user', (req, res) => {
  let username = req.query.username
  console.log("username: "+username)
  db.get('User').find({username: ""+username}, {}, (err, result) => {
    console.log(result[0].username)
    res.render("usershow.jade", { "data": result[0] })
  })
})



//Server listening on port 5005
app.use((req, res, next) => {
  req.db = db
  next(db)
})
app.listen(5005, () => console.log("The server is sucessfully started on port 5005!"))
