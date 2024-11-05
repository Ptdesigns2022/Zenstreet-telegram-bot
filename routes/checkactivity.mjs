import express from "express";
import { User }from "../mongoose/schemas/database.mjs";
const router = express.Router();

// Get user data by ID
router.get('/api/checkactivity/:userid', async (req, res) => {
    try {
        const user = await User.findById(req.params.userid); // Fetch user by ID
        if (!user) return res.status(404).send("User not found");
        
        res.json(user); // Return user data as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message }); // Return JSON for server errors
    }
});
export default router;