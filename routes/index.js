var express = require('express');
var TipoBrowser = require('../utils/tipoBrowser.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(TipoBrowser.browserAceptado(req)){
        res.render('home/index.html');
    }else{
        res.render('versiones-anteriores/index.html');
    }


});

//The 404 Route (ALWAYS Keep this as the last route)
/*router.get('*', function(req, res, next){
   res.render("404/404.html");
});*/
module.exports = router;
