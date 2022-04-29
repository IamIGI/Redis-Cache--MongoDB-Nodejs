//------------------IMPORT--------------
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');

//-----------------IMPORT JS FILES-----------
const secrets = require('./secrets');


//------------------SERVER CONFIG--------------
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static('public'));
LAN_PORT=5000;

//------------------SERVER CONFIG [ CLOSE CONNECTION ]---------------------
let port = process.env.PORT; //use the port form heroku website
if (port == null || port ==''){
    port = LAN_PORT;
}


//------------------DATABASE CONFIG-------------
mongoose.connect(secrets.mongoDB_connect, 
    {useNewUrlParser: true}   //mute extra  mongodb errors
    );
//________Schemas
const articlesSchema = {
    title:String,
    content: String
}
//________Model
const Article = mongoose.model('Article', articlesSchema);

//------------------API LOGIC-------------

//app routes -- target all articles
app.route("/articles")

.get(function(req, res){

    Article.find({
    },function(err, msg){
        if (!err) {
            res.send(msg);
        }else{
            res.send(err);
            console.log('Error: GET ARTICLES \n: ' + err);
        }
        
    })

})

.post(function (req, res) {

    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
    })
    
    newArticle.save(function(err){
        if(!err){
            res.send('Successfully added a new article.');
        } else {
            res.send(err);
        }
    });
})

.delete( function (req, res) {

    Article.deleteMany({
    }, function(err){
        if(!err){
            res.send('Successfully deleted an article.');
        } else {
            res.send(err);
        }
    })
});

//app routes -- target specific articles
app.route("/articles/:articleTitle")

.get(function(req, res){

    Article.findOne({
        title: req.params.articleTitle
    },function(err, msg){
        if (!err) {
            res.send(msg);
        }else{
            res.send('No article match this specific request\n'+ err);
            console.log('Error: GET ARTICLES \n: ' + err);
        }
        
    })

})


.put(function (req, res) {

    // console.log(req.params.articleTitle + '\n' +  req.body.title + '\n' + req.body.content);

    Article.updateOne({
        title: req.params.articleTitle
    },{
        title: req.body.title,
        content: req.body.content
    }, 
    function(err,msg){
        if(!err){
            res.send('Successfully updated article:' + req.body.title );
        } else {
            res.send(err);
        }
    });
})


.patch( function (req, res){

    Article.updateOne({
        title: req.params.articleTitle
    },{
        $set: req.body
    }, 
    function(err,msg){
        if(!err){
            res.send('Successfully updated article: ' + req.params.articleTitle );
        } else {
            res.send(err);
        }
    });
})

.delete( function (req, res) {

    Article.deleteMany({
        title: req.params.articleTitle
    }, function(err){
        if(!err){
            res.send('Successfully deleted an article.');
        } else {
            res.send(err);
        }
    })
});


app.listen(port, function(){
    console.log('Sever has started successguly on port: ' + port);
})