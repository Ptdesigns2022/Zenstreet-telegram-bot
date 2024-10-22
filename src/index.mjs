import express from "express";
import bodyParser from "body-parser";
import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Get the Telegram Bot Token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true }); // Start bot with polling

// Handle the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    // Properly construct username or fallback to first name
    const username = msg.from.username ? `@${msg.from.username}` : msg.from.first_name;

    const welcomeMessage = `Hey ${username}, Welcome to RaveGenie! Get ready to earn shares for completing specific tasks!`;
    
    // Options for inline keyboard
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Join Group", url: "https://www.youtube.com/watch?v=UQrcOj63S2o" },
                    { text: "Join Channel", url: "https://www.youtube.com/watch?v=UQrcOj63S2o" },
                ],
                [
                    {
                        text: "View RaveGenie",
                        web_app: {
                            url: "https://zeenstreet.vercel.app",
                        },
                    }
                ]
            ],
        },
    };

    // Send welcome message with inline keyboard
    bot.sendMessage(chatId, welcomeMessage, options);
});

// Uncomment and configure the webhook route if you decide to use webhooks instead of polling
// app.post(`/webhook/${token}`, (req, res) => {
//     const message = req.body.message;
//     if (message) {
//         const chatId = message.chat.id;
//         const text = message.text;

//         // Reply to the user
//         bot.sendMessage(chatId, `You said: ${text}`);
        
//         // Send a response back to Telegram
//         res.sendStatus(200);
//     } else {
//         res.sendStatus(400);
//     }
// });

// Set the webhook URL (Uncomment if using webhooks)
// const setWebhook = async () => {
//     const url = `https://your-ngrok-url/webhook/${token}`; // Replace with your actual ngrok URL
//     const response = await bot.setWebHook(url);
//     console.log('Webhook set:', response);
// };

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Uncomment this line if using webhooks
    // setWebhook(); // Set the webhook when the server starts
});
