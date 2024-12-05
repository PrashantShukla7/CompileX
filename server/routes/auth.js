const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "invalid credentials" });
        }
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET
        );
        const { password, ...otherDetails } = user._doc;

        res.cookie("access_token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        })
            .status(200)
            .json({ ...otherDetails });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/register", async (req, res) => {
    const { username, email } = req.body;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    try {
        const user = await User.findOne({
            $or: [{ username: username }, { email: email }],
        });
        if (user)
            res.status(400).json({
                message: "User with given username or email already exists.",
            });
        const newUser = await new User({
            username,
            email,
            password: hash,
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json(error.message);
    }
});

 // validate the user is it is logged in or not
router.get("/validate", async (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            res.status(200).json({ message: "Valid session" });
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;
