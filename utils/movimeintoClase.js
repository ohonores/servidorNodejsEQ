var postgres = require('../conexiones-basededatos/conexion-postgres.js');
var Q = require('q');
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
var redisCliente;

var MovmientoJS = function(){
    
};

MovmientoJS.prototype.setRedisCliente=function(redisCliente_){
    redisCliente = redisCliente_
};
MovmientoJS.prototype.getInformacionCliente = function(id, callBack){
    var sql = "SELECT true as cambiarinfo,  identificacion||' '||razonsocial||' '||email as query,* FROM swissedi.eeditpersona WHERE estado='A' AND id = $1";
    var criterios = [id];

    postgres.getPoolClienteConexion(sql, criterios, function(resultado){
        if(resultado && resultado.rows && resultado.rows.length>0){
            callBack(true, resultado.rows);
        }else{
            callBack(false);
        }
    });

};
MovmientoJS.prototype.getTipoDocumentos = function(callBack){
    postgres.getPoolClienteConexion("SELECT true as estado,id,codigo,descripcion,orden, id ||' '||codigo||' '||descripcion as query, docrecepsri,abreviado FROM swissedi.eedittipo_documento_sri ORDER BY id DESC ", null, function(resultado){
    	if(resultado && resultado.rows && resultado.rows.length>0){
            callBack(true,resultado.rows);
    	}else{
    		callBack(false);
        }
	});
};
MovmientoJS.prototype.getEstadosPorEmpresaPorPerfil = function(empresa, documento, estados){
    var deferred = Q.defer();
    var estadosQ = estados ==="*"?"":" AND estado in ("+estados+")";
    var empresaQ = empresa !=="0" ? " AND  empresa_id=$1":"";
    var documentoQ = documento !=="0" ? " AND tipodocumentosri_id=$2":"";
    var valores = [];
    if(empresaQ){
        valores.push(empresa);
    }
    if(documentoQ){
        valores.push(documento);
    }
    postgres.getPoolClienteConexion("SELECT * FROM swissedi.estadosporempresas WHERE 1=1 " + empresaQ + documentoQ + estadosQ, valores, function(resultado){
      //  console.log(resultado.rows);
    	if(resultado && resultado.rows && resultado.rows.length>0){
            deferred.resolve(resultado.rows);
    	}else{
    		deferred.reject();
        }
	});
    return deferred.promise;
};
var   tablaMovimientos = "swissedi.docelectronicos";
var   tablaMovimientosleft = "swissedi.docelectronicosleft";
MovmientoJS.prototype.consultarRegistrosDinamicamente = function(parametros, perfil, callback){

            parametros.tabla = perfil == "edi" ? tablaMovimientos : tablaMovimientosleft ;
            log.info(parametros.tabla);
            postgres.consultarRegistrosDinamicamente(parametros, function(registros){
                callback(registros);
    });

};
MovmientoJS.prototype.consultarTotalRegistrosDinamicamente = function(parametros, perfil, callback){
            parametros.tabla = perfil == "edi" ?  tablaMovimientos : tablaMovimientosleft;
            log.info(parametros.tabla);
            postgres.consultarTotalRegistrosDinamicamente(parametros,  function(registros){
                callback(registros);
    });

};
MovmientoJS.prototype.consultarclientesporcriterio = function(criterio, callBack){
    try{
		if(criterio){
			var criterios = ['%'+criterio+'%'];

			var sqlRegistros = "SELECT true as cambiarinfo, razonsocial, cliente_proveedor, ARRAY_TO_STRING(ARRAY[identificacion,razonsocial,email], ' ') as query,* FROM swissedi.eeditpersona where estado='A'   and  ARRAY_TO_STRING(ARRAY[identificacion,razonsocial,email], ' ')  ilike $1::varchar  limit 60";

			postgres.getPoolClienteConexion(sqlRegistros, criterio ? criterios:null, function(resultado){
					if(resultado){
                        callBack(true, resultado.rows);
					}else{
						callBack(false);
					}
			});
		}else{
		   callBack(false);
		}
	}catch(error){
		console.log(error);
		console.log(criterio);
	}
};
MovmientoJS.prototype.consultarDocumentosPorCriterio = function(empresa_id, tipodoc, criterio, callBack){
    try{
		if(criterio){
			var criterios = [empresa_id, tipodoc, '%'+criterio+'%'];
           // console.log(criterios);

			var sqlRegistros = "SELECT * FROM swissedi.typeaheads_comprobante_movmiento WHERE empresa_id=$1 and tipodocumentosri_id=$2 and query like $3::varchar  limit 60";

			postgres.getPoolClienteConexion(sqlRegistros, criterio ? criterios:null, function(resultado){
					if(resultado){
                        callBack(true, resultado.rows);
					}else{
						callBack(false);
					}
			});
		}else{
		   callBack(false);
		}
	}catch(error){
		console.log(error);
		console.log(criterio);
	}
};
MovmientoJS.prototype.consultarBlob = function(id, documento, columnablob,contentType,download, extension, res){
   try{
		var query = '';

		query = "SELECT claveacceso,serie||'-'||comprobante as doc,:columna FROM swissedi.eeditmovimiento where id=$1";

		query = query.replace(':columna',columnablob);
		postgres.getPoolClienteConexion(query, [id], function(resultado){
			if(resultado){
				if(resultado.rows && resultado.rows[0] && resultado.rows[0][columnablob] && resultado.rows[0][columnablob].length>0){
					if(contentType){
						if(download && download == 1){
						 res.set('Content-Disposition', 'attachment; filename="'+resultado.rows[0].doc+extension+'"');
						}
						res.writeHead(200, {"Content-Type": contentType});
						res.write(resultado.rows[0][columnablob]);
						res.end();

					}else{
						res.json(resultado.rows[0][columnablob]);
					}

			  }else{

				res.json("SWISSEDI: Documento no encontrado con el id "+id+", podria tratarse por que aun no se ha generado el ride ");
			  }
			}else{
				res.json(nohayresultados);

			}
		});
	}catch(error){
		res.json(nohayresultados);
		console.log(error);
	}
};



MovmientoJS.prototype.consultarmovimientosbitacora = function(movimiento_id, callback){
	var sql = 'SELECT m.* FROM swissedi.eeditmovimiento_bitacora m  WHERE m.movimiento_id =  $1 ORDER BY m.id DESC LIMIT 300';
    postgres.getPoolClienteConexion(sql, [movimiento_id], function(resultado){
		if(resultado){
			callback(resultado.rows);
		}else{
			callback(null);
		}
	});
};

/********************************************
    REDIS----------
key                                     Valor
usuario:rucEmpresa:codDoc:estado        JSON.stringify([{_id:'',razonsocial:'',fechacreacion:'',claveacceso:'',numeroautorizacion:'',preimpreso:'',total:''}])
usuario:rucEmpresa:codDoc:estado:total  total de registros formato numerico
*******************************************/
MovmientoJS.prototype.getUltimosMovimientosPorPaginacion = function(usuario,codDoc,ruc, ambiente, estado,paginacion){
    var deferred = Q.defer();
    Q.all([redisCliente.get(usuario+":"+codDoc+":"+ruc+":"+ambiente+":"+estado+":total"),redisCliente.smembers(usuario+":"+codDoc+":"+ruc+":"+ambiente+":"+estado+":"+paginacion)]).then(function(resultado){
        deferred.resolve({total:resultado[0],registros:JSON.parse(resultado[1])});
    },function(x){
         deferred.reject(false);
    });
    
    return deferred.promise;
};
MovmientoJS.prototype.getDocumentosReids = function(){
    var deferred = Q.defer();
    redisCliente.smembers("documentos").then(function(resultado){
        deferred.resolve(JSON.parse(resultado));
    });
    
    return deferred.promise;
};

module.exports = new MovmientoJS();
