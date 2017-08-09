var express = require('express');
var hostname = 'localhost';
var prod = false;
if (prod) {
    var port = 27017;
    var urlmongo = "mongodb://uiqih4yxnei1hpm:wmKFfwvWZufjvb3TGr0V@bus1nkbynrpnrwo-mongodb.services.clever-cloud.com:27017/bus1nkbynrpnrwo";
} else {
    var port = 3000;
    var urlmongo = "mongodb://localhost/db_test_2";
}
var mongoose = require('mongoose');
var options = {
    server: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}},
    replset: {socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}
};
mongoose.connect(urlmongo, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur lors de la connexion'));
db.once('open', function () {
    console.log("Connexion à la base OK");
});
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // * => allow all origins
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token, Accept'); // add remove headers according to your needs
    next()
})
var piscineSchema = mongoose.Schema({
    name: String,
    list: Array,
    search: String,
    icon: String
});
var listSchema = mongoose.Schema({
    name: String,
    cat_id: String
});
var Piscine = mongoose.model('Test', piscineSchema);
var List = mongoose.model('List', listSchema);
var myRouter = express.Router();
myRouter.route('/')
    .all(function (req, res) {
        res.json({message: "Bienvenue sur notre Frugal API ", methode: req.method});
    });

myRouter.route('/category')
    .get(function (req, res) {
        Piscine.find(function (err, piscines) {
            if (err) {
                res.send(err);
            }
            res.status(200).send(piscines);
        });
    });
myRouter.route('/addCategory')
    .post(function (req, res) {
        var piscine = new Piscine();
        piscine.name = req.body.name;
        piscine.search = req.body.search;
        piscine.icon = req.body.icon;
        piscine.list = [];
        piscine.save(function (err) {
            if (err) {
                res.send(err);
            }
            res.send(piscine);
        });
    });

myRouter.route('/categoryById/:category_id')
    .get(function (req, res) {
        console.log(req.params.category_id);
        Piscine.findById(req.params.category_id, function (err, piscine) {
            if (err)
                res.send(err);
            res.json(piscine);
        });
    })
    .delete(function (req, res) {
        console.log('delete');
        Piscine.remove({_id: req.params.category_id}, function (err, piscine) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({_id: req.params.category_id});
        });

    });

myRouter.route('/updateListCategory/:category_id')
    .put(function (req, res) {
        console.log('put updateListCategory');
        Piscine.findById(req.params.category_id, function (err, piscine) {
            if (err) {
                res.send(err);
            }
            console.log(req.body);
            if (piscine.list.indexOf(req.body.params._id) !== -1) {
                piscine.list.splice(piscine.list.indexOf(req.body.params._id), 1);
            } else {
                piscine.list.push(req.body.params._id);
            }
            piscine.save(function (err) {
                if (err) {
                    res.send(err);
                }
                res.status(200).json({_id: req.body.params._id});
            });
        });
    })


myRouter.route('/addList')
    .post(function (req, res) {
        var list = new List();
        list.name = req.body.name;
        list.cat_id = req.body.cat_id;
        // console.log(req);
        list.save(function (err) {
            if (err) {
                res.send(err);
            }
            res.send(list);
        });
    });

myRouter.route('/list/:cat_id')
    .get(function (req, res) {
        List.find({cat_id: req.params.cat_id}, function (err, list) {
            if (err) {
                res.send(err);
            }
            res.status(200).send(list);
        });
    });


myRouter.route('/deleteList/:id')
    .delete(function (req, res) {
        console.log('delete list');
        List.remove({_id: req.params.id}, function (err, list) {
            if (err) {
                res.send(err);
            }
            res.status(200).json({_id: req.params.id});
        });

    });

myRouter.route('/updateList/:id')
    .put(function (req, res) {
        console.log('put updateList');
        List.findById(req.params.id, function (err, list) {
            if (err) {
                res.send(err);
            }
            list.name = req.body.params.name;
            list.save(function (err) {
                if (err) {
                    res.send(err);
                }
                res.status(200).json(list);
            });
        });
    });


app.use(myRouter);
app.listen(port, hostname, function () {
    console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port);
});