const cors = require("cors");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const express = require('express');
const app = express();

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRouter = require("./routes/connection");
const requestsRouter = require("./routes/requests");

app.use(cors({
    origin: "http://localhost:5173",
    methods: [],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRouter);
app.use("/", requestsRouter);

connectDB().then(()=>{
    console.log("Database connection established");
    app.listen(3000, ()=>{
        console.log("Server is successfully listening on port 3000");
    })
}).catch((err) => {
    console.log("Database connection failed");
})