var express 		= require("express");
var	app				= express();
var	bodyParser  	= require("body-parser");
var	mongoose    	= require("mongoose");
var passport		= require("passport");
var LocalStrategy 	= require("passport-local");
var Spots 		 	= require("./models/spots");
var Comment 		= require("./models/comments");
var User 			= require("./models/user");
var methodOverride  = require("method-override");
var flash			= require("connect-flash");
// var seedDB			= require("./seeds");

// seedDB();
mongoose.connect("mongodb://localhost/awe_spot",{ useNewUrlParser: true ,useFindAndModify: false});
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
app.use(require("express-session")({
	secret: "Riaz ia a bad boy",
	resave:false,
	saveUninitialized:false
}));

//=====================
//PASSPORT CONFIG
//=====================

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
	res.locals.user = req.user;
	res.locals.error = req.flash("error"); 
	res.locals.success = req.flash("success"); 
	next();
});

//===================
//ROUTES
//===================

//LANDING ROUTE

app.get("/",function(req,res){
	res.render("landing"); 
}); 

//===================
//SPOTS ROUTES
//===================

//INDEX SPOT ROUTE

app.get("/spot",function(req,res){
	Spots.find({},function(err,allSpots){
		if(err){
			console.log(err);
		}else{
			res.render("index",{spot:allSpots});
		}
	});
});

//NEW SPOT ROUTE

app.get("/spot/new",isLoggedIn,function(req,res){
	res.render("newSpot");
});

//CREATE SPOT ROUTE

app.post("/spot",isLoggedIn,function(req,res){
	var name 	= req.body.name;
	var image 	= req.body.image;
	var desc 	= req.body.desc;
	var budget   = req.body.budget;
	var author	= {
		id: req.user._id,
		username: req.user.username
	}
	var object = {name:name, image:image, desc:desc, budget:budget, author:author};
	Spots.create(object,function(err,newSpot){
		if(err){
			console.log(err);
		}else{
			req.flash("success","A new spot created successfully !")
			res.redirect("/spot");
		}
	});
});

//VIEW SPOT ROUTE

app.get("/spot/:id",function(req,res){
	Spots.findById(req.params.id).populate("comments").exec(function(err,spot){
		if(err){
			console.log(err);
		}else{
			res.render("showSpot",{spot:spot});
		}
	});
});

//EDIT SPOT ROUTE

app.get("/spot/:id/edit",authorizeUser,function(req,res){
		Spots.findById(req.params.id,function(err,foundSpot){
		res.render("editSpot",{spot:foundSpot});
	});
});

//UPDATE SPOT ROUTE

app.put("/spot/:id",authorizeUser,function(req,res){
	Spots.findByIdAndUpdate(req.params.id, req.body.spot, function(err,updatedSpot){
		if(err){
			console.log(err);
		}else{
			req.flash("success","Awe Spot Updated !");
			res.redirect("/spot/" + req.params.id);
		}
	});
});

//DELETE SPOT ROUTE

app.delete("/spot/:id",authorizeUser,function(req,res){
	Spots.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}else{
			req.flash("success","Awe Spot deleted!");
			res.redirect("/spot")
		}
	});
});


//==================
//COMMENTS ROUTE
//==================

app.get("/spot/:id/comment/new",isLoggedIn,function(req,res){
	Spots.findById(req.params.id,function(err,spot){
		if(err){
			console.log(err);
		}else{
			res.render("newComment",{spot:spot});
		}
	});
});

app.post("/spot/:id/comment",isLoggedIn,function(req,res){
	Spots.findById(req.params.id,function(err,spot){
		if(err){
			req.flash("error","Oops ! Something went wrong ! ");
			console.log(err);
		}else{
			Comment.create(req.body.comments,function(err,comment){
				if(err){
					console.log(err);
				}else{
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save(); 
					spot.comments.push(comment);
					spot.save();
					req.flash("success","Hurray ! Comment added Successfully ! ")
					res.redirect("/spot/");
				}
			});
 		}
	});
});

//EDIT COMMENTS ROUTE

app.get("/spot/:id/comment/:comment_id/edit",authorizeUserComment,function(req,res){
	Comments.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			console.log(err);
		}else{
			res.render("editComment",{spot_id:req.params.id, comment:foundComment})
		}
	});
});


//UPDATE COMMENTS ROUTE

app.put("/spot/:id/comment/:comment_id",authorizeUserComment,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updComment){
		if(err){
			console.log(err);
		}else{
			req.flash("success","Comment Updated !");
			res.redirect("/spot/"+req.params.id);
		}
	});
});

//DELETE COMMENTS ROUTE

app.delete("/spot/:id/comment/:comment_id",authorizeUserComment,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err,deleteComment){
		if(err){
			console.log(err);
		}else{
			req.flash("success","Comment deleted!");
			res.redirect("/spot/" + req.params.id);
		}
	})
});

//===============
//AUTH ROUTES
//===============

//SIGNUP ROUTE

app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	var newUser = new User({ username:req.body.username });
	User.register(newUser, req.body.password,function(err,user){
		if(err){
			console.log(err);
			req.flash("error",err.message);
			res.redirect("/register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success"," Registered Successfully ! ! Welcome to AweSpot  "+ user.username);
			res.redirect("/spot");
		});
	});
});

//LOGIN ROUTE

app.get("/login",function(req,res){
	res.render("login");
});

app.post("/login",passport.authenticate("local",{
		successRedirect:"/spot",
		failureRedirect:"/login"
	}),function(req,res){
});

//LOGOUT ROUTE

app.get("/logout",function(req,res){
	req.logout();
	req.flash("success","Logged you Out!");
	res.redirect("/spot");
});

//====================
//MIDDLEWARE
//====================

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in to do that!");
	res.redirect("/login");
}

function authorizeUser(req,res,next){
	if(req.isAuthenticated()){
			Spots.findById(req.params.id,function(err,authSpot){
			if(err){
				req.flash("error","Oops ! Spot not found !");
				console.log(err);
			}else{
				if(authSpot.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error","Sry ! You don't have permissions to do that ! ! ");
					res.redirect("back");
				}
			}
		});
		}else{
			req.flash("error","Sry ! You need to be logged in to do that ! ! ");
			res.redirect("/login");
	}
}

function authorizeUserComment(req,res,next){
	if(req.isAuthenticated()){
			Comment.findById(req.params.comment_id,function(err,authComment){
			if(err){
				req.flash("error","Oops ! Something went wrong !");
				console.log(err);
			}else{
				if(authComment.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error","Sry ! You don't have permissions to do that ! ! ");
					res.redirect("back");
				}
			}
		});
		}else{
			req.flash("error","Sry ! You need to be logged in to do that ! ! ");
			res.redirect("/login");
	}
}



app.listen(8000,function(){
	console.log("AWE SPOT HAS STARTED!!");
});






