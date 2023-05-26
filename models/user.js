const   mongoose                = require("mongoose"),
        passportLocalMongoose   = require("passport-local-mongoose");

const userSchema =  new mongoose.Schema({
    username: String,
    password: String,
    trips: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
