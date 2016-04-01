var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var movimientos = require('./routes/privadas/movimientos');
var Promise = require('promise');
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var request = require("request");
var methodOverride = require('method-override');
var session  = require('express-session');

/****************
	Passporte ingreso al sistema
*****************/
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/**************
Logger
********************/
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'ediwebpage',
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(favicon(__dirname + '/public/favicon.ico'));
//pp.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'alien200525' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.session({ secret: 'alien' }));




app.use('/recursos',express.static(path.join(__dirname, 'bower_components')));
var client;
var redisStore;
if(process.env.REDIS == 1){
    log.info("Entro a redis");
    /***********
    	CONFIGURACION DE REDIS, SI NO TIENE LA BASE DE REDIS POR FAVOR COMENTAR HASTA "FIN REDIS"
    *************/

    client = require("redis").createClient(6379,process.env.NODE_ENV==="development"?"192.168.1.6":"localhost");
    redisStore = require('connect-redis')(session);
    client.on("error", function (err) {
        log.info("Error " + err);
    });
    /*********FIN REDIS**************/
    app.use(session({
        secret: 'alien200525',
        store: new redisStore({ host: process.env.NODE_ENV==="development"?"192.168.1.6":"localhost", port: 6379,prefix:'edi', client: client,ttl :120}),
        saveUninitialized: true,
        resave: false
    }));
}else{
    //app.use(express.session({ secret: 'alien' }));

}

app.use(passport.initialize());
app.use(passport.session());



var admin = express(); // the sub app

admin.get('/', function (req, res) {
  //console.log(admin.mountpath); // /admin
  res.send('Admin Homepage');
});

var admin = express();

admin.get('/', function (req, res) {
  //console.log(admin.mountpath); // [ '/adm*n', '/manager' ]
  res.send('Admin Homepage');
});
admin.on('mount', function (parent) {
  //console.log('Admin Mounted');
  //console.log(parent); // refers to the parent app
});
var secret = express();
secret.get('/', function (req, res) {
  //console.log(secret.mountpath); // /secr*t
  res.send('Admin Secret');
});




admin.use('/secr*t', secret); // load the 'secret' router on '/secr*t', on the 'admin' sub app
app.use(['/adm*n', '/manager'], admin); // load the 'admin' router on '/adm*n' and '/manager', on the

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

  app.use(function(err, req, res, next) {
    log.info("development");
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  log.info("production");
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// => "My Site"
function readJSON(filename, callback){
  // If a callback is provided, call it with error as the first argument
  // and result as the second argument, then return `undefined`.
  // If no callback is provided, just return the promise.
  return readFile(filename, 'utf8').then(JSON.parse).catch(callback);
}
function readJsonFiles(filenames) {
  // N.B. passing readJSON as a function, not calling it with `()`
  return Promise.all(filenames.map(readJSON));
};
app.get('/render1', function(req, res, next) {
    //res.json([{title1: 'res vs app render'},{title2: 'res vs app render'},{title3: 'res vs app render'}]);
    //res.attachment('/plantillaQuico.pdf');
    res.download('/test2.jar', 'test2.jar', function(err){
      if (err) {
        // Handle error, but keep in mind the response may be partially-sent
        // so check res.headersSent
      } else {
        // decrement a download credit, etc.
        log.info("Listo archivo download");
        readJsonFiles(['a.json', 'b.json']).done(function (results) {
          // results is an array of the values stored in a.json and b.json
        }, function (err) {
          log.info(err)
        });
        var p1 = Promise.resolve(3);
        var p2 = 1337;
        var p3 = new Promise(function(resolve, reject) {
          setTimeout(resolve, 12000, "p3");
        });
        var p4 = new Promise(function(resolve, reject) {
          setTimeout(resolve, 1000, "p4");
          //reject("error")
        });
        var valores = [p1,p4,p4]
        for(var i in valores ){
          valores[i].then(function(values) {
            log.info(values); // [3, 1337, "foo"]
          }).catch(function(err) {log.info(err);});

        }
        log.info('fin for');
        Promise.all([p1, p2, p3,p4]).then(function(values) {
            log.info(values); // [3, 1337, "foo"]
        }).catch(function(err) {log.info(err);});
          log.info('fin Promise');



            log.info('fin generators');
      }
    });
    //res.pipe('/plantillaQuico.pdf')
    //res.redirect('http://documentos.ecuaquimica.com.ec/verificar-ruc/1/0904255601001');
});

var readFile = Promise.denodeify(require('fs').readFile);
// now `readFile` will return a promise rather than expecting a callback
log.info("NODE_ENV: "+ process.env.NODE_ENV);


//Conexiones con las bases de datos










/****************************************
	SERVICIOS CON EL SERVLET DE WS
****************************************/
var puertoPrincipal = {"development":{"1":{puerto:80}},"production":{"1":{puerto:8080}}};  //8080;Conauto//8084;QUI; //80; Farmagro
var redLocal = "localhost";
var puertoLocal = "8080";
var hostSwissEdi = redLocal+":"+puertoLocal;
var puertoTablasTransitorias = "8081/swissedi-tablaProduccionATablasTransito";
var puertoWS = "8444/swisedi-webService";
var hostSwissEdiTablasTransitorias = redLocal+":"+puertoTablasTransitorias;
var hostSwissEdiWS = redLocal+":"+puertoWS;

/*
  ESPECIFICAMOS EL CERTIFICADO P12 PARA QUE PUEDA CONTARTSE CON EL WEBSERVICE
*/
var agentOptions_= {

					//cert: fs.readFileSync("C:/restful-nodeEdi-v01/certificados/client.cer"),
					//key: fs.readFileSync("C:/restful-nodeEdi-v01/certificados/client.keystore"),
					// Or use `pfx` property replacing `cert` and `key` when using private key, certificate and CA certs in PFX or PKCS12 format:
					pfx: fs.readFileSync(__dirname+"/certificados/KEYSTORE.p12"),
					passphrase: 'Alien20150521EQ',
					securityOptions: 'SSLv2',
					strictSSL: false, // allow us to use our self-signed cert for testing
					rejectUnauthorized: false
					//rejectUnhauthorized : false
				};
/*
  Instanciomos la clase ServletWS()
*/
var servletWS = require('./conexion-servletsws/conexionWS.js');
/*
  Agregamos parametros como
    hostSwissEdiWS: que nos indica el hots del webservice en javax
    hostSwissEdiTablasTransitorias: nos indica el host del servicio tomcat que inserta los registros en las tablas de trnasito
    agentOptions_: indicamos el certificado
*/
//Mensaje de errores
var mesnajeLabels = require('./utils/mensajesLabels.js');


servletWS.instanciarVariables(hostSwissEdiWS, hostSwissEdiTablasTransitorias, agentOptions_);
//Instanciamos la ruta rutasDocElectronicos
var rutasDocElectronicos = require('./routes/publicas/docelectronicos.js');
//Indicamos que la necesita de servletWS para comunicarse con el webservice
rutasDocElectronicos.servletWS = servletWS;

//INICIAMOS POSTGRES
var postgres = require('./conexiones-basededatos/conexion-postgres.js');

/*
  INICAMOS AUTENTIFICACION
  Para la autenficacion necesitamos de un servicio llamado pasport,
  que es el que se encarga de la autenficacion en conjunto con el webservice
*/
require('./conexiones-basededatos/passportEdi.js')(passport,hostSwissEdiWS,postgres, LocalStrategy, agentOptions_,log, mesnajeLabels); // pass passport for configuration
rutasDocElectronicos.servletWS = servletWS;
rutasDocElectronicos.passport = passport;

movimientos.log = log;

rutasDocElectronicos.use('/ver', movimientos);
app.use('/', rutasDocElectronicos);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('/*', function(req, res, next){
   res.render("404/404.html");
});

module.exports = app;
