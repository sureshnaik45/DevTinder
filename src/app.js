const cors = require("cors");
require('dotenv').config();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const express = require('express');
const app = express();
const http = require('http');
const initializeSocket = require('./utils/socket');

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRouter = require("./routes/connection");
const requestsRouter = require("./routes/requests");
const chatRouter = require('./routes/chat');

app.use(cors({
    origin: process.env.ORIGIN, // in .env create ORIGIN
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRouter);
app.use("/", requestsRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);


connectDB().then(()=>{
    console.log("Database connection established");
    server.listen(process.env.PORT, ()=>{ // in .env create PORT
        console.log("Server is successfully listening on port "+process.env.PORT); // in .env create PORT
    })
}).catch((err) => {
    console.log("Database connection failed");
})