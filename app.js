const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const product = require('./Model/product');
const user = require('./Model/user');
const cookieParser = require('cookie-parser');
var userId = "";





const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));



mongoose.connect('mongodb://127.0.0.1:27017/ECom')
    .then(() => console.log('Connected!'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    //  cookie: { secure: true }
}))

app.use(cookieParser());



app.get('/signup',(req, res) => {

    res.render('signup');

    // if (req.session.username) {
    //     res.redirect('/');
    // } else {
    //     res.render('signup');
    // }
})

app.post('/signup', async (req, res) => {

    const {
        username,
        password,
        email
    } = req.body;

    const hashPass = await bcrypt.hash(password, 10);

  const newUser =   await user.create({
        username,
        password: hashPass,
        email
    });

     console.log(newUser._id);

     userId = newUser._id.toString();

     console.log(userId);

    res.redirect('/login');

});

app.get('/login', (req, res) => {

    res.render('login');

})

app.post('/login', async (req, res) => {

    const {
        username,
        password
    } = req.body;

    const ppl = await user.findOne({
        username
    });

    if (ppl) {


        const flag = await bcrypt.compare(password, ppl.password);

        if (flag) {
            // req.session.username = username;

        
           
            userId = ppl._id.toString();

            const token = jwt.sign({ _id: userId },"hello",{ expiresIn : "1h" });

            
            // console.log(token);
            
            res.cookie('token', token, { httpOnly: true , expires : new Date(Date.now() + 3600000) });

            res.redirect('/');
        } else {
            res.redirect('/login');
        }

    } else {

        res.redirect('/signup');

    }


})

var check = (req, res, next) => {


    try{
        const token = req.cookies.token;

        // console.log(token);

        if(!token){
            res.redirect('/login');
        }

         jwt.verify(token,"hello",(err,decoded)=>{
            if(err){
                // res.redirect('/login');
            }
            else{
                next();
            }
         })
       
    }
    catch (err){
        console.log(err);
        // res.clearCookie("token");
    //    return res.redirect('signup');
    }

    // if (req.session.username) {
    //     next();
    // } else {
    //     res.redirect('/signup');
    // }

}

app.get('/logout',(req,res)=>{

    // req.session.username = null;

    res.clearCookie('token');

    res.redirect('/');


})

app.get('/', check, async (req, res) => {


    const products = await product.find({userId : userId});

    res.render('home', {
        products
    })
});

app.get('/delete/:_id', async (req,res)=>{

    const{_id} = req.params;

    console.log(_id);

    const deletedItem = await product.findByIdAndDelete(_id);

    res.redirect('/');


    
    

})

app.get('/add', (req, res) => {
    res.render('add');
})

app.post('/add', async (req, res) => {

    const {
        namee,
        image,
        description,
        price,
        rating
    } = req.body;

    await product.create({
        userId,
        namee,
        image,
        description,
        price,
        rating
    });

    res.redirect('/');

})

app.listen('4000', () => {
    console.log("working");
});