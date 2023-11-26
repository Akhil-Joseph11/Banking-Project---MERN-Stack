var express= require("express"),
bodyParser = require("body-parser"),
mongoose = require("mongoose"),
Customer = require("./models/customer"),
Account = require("./models/account"),
passport = require("passport"),
localStrategy = require("passport-local"),
seed = require("./seed"),
sequential = require("sequential-ids"),
seqid = require("./models/seqid"),
Employee = require("./models/employee"),
User = require("./models/user"),
Benificiary = require("./models/benificiary"),
Transactions = require("./models/transactions"),
Checks = require("./models/checks");


var employeeRoutes =require("./routes/employee"),
customerRoutes = require("./routes/customer"),
accountRoutes = require("./routes/account"),
authRoutes = require("./routes/auth"),
benificiaryRoutes = require("./routes/benificiary"),
transactionRoutes = require("./routes/transactions"),
accstatementRoutes = require("./routes/accountstats"),
checkRoutes = require("./routes/check");

function preceedzero(n){
    var s = n+"";
    while (s.length < 4) s = "0" + s;
    return s;
}
function genid(n){
    var s = "2020"+preceedzero(n);
    return s;
}

// seed()
var app = express();


// // REPLICA SET

mongoose.connect("mongodb://localhost/premierebank");

app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));

app.use(bodyParser.urlencoded({extended:true}));


app.use(require("express-session")({
    secret: "This is a secret code for bank",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser= req.user;
    console.log(req.user)
    // res.locals.error= req.flash("error");
    // res.locals.success= req.flash("success");
    next();
})  

app.use(employeeRoutes);
app.use(accountRoutes);
app.use(authRoutes);
app.use(customerRoutes);
app.use(benificiaryRoutes);
app.use(transactionRoutes);
app.use(accstatementRoutes);
app.use(checkRoutes);


app.get("/",isLoggedIn,function(req,res){
    res.render("home");
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

 app.listen(3000,function(req,res){
    console.log("Hey!!, This website is working at port 3000");
})

