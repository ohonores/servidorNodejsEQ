// Part of https://github.com/chris-rock/node-crypto-examples
// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = '12999999393IEWKDUFDHJU434-.?';
	
function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
function decryptMD5(text){
  var decipher = crypto.createDecipher("md5","dd")
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
var SeguridadEDC = function () {};



SeguridadEDC.prototype.encriptar = function(texto){
	return encrypt(texto);
};


SeguridadEDC.prototype.desencriptar = function(texto){
	return decrypt(texto);
};

module.exports = new SeguridadEDC();
console.log(encrypt("alien200525"));