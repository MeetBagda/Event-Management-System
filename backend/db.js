const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");

mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  password: {
    type: String,
    required: true,
  },
});
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  }, 
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  category: String,
  location: {
    type: String,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }],
  maxAttendees: {
    type: Number,
    min: 0,
  },
  imageUrl: String, 
  price: {
    type: Number,
    min: 0,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Event = mongoose.model("Event", eventSchema);

module.exports = {
  User,Event
};