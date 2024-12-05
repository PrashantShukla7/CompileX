const router = require("express").Router();
const Code = require("../models/codeSnippets");
const User = require("../models/user");

router.post("/", async (req, res) => {
    try {
        const { codeId, userId, ...otherDetails } = req.body;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Login to save code" });
        }

        // Check if a snippet with the given codeId exists
        let snippet;
        if (codeId) {
            snippet = await Code.findOne({ codeId: codeId });
            if (snippet) {
                // Update the existing snippet
                Object.assign(snippet, otherDetails);
                const updatedSnippet = await snippet.save();
                return res.status(200).json({
                    message: "Snippet updated successfully",
                    snippet: updatedSnippet,
                });
            }
        }

        // Create a new snippet
        const newSnippet = new Code(req.body); // Include userId and other details
        const savedSnippet = await newSnippet.save();

        // Update user's codes array
        user.codes.push(savedSnippet._id);
        await user.save();

        res.status(201).json({
            message: "Snippet created successfully",
            snippet: savedSnippet,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", (req, res) => {
    Code.find()
        .then((snippets) => res.json(snippets))
        .catch((err) => res.status(400).json({ error: err.message }));
});

router.get("/:codeId", async (req, res) => {
    try {
        const code = await Code.findOne({ codeId: req.params.codeId });
        res.status(200).json(code);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get("/user/:userId", async (req, res) => {
    // GET individual user snippets
    try {
        const user = await User.findById(req.params.userId).populate({
            path: "codes",
            options: { sort: { createdAt: -1 } },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.codes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Code.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Code deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
