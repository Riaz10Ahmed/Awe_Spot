var mongoose=require("mongoose");

var spotSchema = new mongoose.Schema({
	name: String,
	budget: String,
	image: String,
	desc: String,
	createdAt:{
		type:Date,
		default:Date.now
	},
	author:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
         	ref: "User"
		},
		username:String
	},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Spots",spotSchema);
