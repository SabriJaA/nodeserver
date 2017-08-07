var express = require('express');
var hostname = 'localhost';
// var port = 3000;
var port = 27017;
var mongoose = require('mongoose');
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
// var urlmongo = "mongodb://localhost/db_test";
var urlmongo = "mongodb://utblpgat8q40yhl:3jo8ankQU20qLfkhjA62@bdf8ocepnucyo7j-mongodb.services.clever-cloud.com:27017/bdf8ocepnucyo7j";
mongoose.connect(urlmongo, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur lors de la connexion'));
db.once('open', function (){
    console.log("Connexion à la base OK");
});
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // * => allow all origins
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Accept'); // add remove headers according to your needs
    next()
})
var piscineSchema = mongoose.Schema({
    name: String,
    list: Array
});
var listSchema = mongoose.Schema({
    name: String,
    cat_id: String
});
var Piscine = mongoose.model('Test', piscineSchema);
var List = mongoose.model('List', listSchema);
var myRouter = express.Router();
myRouter.route('/')
    .all(function(req,res){
        res.json({message : "Bienvenue sur notre Frugal API ", methode : req.method});
    });

myRouter.route('/category')
    .get(function(req,res){
        console.log('get');
        Piscine.find(function(err, piscines){
            if (err){
                res.send(err);
            }
            res.status(200).send(piscines);
        });
    });
myRouter.route('/addCategory')
    .post(function(req,res){
        var piscine = new Piscine();
        piscine.name = req.body.name;
        piscine.list = [];
        piscine.save(function(err){
            if(err){
                res.send(err);
            }
            res.send(piscine);
        });
    });

myRouter.route('/categoryById/:category_id')
    .get(function(req,res){
        Piscine.findById(req.params.category_id, function(err, piscine) {
            if (err)
                res.send(err);
            res.json(piscine);
        });
    })
    .delete(function(req,res){
        console.log('delete');
        console.log(req.params);
        Piscine.remove({_id: req.params.category_id}, function(err, piscine){
            if (err){
                res.send(err);
            }
            res.status(200).json({_id: req.params.category_id});
        });

    });

myRouter.route('/updateListCategory/:category_id/:list_id')
    .put(function(req,res){
        console.log('put');
        console.log(req.params);
        Piscine.findById(req.params.category_id, function(err, piscine) {
            if (err){
                res.send(err);
            }
            piscine.list.push(req.params.list_id);
            piscine.save(function(err){
                if(err){
                    res.send(err);
                }
                res.json({message : 'Bravo, mise à jour des données OK'});
            });
        });
    })



myRouter.route('/addList')
    .post(function(req,res){
        console.log(req.body.name);
        console.log(req.body.cat_id);
        var list = new List();
        list.name = req.body.name;
        list.cat_id = req.body.cat_id;
        // console.log(req);
        list.save(function(err){
            if(err){
                res.send(err);
            }
            res.send(list);
        });
    });

myRouter.route('/list/:cat_id')
    .get(function(req,res){
        List.find({cat_id: req.params.cat_id}, function(err, list) {
            if (err) {
                res.send(err);
            }
            console.log(list);
            res.status(200).send(list);
        });
    });


app.use(myRouter);
app.listen(port, hostname, function(){
    console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port);
});