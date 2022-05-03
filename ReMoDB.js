//------------------IMPORT--------------
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const mongoose = require('mongoose');
//For Redis-----
const axios = require('axios');
const cors = require('cors');
const Redis = require('redis');

//-----------------IMPORT JS FILES-----------
const secrets = require('./secrets');



//------------------DATABASE CONFIG-------------
//-------------------MongoDB--------------
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


//-------------Redis----------------------------
//---------------CLOUD REDIS------------------------------------
const redisClient = Redis.createClient({
    //When commented data will be saved on local Redis instance (there should be much faster response)
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    legacyMode: true            //Need this 1 -this is connected
});
//--------------------------------------------------------

//---------------LOCAL REDIS------------------------------
// const redisClient = Redis.createClient({
//     legacyMode: true
// });
//--------------------------------------------------------

redisClient.on('error', err => {
    console.log( err);
});

redisClient.connect();          //Need this 2  - this is connected


//------------------SERVER CONFIG--------------
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static('public'));
LAN_PORT=5000;

let port = process.env.PORT; //use the port form heroku website
if (port == null || port ==''){
    port = LAN_PORT;
}
app.use(cors())


//------------------API LOGIC-------------


app.get('/dataFromDB-ALL', async( req, res) => {

    // const query = req.query.zapytanie;
    const articles = await getOrSetCache('dataALL', async () => {
        const { data } = await axios.get(
            'http://localhost:5000/articles'
        )
        return data
    })
    res.json(articles)
})

app.get('/dataFromDB-CHOOSE', async( req, res) => {

    const tittle = req.query.tittle;
    const article = await getOrSetCache('data' + tittle, async () => {
        const { data } = await axios.get(
            'http://localhost:5000/articles/' + tittle
        )
        return data
    })
    res.json(article)
})

//app routes -- target all articles
app.route("/articles")
.get( async (req, res)=> {

    Article.find({
    },function(err, msg){
        if (!err) {
            res.json(msg);
        }else{
            res.json(err);
            console.log('Error: GET ARTICLES \n: ' + err);
        }
        
    })

})

.post(function (req, res) {

    // console.log(req + '\n' + req.body + '\n' + 
    // req.body.title + '\n' + req.body.content)
    
    console.log(req.headers['content-type']);
    console.log(req.body.title);

    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
    })
    
    console.log(newArticle.content);


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

//----------------Redis function (Check if element exist in Redis cache) ----
function getOrSetCache(key, callback){
    return new Promise((resolve, reject) => {
        redisClient.get(key, async (error, data) => {
            if (error) return reject(error)
            if (data != null) {
                console.log('Cache HIT');
                return resolve(JSON.parse(data))
            } else {
                console.log('Cache MISS');
                const freshData = await callback()
                redisClient.set(key, JSON.stringify(freshData))
                resolve(freshData)
            }
            
        })
    })
}




//------------------SERVER CONFIG ----------------------
app.listen(port, function(){
    console.log('Sever has started successfully on port: ' + port);
})