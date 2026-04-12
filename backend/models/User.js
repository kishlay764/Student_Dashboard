const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
    badges: [{ type: String }],
    productivityScore: { type: Number, default: 0 }
});

module.exports = mongoose.model("User", userSchema);