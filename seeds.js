var mongoose    = require("mongoose");
var Spots = require("./models/spots");
var Comment = require("./models/comments");

var data=[
		  { name:"Shallow creek", 
            image:"https://farm6.staticflickr.com/5181/5641024448_04fefbb64d.jpg" ,
            desc:"lorem ipsum iam the good boy of the good citizen treat in there eternal fate site good time with you right now thinking what iam capable of with this ti the ringer fight with you.."},
		  { name:"Wolf creek", 
            image:"https://farm8.staticflickr.com/7252/7626464792_3e68c2a6a5.jpg",
            desc:"lorem ipsum iam the good boy of the good citizen treat in there eternal fate site good time with you right now thinking what iam capable of with this ti the ringer fight with you.."},
		  { name:"Willow creek", 
            image:"https://farm3.staticflickr.com/2116/2164766085_0229ac3f08.jpg",
            desc:"lorem ipsum iam the good boy of the good citizen treat in there eternal fate site good time with you right now thinking what iam capable of with this ti the ringer fight with you.."}
		  ]

function seedDB(){
   //Remove all campgrounds
   Campgrounds.deleteMany({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed campgrounds!");
        Comment.deleteMany({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed comments!");
             //add a few campgrounds
    //         data.forEach(function(seed){
    //             	Campgrounds.create(seed, function(err, campground){
    //                 if(err){
    //                     console.log(err)
    //                 } else {
    //                     console.log("added a campground");
    //                     //create a comment
    //                     Comment.create(
    //                         {
    //                             text: "This place is great, but I wish there was internet",
    //                             author: "Homer"
    //                         }, function(err, comment){
    //                             if(err){
    //                                 console.log(err);
    //                             } else {
    //                                 campground.comments.push(comment);
    //                                 campground.save();
    //                                 console.log("Created new comment");
    //                             }
    //                         });
    //                 }
    //             });
    //         });
        });
    }); 
}

module.exports = seedDB;
