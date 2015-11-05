import express from 'express'
import forms from 'forms'
import csurf from 'csurf'
import stormpath from 'express-stormpath'
import extend from 'xtend'

//Form Schema.
let userForm = forms.create({
  name: forms.fields.string({required: true}),
  username: forms.fields.string(),
  address: forms.fields.string(),
  phone: forms.fields.string()
});


//Assigning values or setting default.
function renderForm(req, res, locals) {
  res.render('add_user', extend({
    title: "New User",
    csrfToken: req.csrfToken(),
    name: req.user.name,
    username: req.user.username,
    address: req.user.address,
    phone: req.user.phone
  }, locals || {}))
}

module.exports = add_user => {
  let router = express.router()
  router.use(csurf({sessionKey: "stormpathSession"}))

  router.all('/', (req, res) => {
    userForm.handle(req, {
      success: (form) => {
        req.user.name = form.data.name
        req.user.username = form.data.username
        req.user.address = form.data.address
        req.user.phone = form.data.phone
        req.user.save(err => {
          if (err){
            if(err.developerMessage){
                console.error(err);
              }
              renderForm(req, res, {
                errors: [{
                  error: err.userMessage || err.message || String(err)
                }]
              })
          }
          else 
          {
            renderForm(req, res, {
              saved: true
            })
          }
        })
      },
      error: (form) => console.log("Error Persists"),
      empty: () => renderForm(req, res)
    })
  })

  router.use((err, req, res, next) => {
    if(err.code === 'EBADCSRFTOKEN'){
      if(req.user){
        renderForm(req, res, {
          errors: [{error: "Your form has expired, Please try again"}]
        })
      }
      else{ res.redirect('/') }
    }
  else{ next(err) }
  })
  return router;
}
