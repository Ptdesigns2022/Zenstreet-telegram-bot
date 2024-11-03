async function validateSession(req, res, next) {
    const { userTelegramId, sessionToken } = req.body;

    // Check if a valid session exists
    const session = await Session.findOne({ userTelegramId, sessionToken });
    if (session) {
        return next();
    }
    return res.status(401).json({ message: "Unauthorized or session expired." });
}
export { validateSession };
