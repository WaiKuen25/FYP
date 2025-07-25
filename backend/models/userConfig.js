const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userId: {
    type: Number,
    unique: true,
    required: true,
  },
  studentId: {
    type: Number,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  profilePic: {
    type: String,
    default: "",
  },
  friend: {
    type: [Number],
    default: [],
  },
  block: {
    type: [Number],
    default: [],
  },
  followCategory: {
    type: [Number],
    default: [],
  },
  filterWord: {
    type: [String],
    default: [],
  },
  lang: {
    type: String,
    default: "en",
  },
  theme: {
    type: String,
    default: "",
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
  },
  history: [{
    time: {
      type: Date,
      default: Date.now,
    },
    postId: {
      type: Number,
      required: true, 
    }
  }],
  favourite: [{
    time: {
      type: Date,
      default: Date.now,
    },
    postId: {
      type: Number,
      required: true
    }
  }]
});

// Export the model
module.exports = mongoose.model("userConfig", userSchema);
