var mongodb = require('../conexiones-basededatos/conexion-mongodb.js');
var colecciones={
    docs:"sri.documentos",
    emp:"eedcempresas"
}
var redisconectado = false;

var InstanciarVariablesRedis = function(cliente_){
    cliente = cliente_;
};
InstanciarVariablesRedis.prototype.setDocumentos = function(){
    mongodb.getRegistros(colecciones.docs,{},function(r){
        cliente.sadd('sri:documentos',JSON.stringify(r));  
        cliente.expire('sri:documentos',432000); //
    });
}
InstanciarVariablesRedis.prototype.setEmpresas = function(){
    mongodb.getRegistros(colecciones.emp,{},function(r){
        cliente.sadd('eedcempresas',JSON.stringify(r));    
        cliente.expire('eedcempresas',432000);
    });
}
module.exports = InstanciarVariablesRedis;