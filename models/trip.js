const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    name: String,
    description: String,
    googleRequest: String,
});
module.exports= mongoose.model("Trip", tripSchema);