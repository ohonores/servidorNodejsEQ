var io = require('socket.io');
conexiones = [];
var socket;
var SocketIo = function(http, empresas) {
    console.log("entro constructor de SocketIo");
    io = new io(http,{ pingTimeout: 600000});
    io.set ('heartbeat interval' , 600000) ;//Cada que tiempo se reconecta
   /* io.set ('pingTimeout', 320) ;//Reconeccion
    io.set ('pingInterval', 120) ;//Reconeccion
    io.set ('heartbeat interval' , 1320) ;//Cada que tiempo se reconecta
    io.set ('close timeout', 1800 ) ;//Tiempo de espea*/
    //Creando los sockets IO
    io.on('connection', function(socket){     //CONEXION 
                console.log("conectado socket sin namespaces");
                
                socket.on('autenficacion', function(datos){
                         if(datos.room){
                            socket.join(datos.room);
                        }
                        socket.room = datos.room;
                        console.log(socket.room);
                        //Validar el usuario
                        //Indicar que ha sido autentificado y esta listo para la comunicacion con el servidor
                        socket.emit('conectado', {mensaje:'server Conectado!',estado:true});
                });
                socket.on('mensaje', function(datos){
                        socket.emit('respuesta', {mensaje:'server edi solo a ti', estado:true,datos:datos});
                });
                
    });
   
    /*empresas.forEach(function(empresa){
        console.log(empresa);
        conexiones[empresa.ruc] = io
        .of('/ws-'+empresa.ruc)         //CREANDO NAMESPACES
        .on('connection', function(socket){     //CONEXION CON LOS NAMESPACES
                console.log("conectado socket ");
                
                socket.on('autenficacion', function(datos){
                        console.log("autenficacion");
                        console.log(datos);
                        if(datos.room){
                            socket.join(datos.room);
                        }
                        socket.room = datos.room;
                        console.log(socket.room);
                        //Validar el usuario
                        //Indicar que ha sido autentificado y esta listo para la comunicacion con el servidor
                        socket.emit('conectado', {mensaje:'server Conectado!',estado:true});
                });
                socket.on('mensaje', function(datos){
                    console.log("mensaje");
                    console.log("socket.room " + socket.id);
                    console.log(datos);
                    var cuartos = {mensaje:'server solo al room '+socket.room, estado:true,datos:datos};
                    //Todos en el namespace
                    conexiones[empresa.ruc].emit('respuesta::namespace', {mensaje:'server todos respuesta!', estado:true,datos:datos});
                    //room
                    if(socket.room){
                        conexiones[empresa.ruc].to(socket.room).emit('room',{mensaje:'server solo al room '+socket.room, estado:true,datos:datos});
                    }
                    // socket.broadcast.to(room).emit(room, {mensaje:'server solo al room '+room, estado:true,datos:datos});

                    //Mensaje individual
                    socket.emit('respuesta', {mensaje:'server edi solo a ti', estado:true,datos:datos});
                });
                socket.on('sincronizar', function(datos){
                    console.log("sincronizar");
                    console.log("socket.room " + socket.id);
                    console.log(datos);
                    var cuartos = {mensaje:'server solo al room '+socket.room, estado:true,datos:datos};
                    //Todos en el namespace
                    conexiones[empresa.ruc].emit('respuesta::namespace', {mensaje:'server todos respuesta!', estado:true,datos:datos});
                    //room
                    if(socket.room){
                        conexiones[empresa.ruc].to(socket.room).emit('room',{mensaje:'server solo al room '+ socket.room, estado:true,datos:datos});
                        conexiones[empresa.ruc].to(socket.room).emit('sincronizar',{mensaje:'server solo al room '+ socket.room, estado:true,datos:datos});
                    }
                    // socket.broadcast.to(room).emit(room, {mensaje:'server solo al room '+room, estado:true,datos:datos});

                    //Mensaje individual
                    socket.emit('respuesta', {mensaje:'server edi solo a ti', estado:true,datos:datos});
                });
                socket.on('disconnect', function () {
                        socket.leave(socket.room);
                });
        });
    });


    */

};

SocketIo.prototype.getSocket = function(){
    return socket;
};
SocketIo.prototype.getConexiones = function(){
    return conexiones;
};
/**
 * ACCIONES
 */
 var accionesAsistenVirtual = {

 	'sincronizar':function(mensaje, socket){
     	io.clients[mensaje.id].send(JSON.stringify({mensajechatadmin:mensaje.mensaje}));

     }
 };


module.exports = SocketIo;