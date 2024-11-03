// Generate a random session token
// function generateSessionToken() {
//     return crypto.randomBytes(32).toString('hex');
// }


// app.post('/login', async (req, res) => {
//     // Check if a session already exists for the user

//     let session = await Session.findOne({ userTelegramId });
//     if (session) {
//         return res.status(200).json({ message: "You're already logged in!", sessionToken: session.sessionToken });
//     }

//     // Create and save a new session
//     const sessionToken = generateSessionToken();
//     session = new Session({ userTelegramId, sessionToken });
//     await session.save();
//     res.status(201).json({ message: "Logged in successfully!", sessionToken });
// });

// app.post(`/telegram/${token}`,  validateSession, async (req, res) => {
//     const message = req.body.message;
//     const userTelegramId = message.from.id;
//     const text = message.text;

//     if (text === '/login') {
//         // Call login endpoint to create a session
//         const response = await fetch('http://localhost:5000/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ userTelegramId }),
//         });
//         const data = await response.json();
//         await sendMessage(userTelegramId, data.message);
//     } else {
//         await sendMessage(userTelegramId, "Welcome! Send /login to start a session.");
//     }
//     res.sendStatus(200);
// });

// // Helper function to send messages via Telegram
// async function sendMessage(chatId, text) {
//     await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ chat_id: userTelegramId, text }),
//     });
// }
