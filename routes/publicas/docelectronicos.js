var express = require('express');
var router = express.Router();
var postgres = require('../../conexiones-basededatos/conexion-postgres.js');
//var servletWS = require('../../conexion-servletsws/conexionWS.js');
/* GET home page. */
router.get('/consultar/empresas/1', function(req, res, next) {
    postgres.consultarEmpresas(function(resultado) {
      res.json(resultado);
    });
});
router.get('/sesion-usuario/imagen/:propiedad', function(req, res, next) {
      var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
      router.servletWS.getImagenCaptcha(req.params.propiedad,ip, res);

});
// =====================================
    // LOGIN ===============================
	// Codigo 002
    // =====================================
    // show the login form
router.post('/login', function(req, res, next) {

	  router.passport.authenticate('local', function(err, user, info) {
  		if (err) {
  			  console.log(err);
  		    return next(err)
  		}
  		if (!user) {
  			   return res.send({login:false,mensaje:info.mensaje});
  		}
  		req.logIn(user, function(err) {
    			if (err) {
    			     return next(err);
    			}
  		    return res.send({login:true});
  		});
	  })(req, res, next);
	});

module.exports = router
