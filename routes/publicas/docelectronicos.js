var express = require('express');
var router = express.Router();
var TipoBrowser = require('../../utils/tipoBrowser.js');
var postgres = require('../../conexiones-basededatos/conexion-postgres.js');
var mongodb = require('../../conexiones-basededatos/conexion-mongodb.js');
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
            resultado = resultado.filter(function(a){if((req.user.empresa + "").indexOf(a.id)>=0){return a};});
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
    console.log("login************");
    
   
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
            console.log(user);
             /****
                Oteniendo los 10 ultimos
            ****/
            mongodb.getRegistrosCustomColumnasOrdenLimite("emitidos.01.0990018707001.2.A",{},{"fechacreacion":1,razonsocial:1,preimpreso:1,claveacceso:1,autorizacion:1,total:1},{"fechacreacion":-1},10,function(r){


                client3.sadd(user.username+":01:0990018707001:2:A:1",JSON.stringify(r));
                client3.expire(user.username+":01:0990018707001:2:A:1",60);
                 
            });
            mongodb.getCount("emitidos.01.0990018707001.2.A",{},function(r){
               client3.set(user.username+":01:0990018707001:2:A:total",r);
               client3.expire(user.username+":01:0990018707001:2:A:total",60);
            });
            return res.send({login:true});
  		});
	  })(req, res, next);
});
/********************************************************
			RESETEO DE PASSWORD AL SISTEMA
			METODO POST->reseteo
			// Codigo 010
	**********************************************************/

router.post('/reseteo', function(req, res) {
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	router.servletWS.validarReseteoPasswordImpl(req.body.username,req.body.captcha,req.body.condic,ip, res);
});


var KEYARCHIVOS_RECIBIDOS = "archivos";
var KEYARCHIVOS_RECIBIDOS_SEPARADOR = "::::::";
router.all('/subir-archivos-xml/sri', function(req, res){
    		console.log("/subir-archivos-xml/sri");
    		var attachments = [];

    		if(req.files && req.files.file && Array.isArray(req.files.file)){
    			console.log("SI es array");
    			for( index in req.files.file){
                    var archivo = fs.createReadStream(req.files.file[index].path);
                    router.redis.lpush(KEYARCHIVOS_RECIBIDOS, hash(archivo)+ KEYARCHIVOS_RECIBIDOS_SEPARADOR + new Buffer(archivo) );
                    archivo = null;
    				
    			}
    			
    		}else{
                console.log("NO es array");
                console.log(req);
    			if(req.files && req.files.file && req.files.file.path){
                    var archivo = fs.createReadStream(req.files.file.path);
                    console.log(hash(archivo));
                    router.redis.lpush(KEYARCHIVOS_RECIBIDOS, hash(archivo)+ KEYARCHIVOS_RECIBIDOS_SEPARADOR + new Buffer(archivo) );
                     console.log("enviado");
                    archivo = null;
    			}
    		}

});

module.exports = router
