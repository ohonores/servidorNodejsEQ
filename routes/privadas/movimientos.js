
var express = require('express');
var movimiento = express.Router();
var TipoBrowser = require('../../utils/tipoBrowser.js');

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


var seguridadEDC = require('../../conexion-servletsws/SeguridadEDC.js');
var postgres = require('../../conexiones-basededatos/conexion-postgres.js');
var menus = require('../../utils/menusYestados.js');


var MovmientoJS = require('../../utils/movimeintoClase.js');
movimiento.all("/*", TipoBrowser.browserAceptado, seguridadEDC.isUserAutenficado,   function(req, res, next) {
  next(); // if the middleware allowed us to get here,
          // just move on to the next route handler
});
/* GET home page. */
movimiento.get('/movimientos', function(req, res, next) {
    res.render('movimientos/index.html',{user:req.user});
});
movimiento.get('/menus/:perfil', seguridadEDC.validarPerfil,function(req, res, next) {
    res.send(menus.menuPrincipal.filter(function(m){if(m.perfiles && m.perfiles.indexOf(req.params.perfil)>=0){return m}}));
});
movimiento.get('/documentos/:perfil', seguridadEDC.validarPerfil, function(req, res, next) {
    MovmientoJS.getTipoDocumentos(
            function(estado, resultado){
                    if(estado){
                        res.send(resultado);
                    }else{
                        res.send([]);
                    }
            });
});
movimiento.get('/salir', function(req, res, next) {

    req.logout();
    postgres.updateJson({sesionid:req.sessionID},{logout:new Date()},"swissedi.eeditusarios_conectados",function(res){
        console.log(res);
    })
    //res.redirect('/');
    res.send(true);

});

/**
    CONSULTAR EL CLIENTE/PROVEEDOR
*/
movimiento.get('/consultar/cliente-proveedor/id/:id', seguridadEDC.verficarInjections, function(req, res, next) {

    //consultarclientesporid(req.params.id, res);
    MovmientoJS.getInformacionCliente(req.params.id, function(estado, resultado){
        if(estado){
            res.send(resultado[0]);
        }else{
            res.send({error: "CLIENTE/PROVEEDOR NO ENCONTRANDO"});
        }

    });

});

/**
    CONSULTAR REGISTROS DE DOCUMENTOS ELCTRONICOS
*/

movimiento.get('/consultar/documentos/:empresaid/:personaid/:coddoc/:limite/paginacion/:id/:avanzar/fecha/:inicio/:fin/registroid/:registroid', seguridadEDC.verficarInjections, function(req, res) {
    var busqueda = {empresa_id:req.params.empresaid}
    if(req.params && req.params.personaid && req.params.personaid !="0" ){
        busqueda["persona_id"] = req.params.personaid;
    }
    if(req.params.coddoc && req.params.coddoc!='0'){
        busqueda["tipodocumentosri_id"]=req.params.coddoc;
    }
    if(req.params.registroid && req.params.registroid!='0'){
        busqueda = {};
        busqueda["id"]=req.params.registroid;
    }
    var parametros = {columnas:"id, fechacreacion, infjson, ambiente, estado, claveacceso, tipodocumentosri_id, fechasri, razonsocial, serie, comprobante, subtotal",busqueda:busqueda,limite:req.params.limite}
    if(req.params && req.params.id != '0' ){
        parametros.paginacion = {prevId:"id",prevIdV:req.params.id, avanzar:(req.params.avanzar && req.params.avanzar=="true")?">":"<"}
    }
    if(req.params.inicio && req.params.inicio!='0' && req.params.fin && req.params.fin!='0'){
                parametros["fecha"]={campo:"fechaemision",inicio:formatDate(req.params.inicio,'-',false),fin:formatDate(req.params.fin,'-',true)};
    }

    parametros.orderby="fechacreacion desc, id desc";
    console.log("movimiento.get");
    console.log(parametros);
    MovmientoJS.consultarTotalRegistrosDinamicamente(parametros, req.user.perfil,  function(total){
        console.log('consultarTotalRegistrosDinamicamente');
        console.log(total);
        if(total>0){
            MovmientoJS.consultarRegistrosDinamicamente(parametros, req.user.perfil, function(resultados){
                console.log('consultarTotalRegistrosDinamicamente');
                console.log(resultados);
                res.send({total:total, resultados:resultados});
            });
        }else{
                res.send({total:total, resultados:[]});
        }

    });

});

//*****************
//SERVICIO, BUSQUEDA DE CLIENTES
//*****************
movimiento.get('/consultar/clientes/criterio/:sql', seguridadEDC.verficarInjections,  function(req, res) {
        MovmientoJS.consultarclientesporcriterio(req.params.sql, function(estado, respuesta){
            if(estado){
                res.send(respuesta);
            }else {
                res.send([]);
            }

        })

});


//The 404 Route (ALWAYS Keep this as the last route)
movimiento.get('/*', function(req, res, next){
   res.render("404/404.html");
});
module.exports = movimiento;
