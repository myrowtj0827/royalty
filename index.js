const express = require("express");
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {MONGO_URL, FRONT_URL} = require("./config");
const path = require('path');

const users = require("./routes/users");
const albums = require("./routes/albums");
const managements = require("./routes/managements");
const records = require("./routes/recorde-track");
const logs = require("./routes/log-track");

const config = require("./config");

const passport = require("passport");

app.use(
	cors({
		origin: '*',
	})
);

// Body-parser middleware
app.use(
	bodyParser.json({
		limit: '50mb',
	}));

// Passport middleware
app.use(passport.initialize(null));

// Passport config
require("./utils/passport")(passport);


// Connect to MongoDB
mongoose
	.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => console.log("MongoDB successfully connected"))
	.catch(err => console.log(err));

const publicPath = path.join(__dirname, 'admin_panel', 'build');
app.use(express.static(publicPath));
app.get(["/", '/login', '', '/assign-album', '/assign-track', '/add-album', '/add-user/:id?', '/user-list',
	'/publisher/albums/:id', '/publisher/tracks/:slug', '/user-list', '/user-reports', '/user-agreement', '/user-track-list/:id', '/user-settings', '/user-reports'], (req, res) => {
	res.sendFile(path.join(publicPath, 'index.html'));
});
// app.use(express.static(publicPath));
// app.get(["/", '/login', '/register', '/forgot-password', '/reset-password/:id', '', '/assign-album', '/assign-track', '/add-album', '/add-user/:id?', '/user-list',
// 	'/publisher/albums/:id', '/publisher/tracks/:slug', '/user-list', '/user-reports', '/user-agreement', '/user-track-list/:id', '/user-settings', '/user-reports'], (req, res) => {
// 	res.sendFile(path.join(publicPath, 'index.html'));
// });
app.use("/api/users", users);
app.use("/api/albums", albums);
app.use("/api/managements", managements);
app.use("/api/records", passport.authenticate('jwt', {session: false}), records); // Due to HS
app.use("/api/logs", logs); // By private/public key due to RSA

// const port = process.env.PORT || 7000;
const port = 7000;
app.listen(port, () => console.log(`Server up and running on port ${port}!`));