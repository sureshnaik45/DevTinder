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

const allowedOrigins = [process.env.ORIGIN];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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