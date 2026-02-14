const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const admin = await User.findOne({ institutionalId: "ADMIN-001" });
        
        if (!admin) {
            console.log("❌ ADMIN-001 not found in DB!");
        } else {
            console.log("✅ Admin found:", admin.email);
            console.log("Stored Hash:", admin.password);
            
            const isMatch = await bcrypt.compare("123456", admin.password);
            console.log("Password '123456' match:", isMatch);
            
            if (!isMatch) {
                console.log("Attempting to fix password...");
                admin.password = "123456"; // Will be hashed by pre-save hook
                await admin.save();
                console.log("✅ Password reset to '123456'");
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
