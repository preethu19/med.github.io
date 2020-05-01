var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var pssportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");


const url = "mongodb+srv://preethu19:preethu19@cluster0-7tuyz.mongodb.net/test?retryWrites=true&w=majority";
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(url,{useNewUrlParser:true},(err) => {
    if(!err){ console.log("MongoDB Connection Succeeded");}
    else{
        console.log("An Error Occured");
    } 
})
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

app.use(require("express-session")({
	secret : "HelloWorld",
	resave : false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentuser = req.user;
	next();
})


var patientSchema = new mongoose.Schema({
	username:String,
	disorder: String,
	doctor: String,
	description: String,
	created:{type : Date, default: Date.now}
})

var Patient = mongoose.model("Patient", patientSchema);

/*newPatient.visit.push({
	disorder : "hvkjdhvdjvd",
	doctor: "fkuehkfc",
	description:"dghgfv"
})*/

/*newPatient.save(function(err, patient){
	if(err)
		console.log(err)
	else
		console.log(patient)
	
})*/

/*Patient.findOne({name: "Rajesh"}, function(err, patient){
	if(err)
		console.log(patient)
	else
		patient.visit.push({
			disorder : "hello hello",
	doctor: "M.S.E",
	description:"bla bla bla"
		})
	patient.save(function(err,patient){
	if(err)
		console.log(err)
	else
		console.log(patient);
	})
})*/


app.get("/", function(req,res){
	res.render("home");
})

app.get("/visits",isLoggedIn, function(req,res){
  Patient.find({},function(err, patients){
  if(err)
    console.log(err);
  else
    res.render("index", {patients:patients, currentuser : req.user});
  })
  
})
app.get("/visits/new", function(req,res){
	res.render("visits/new");
})

app.post("/visits/new", function(req,res){
Patient.create(req.body.patient, function(err,visit){
	if(err)
		res.render("/visits/new")
	else
		res.redirect("/visits");
})
})

app.get("/visits/:id", function(req,res){
	Patient.findById(req.params.id, function(err, foundPatient){
		if(err)
			res.redirect("/visits");
		else
			res.render("show", {patient: foundPatient})
	})
})

app.get("/register",  function(req,res){
res.render("register");
})

app.post("/register", function(req,res){
      var user=req.body.username
	req.body.password
	User.register(new User({username:req.body.username}),req.body.password, function(err,user){
		if(err){
			console.log(err)
		return res.render("register");
	}
	passport.authenticate("local")(req,res, function(){
			res.redirect("/visits/new");
	})
	})
})


app.get("/login", function(req,res){
	res.render("account");
})

app.post("/login",passport.authenticate("local",{
	successRedirect: "/visits",
	failureRedirect: "/login"
}), function(req,res){
	
});

app.get("/logout",function(req,res){
req.logout();
	res.redirect("/");
})

function isLoggedIn(req, res, next){
if(req.isAuthenticated()){
	return next();
}
	res.redirect("/login");
}

function newly(username){
	var newPatient = new Patient({
	username : "username"
})
};


app.listen(process.env.PORT||4000,process.env.IP, function(){
	console.log("Server listening on port 4000");
})
