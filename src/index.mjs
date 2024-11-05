import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import mongoose from "mongoose";
import MongoDBStore from "connect-mongodb-session";
import session, { Cookie } from "express-session";
import crypto from 'crypto';
import cors from 'cors';

// import connect-mongodb-session from "connect-mongodb-session"(session);
import { User } from '../mongoose/schemas/database.mjs'; // Import User model
import { Session } from '../mongoose/schemas/database.mjs'; // Import Session model

import { validateSession } from '../utils/middlewares.mjs'; // Import Validate Session Middleware
import axios from "axios"; // For making HTTP requests to the Telegram API


const mongoUri = process.env.MONGODB_URI; // MongoDB connection string

// MongoDB Database Connection
mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to Database"))
    .catch(err => console.error("MongoDB connection error:", err));



// Set up session storage with MongoDB
const MongoDBStoreSession = MongoDBStore(session);
const store = new MongoDBStoreSession({
    uri: mongoUri,
    collection: "sessions",
});
store.on('error', function(error) {
    console.error("Session Store Error:", error);
  });
  

// Load environment variables from .env file
config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Generate a random session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}
const sessionToken = generateSessionToken();

// Configure express-session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || sessionToken,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day session expiration
    },
}));


// Get the Telegram Bot Token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true }); // Start bot with polling


app.post('/start-session', async (req, res) => {
    const { userTelegramId, isPremiumUser } = req.body;
    req.session.userTelegramId = userTelegramId;
    req.session.isPremium = isPremiumUser;

    res.status(200).json({ message: "Session started!" });
});

// Handle the /start command
bot.onText(/\/start/, async (msg) => {

    // Fetching User's telegram Id and Chat's id
    const userTelegramId = msg.from.id;

    
    // Properly construct username or fallback to first name
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;
    const isPremiumUser = msg.from.is_premium || false;

     // Send request to start-session route
     await axios.post(`http://localhost:${PORT}/start-session`, {
        userTelegramId,
        isPremiumUser
    });

    // isPremium Validation Message
    const premiumMessage = isPremiumUser
        ? "You are a Telegram Premium user! Enjoy exclusive benefits 🎉"
        : "You are using the regular version of Telegram.";

    const welcomeMessage = `Hey ${username}, Welcome to RaveGenie! Get ready to earn shares for completing specific tasks! Are you a premium user ${premiumMessage}`;

    // Options for inline keyboard
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Join Group", url: "https://www.youtube.com/watch?v=UQrcOj63S2o" },
                    { text: "Join Channel", url: "https://t.me/ravegeniegames" },
                ],
                [
                    {
                        text: "View RaveGenie Games",
                        web_app: {
                            url: "https://zeenstreet.vercel.app",
                        },
                    }
                ]
            ],
        },
    };

    try {
        const existingUser = await User.findOne({ userId: userTelegramId.toString() });

    
        async function checkActivityLevel(userTelegramId) {
            if (existingUser) {
                // Assuming you have a count of commands sent
                const messageCount = existingUser.messageCount || 0;
                if (messageCount > 100) return 100;
                if (messageCount > 50) return 70;
                if (messageCount > 10) return 50;
                return 0;
            }
            return 'No activity data';
        }
        async function checkIsPremium(userTelegramId) {
          
           let isPremium = msg.from.is_premium || false;

            if(isPremium)
            {
                return isPremium = 100;
            }
            else{
               return  isPremium = 0;

            }
        }

        if (!existingUser) {
            // Save first contact time if user is new
            const newUser = new User({
                userId: userTelegramId.toString(),
                username: username,
                firstContact: new Date(), // Log the first contact time
                isPremium: await checkIsPremium(userTelegramId),
                activityLevel: await checkActivityLevel(msg.from.id), // Function to check activity level
                ogLevel:100,
                accountAge:100,

            });
            await newUser.save();
            bot.sendMessage(userTelegramId, `Welcome ${username}, you have been added to our database!`);
        } else {
            bot.sendMessage(userTelegramId, `Welcome back ${username}!`);
        }
    } catch (error) {
        console.error("Error handling /start command:", error);
    }

    // Send welcome message with inline keyboard
    bot.sendMessage(userTelegramId, welcomeMessage, options);
});



// Get user data by ID
app.get('/api/checkactivity/:id', async (req, res) => {
    try {
        const user = await User.findById( req.params.id); // Fetch user by ID

        if(!user){
            return res.status(404).json({ message: "User not found" }); // Return JSON for 404
        }
        
        // res.json(user); // Return user data as JSON

        res.json({
            accountAge: user.accountAge,
            activityLevel: user.activityLevel,
            isPremium: user.isPremium,
            ogLevel: user.ogLevel
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message }); // Return JSON for server errors
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
