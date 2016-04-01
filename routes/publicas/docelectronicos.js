var express = require('express');
var router = express.Router();
var TipoBrowser = require('../../utils/tipoBrowser.js');
var postgres = require('../../conexiones-basededatos/conexion-postgres.js');
var seguridadEDC = require('../../conexion-servletsws/SeguridadEDC.js');
/* PAGINA DE INICIO. */
router.get('/', TipoBrowser.browserAceptado, function(req, res, next) {
      if(req.isAuthenticated()){
           res.redirect('/ver/movimientos');
       }else{
           res.render('home/index.html');
       }
});
/**
    PERMITE CONSULTAR TODAS LAS EMPRESA
*/
router.get('/consultar/empresas/1', function(req, res, next) {
    postgres.consultarEmpresas(function(resultado) {
        if(req.user && req.user.empresa){
            resultado = resultado.filter(function(a){if(req.user.empresa.indexOf(a.id)>=0){return a};});
        }

      res.json(resultado);
    });
});
/**
    PERMITE OBTENER EL CAPTCHA|
*/
router.get('/sesion-usuario/imagen/:propiedad', function(req, res, next) {
      var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
      console.log('/sesion-usuario/imagen/:propiedad');
       console.log(ip);
       console.log(req.params.propiedad);
      router.servletWS.getImagenCaptcha(req.params.propiedad,ip, res);

});
/**
    LOGIN CON Passport
*/
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
            console.log("Redireccionando");

            return res.send({login:true});
  		});
	  })(req, res, next);
});

module.exports = router
