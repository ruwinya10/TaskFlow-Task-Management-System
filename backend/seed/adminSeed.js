const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");


dotenv.config();


const createAdmin = async () => {

    try {

        await connectDB();


        const adminEmail = "admin@lesstaxi.com";


        const existingAdmin = await User.findOne({
            email: adminEmail
        });


        if (existingAdmin) {

            console.log("Admin already exists.");

            process.exit(0);
        }


        const hashedPassword = await bcrypt.hash(
            "Admin123!",
            10
        );


        await User.create({
            name: "Less Taxi Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });


        console.log("Admin created successfully.");

        console.log("Email: admin@lesstaxi.com");

        console.log("Password: Admin123!");


        process.exit(0);


    } catch (error) {

        console.error(
            "Failed to create admin:",
            error.message
        );

        process.exit(1);
    }
};


createAdmin();