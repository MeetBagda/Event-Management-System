const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const eventSchema = new mongoose.Schema({
  title: String, 
  description: String, 
  startTime: Date,
  endTime: Date, 
  category: String,
  location: String,
  organizer: ObjectId, 
  attendees: [ObjectId], 
  maxAttendees: Number,
  imageUrl: String, 
  price: Number,
});

const User = mongoose.model("User", userSchema);
const Event = mongoose.model("Event", eventSchema);
