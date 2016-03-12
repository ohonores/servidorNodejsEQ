/***************
Por favor leer la siguiente pagina
https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
MongoClient connection pooling
A Connection Pool is a cache of database connections maintained by the driver
so that connections can be re-used when new connections to the database are required.
To reduce the number of connection pools created by your application, we recommend
calling MongoClient.connect once and reusing the database variable returned by the callback:
****************/
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var db;
var localhost = "192.168.2.207"
var ClienteMongoDb = function () {this.init();};

ClienteMongoDb.prototype.init = function () {
    // Initialize connection once
    MongoClient.connect("mongodb://"+localhost+":27017/integration_test", function(err, database) {
      if(err) { console.log("Error en MongoDb al iniciar la based de datos");throw err};

      db = database;
      console.log("Listo Conectado");
    });
};
ClienteMongoDb.prototype.getRegistros = function (collection, parametros, resultado) {
        db.collection(collection).find(parametros).toArray(function(err, docs) {
             resultado(docs);
        });
}
ClienteMongoDb.prototype.getRegistro = function (collection, parametros, resultado) {
        db.collection(collection).findOne(parametros,function(err, registro) {
             resultado(registro);
        });
}
ClienteMongoDb.prototype.grabar = function (collection, parametros, resultado) {
        db.collection(collection).insertOne(parametros, function(err, docs) {
			if(err){
				console.log(err);
				resultado({error:true,mensaje:err});
				return;
			}
			resultado(docs);
        });
}
ClienteMongoDb.prototype.modificar = function (collection, busqueda, actualizar, callback) {
       db.collection(collection).updateOne(
             busqueda,
             actualizar, function(err, results) {
             
             callback(results);
        });
}

module.exports = new ClienteMongoDb();