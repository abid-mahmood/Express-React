'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _forms = require('forms');

var _forms2 = _interopRequireDefault(_forms);

var _csurf = require('csurf');

var _csurf2 = _interopRequireDefault(_csurf);

var _expressStormpath = require('express-stormpath');

var _expressStormpath2 = _interopRequireDefault(_expressStormpath);

var _xtend = require('xtend');

var _xtend2 = _interopRequireDefault(_xtend);

//Form Schema.
var userForm = _forms2['default'].create({
  name: _forms2['default'].fields.string({ required: true }),
  username: _forms2['default'].fields.string(),
  address: _forms2['default'].fields.string(),
  phone: _forms2['default'].fields.string()
});

//Assigning values or setting default.
function renderForm(req, res, locals) {
  res.render('add_user', (0, _xtend2['default'])({
    title: "New User",
    csrfToken: req.csrfToken(),
    name: req.user.name,
    username: req.user.username,
    address: req.user.address,
    phone: req.user.phone
  }, locals || {}));
}

module.exports = function (add_user) {
  var router = _express2['default'].router();
  router.use((0, _csurf2['default'])({ sessionKey: "stormpathSession" }));

  router.all('/', function (req, res) {
    userForm.handle(req, {
      success: function success(form) {
        req.user.name = form.data.name;
        req.user.username = form.data.username;
        req.user.address = form.data.address;
        req.user.phone = form.data.phone;
        req.user.save(function (err) {
          if (err) {
            if (err.developerMessage) {
              console.error(err);
            }
            renderForm(req, res, {
              errors: [{
                error: err.userMessage || err.message || String(err)
              }]
            });
          } else {
            renderForm(req, res, {
              saved: true
            });
          }
        });
      },
      error: function error(form) {
        return console.log("Error Persists");
      },
      empty: function empty() {
        return renderForm(req, res);
      }
    });
  });

  router.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
      if (req.user) {
        renderForm(req, res, {
          errors: [{ error: "Your form has expired, Please try again" }]
        });
      } else {
        res.redirect('/');
      }
    } else {
      next(err);
    }
  });
  return router;
};