
var express = require('express');
var movimiento = express.Router();
var TipoBrowser = require('../../utils/tipoBrowser.js');
var hash = require('object-hash');
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
var fechaUtils = require('../../utils/fechaUtils.js');
var datestyle = "";
if(!datestyle){
    postgres.getDatestyle(function(res){
        datestyle = res;
        fechaUtils = new fechaUtils(datestyle);
    });
}

movimiento.all("/*", TipoBrowser.browserAceptado, seguridadEDC.isUserAutenficado,   function(req, res, next) {
  next(); // if the middleware allowed us to get here,
          // just move on to the next route handler
});
/* GET home page. */
movimiento.get('/movimientos', function(req, res, next) {
    console.log("movimientos ",req.sessionID);
    /*movimiento.redis.get('edi'+req.sessionID).then(function(d){
        console.log("d ",JSON.parse(d));
    })*/
    res.render('movimientos/index.html',{user:req.user});
});
movimiento.get('/menus/:perfil', seguridadEDC.validarPerfil,function(req, res, next) {
    res.send(menus.menuPrincipal.filter(function(m){if(m.perfiles && m.perfiles.indexOf(req.params.perfil)>=0){return m;}}));
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

movimiento.get('/columnas/perfil/:perfil', seguridadEDC.validarPerfil, function(req, res, next) {
    MovmientoJS.getTipoDocumentos(
            function(estado, resultado){
                    if(estado){
                        res.send(resultado);
                    }else{
                        res.send([]);
                    }
            });
});

movimiento.get('/estados/:empresa/:documento/:perfil', seguridadEDC.validarPerfil, function(req, res, next) {
    MovmientoJS.getEstadosPorEmpresaPorPerfil(
                                                req.params.empresa,req.params.documento, 
                                                menus.estadosPorPefil.filter(function(p){ 
                                                    if(p.perfil === req.params.perfil){
                                                        return true;
                                                    }
                                                }
                                                                            )[0].estados).
    then(function(estados){
        res.send(estados);
    },function(){
        res.send([]);
    });
});

movimiento.get('/salir', function(req, res, next) {

    req.logout();
    postgres.updateJson({sesionid:req.sessionID},{logout:new Date()},"swissedi.eeditusarios_conectados",function(res){
        console.log(res);
    });
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

movimiento.get('/consultar/documentos/:empresaid/:personaid/:coddoc/:limite/paginacion/:id/fecha/:inicio/:fin/registroid/:registroid/:estado', seguridadEDC.verficarInjections, function(req, res) {
    //console.log(req.session);
    var busqueda = {empresa_id:req.params.empresaid};
    if(req.params && req.params.personaid && req.params.personaid !="0" ){
        busqueda.persona_id = req.params.personaid;
    }
    if(req.params.coddoc && req.params.coddoc!='0'){
        busqueda.tipodocumentosri_id=req.params.coddoc;
    }
    if(req.params.registroid && req.params.registroid!='0'){
        busqueda = {};
        busqueda.id=req.params.registroid;
    }
    if(req.params.estado && req.params.estado!='0'){
        busqueda.estado=req.params.estado;
    }
    var parametros = {columnas:"id, fechacreacion, ambiente, estado, claveacceso, empresa_id, tipodocumentosri_id, fechasri, razonsocial, serie, comprobante, subtotal,iva,descuento, valor,numeroautorizacion",busqueda:busqueda,limite:req.params.limite};
    if(req.params && req.params.id != '0' ){
        parametros.paginacion = {prevId:"id",prevIdV:req.params.id, avanzar:"<"};
    }



    if(req.params.inicio && req.params.inicio!='0' && req.params.fin && req.params.fin!='0'){
                parametros.fecha={campo:"fechacreacion",inicio:fechaUtils.formatDate(new Date(parseInt(req.params.inicio)),'-',false),fin:fechaUtils.formatDate(new Date(parseInt(req.params.fin)),'-',true)};
    }
    //parametros.orderby=(req.params.avanzar && req.params.avanzar=="true")?" ID ASC ":" ID DESC";

    MovmientoJS.consultarTotalRegistrosDinamicamente(parametros, req.user.perfil,  function(total){
       // console.log('consultarTotalRegistrosDinamicamente');
        //console.log(total);
        if(total>0){
            MovmientoJS.consultarRegistrosDinamicamente(parametros, req.user.perfil, function(resultados){
          //      console.log('consultarTotalRegistrosDinamicamente');
            //    console.log(resultados);
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
            res.send(estado ? respuesta:[]);

        });

});

//*****************
//SERVICIO, BUSQUEDA DE DOCUMENTOS
//*****************
movimiento.get('/consultar/documentos/criterio/:empresa/:tipdoc/:sql', seguridadEDC.verficarInjections,  function(req, res) {
        MovmientoJS.consultarDocumentosPorCriterio(req.params.empresa, req.params.tipdoc, req.params.sql, function(estado, respuesta){
            res.send(estado ? respuesta:[]);

        });

});

movimiento.get('/ride/tipo/:tipo/:download/id/:id/:doc',seguridadEDC.verficarInjections, function(req, res, next) {

		  var contentType;
		  var extension='.txt';
		  switch(req.params.tipo){
			case 'ride':
				contentType = 'application/pdf';
				extension = '.pdf';
			break;
			case 'xmlsri':
				contentType = 'application/octet-stream';
				extension = '.xml';
			break;
			case 'xmlfirmado':
				contentType = 'application/octet-stream';
				extension = '.xml';
			break;
			case 'xmlorigen':
				contentType = 'application/octet-stream';
				extension = '.xml';
			break;
		  }
		  MovmientoJS.consultarBlob(req.params.id, req.params.doc, req.params.tipo,contentType,req.params.download,extension, res);
});
movimiento.get('/robots-ws/:empresa/:accion/:codigo/:id/:estados', seguridadEDC.verficarInjections, function(req, res){
	   movimiento.servletWS.procesarRoborEdiWS(req.params.empresa, req.params.accion, req.params.codigo,req.params.id,req.params.estados,res);
});


movimiento.get('/consultar/movimientos-bitacora/:movimiento_id', seguridadEDC.verficarInjections, function(req, res) {

			MovmientoJS.consultarmovimientosbitacora(req.params.movimiento_id,function(resultado){
                res.jsonp(resultado);
            });

});

movimiento.get('/consultar/movimientos-redis/:pagina', seguridadEDC.verficarInjections, function(req, res) {
            console.log('/consultar/movimientos-redis/:pagina');
            MovmientoJS.setRedisCliente(movimiento.redis);
                                                     //   usuario+":"+codDoc+":"+ruc+":"+ambiente+":"+estado+":total"
			MovmientoJS.getUltimosMovimientosPorPaginacion(req.user.username,"01","0990018707001",2,"A",req.params.pagina).then(function(resultado){
                console.log(resultado);
                res.jsonp(resultado);
            },function(x){
                 console.log("error resultado");
                 console.log(x);
                res.jsonp(x);
            });

});


	


//The 404 Route (ALWAYS Keep this as the last route)
movimiento.get('/*', function(req, res, next){
   res.render("404/404.html");
});
module.exports = movimiento;
