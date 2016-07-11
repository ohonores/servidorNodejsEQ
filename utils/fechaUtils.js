var fecheestilo='dmy';
var FechaUtils = function(fecheestilo_) {fecheestilo = fecheestilo_};


FechaUtils.prototype.formatDate = function (d,separador,hora) {

 if(d instanceof Date){
	 var mm = d.getMonth()+1
	  if ( mm < 10 ) mm = '0' + mm
	  var dd = d.getDate();
	  if ( dd < 10 ) dd = '0' + dd



	  var yy = d.getFullYear();
	  if ( yy < 10 ) yy = '0' + yy
	  if(hora && hora == true){
		switch(fecheestilo){
			case 'mdy':
			return '\''+mm+separador+dd+separador+yy+' 23:59:59\''
			case 'dmy':
			return '\''+dd+separador+mm+separador+yy+' 23:59:59\''
		}
	  }
	  switch(fecheestilo){
		case 'mdy':
		return '\''+mm+separador+dd+separador+yy+'\''
		case 'dmy':
		return '\''+dd+separador+mm+separador+yy+'\''
	  }

 }else{
	return formatDateV2(d,separador, hora);
  }
}

function formatDateV2(d,separador,hora) {
  if(d.split('-').length > 1){
	  d = d.replace(/-/g,'');
	  var dd = d.slice(6,8);
	  if ( dd.length < 2 ) dd = '0' + dd
	  var mm = d.slice(4,6)
	  if ( mm.length < 2 ) mm = '0' + mm

	  var yy = d.slice(0,4);


	if(hora && hora == true){
		 switch(fecheestilo){
			case 'mdy':
			return '\''+mm+separador+dd+separador+yy+' 23:59:59\''
			case 'dmy':
			return '\''+dd+separador+mm+separador+yy+' 23:59:59\''
		}
	  }
	 switch(fecheestilo){
		case 'mdy':
			return '\''+mm+separador+dd+separador+yy+'\'';
		case 'dmy':
			return '\''+dd+separador+mm+separador+yy+'\'';
	}
  }
  var dd = d.slice(0,2);
  if ( dd.length < 2 ) dd = '0' + dd
  var mm = d.slice(2,4)
  if ( mm.length < 2 ) mm = '0' + mm

  var yy = d.slice(4,8);

  if(hora && hora == true){
		 switch(fecheestilo){
			case 'mdy':
				return '\''+mm+separador+dd+separador+yy+' 23:59:59\''
			case 'dmy':
				return '\''+dd+separador+mm+separador+yy+' 23:59:59\''
		}
	}
	switch(fecheestilo){
		case 'mdy':
			return '\''+mm+separador+dd+separador+yy+'\'';
		case 'dmy':
			return '\''+dd+separador+mm+separador+yy+'\'';
	}
}

FechaUtils.prototype.getParametroCondiciiones = function() {
 //MMyyyydd condicones
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd



  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return 'c'+mm+''+yy+''+dd;
};
FechaUtils.prototype.getParametroCaptcha = function() {
 //ddyyyyMM captcah
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd



  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return dd+''+yy+''+mm;
}
FechaUtils.prototype.getParametroCodigo = function() {
 //yyyyddMM codigo
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd



  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return yy+''+dd+''+mm;
};
FechaUtils.prototype.getParametroClave = function() {
 //ddMMyyyy codigo/email
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd



  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return dd+''+mm+''+yy;
};

FechaUtils.prototype.getParametroNuevaClave = function() {
 //MMddyyyy codigo/email
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd



  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return 'n'+mm+''+dd+''+yy;
};

FechaUtils.prototype.getParametroReNuevaClave = function() {
 //ddyyyyMM codigo/email, ddyyyyMM
 var d = new Date();
 var mm = d.getMonth()+1
  if ( mm < 10 ) mm = '0' + mm
  var dd = d.getDate();
  if ( dd < 10 ) dd = '0' + dd



  var yy = d.getFullYear();
  if ( yy < 10 ) yy = '0' + yy

  return 'r'+dd+''+yy+''+mm;
}
module.exports = FechaUtils;
