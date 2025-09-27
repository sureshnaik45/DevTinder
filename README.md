# DevTinder

This is the backend code for DevTinder-Web, a MERN stack application designed to connect developers.
It handles user authentication, profile management, connection requests, and real-time chat functionality.

## 1. Core Technologies Used -
    - Node.js: JavaScript runtime environment.
    - Express.js: Web application framework for building the RESTful API.
    - MongoDB: NoSQL database for storing user data, connections, and chats.
    - Mongoose: Object Data Modeling (ODM) library for MongoDB and Node.js.
    - Socket.IO: For enabling real-time, bidirectional communication for the chat feature.
    - JSON Web Tokens (JWT): For securing API endpoints via token-based authentication.
    - bcrypt: Library for hashing user passwords before storing them.
## 2. Key Features & Endpoints -
    - Authentication: POST /signup, POST /login, POST /logout
    - Profile Management: GET /profile/view, POST /profile/edit
    - User Feed: GET /feed (Fetches potential connections)
    - Connection Handling: POST /connection/send/:status/:toUserId, POST /connection/review/:status/:requestId
    - Requests: GET /requests/received, GET /requests/sent, DELETE /request/cancel/:requestId
    - Real-Time Chat: GET /chat/:targetUserId (fetches history), WebSocket events for live messaging.
## 3. Project Setup & Installation -
    - Clone the repository: git clone <repository-url>
    - Navigate to the directory: cd devtinder-backend
    - Install dependencies: npm install
    - Create a .env file in the root directory.
    -Start the server: npm start
## 4. Environment Variables -
    You must create a .env file with the following variables for the application to run:
    - PORT: The port on which the server will run (e.g., 3000).
    - DB_CONNECTION_SECRET: Your MongoDB Atlas connection string.
    - JWT_SECRET: A long, random, and secret string for signing JWTs.
    - ORIGIN: The URL of your frontend application (e.g., http://localhost:5173 for development).
## 5. Authentication System -
    - The application uses HttpOnly cookies to store JWTs, which is a secure method to prevent XSS attacks.
    - The userAuth middleware protects sensitive routes, ensuring that only authenticated users can access them.
    - Passwords are salted and hashed using bcrypt before being stored in the database.
## 6. Real-Time Chat with Socket.IO -
    - The server initializes a Socket.IO instance to handle live chat connections.
    - Users join private rooms based on a hashed combination of their user IDs.
    - sendMessage and messageReceived events are used to broadcast messages only to the intended participants.
## 7. Database Schema -
    - User: Stores user profile information, credentials, and skills.
    - ConnectionRequest: Manages the status (interested, ignored, accepted) of connection requests between users.
    - Chat: Stores the participants and the history of messages between two connected users.
## 8. Error Handling -
    - The API provides consistent JSON error responses.
    - Sensitive error details are logged on the server but are not sent to the client in production to prevent security leaks.
## 9. Code Structure -
    - /config: Database connection setup.
    - /middlewares: Authentication middleware (userAuth).
    - /models: Mongoose schemas for User, Chat, and ConnectionRequest.
    - /routes: Express router files defining all API endpoints.
    - /utils: Socket.IO setup and validation helpers.
## 10. Deployment -
    - The server is designed to be deployed on platforms that support long-running Node.js process render, due to its use of WebSockets.