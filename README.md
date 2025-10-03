📝 Alschool ASSIGNMENT: Mini Project: Todo Application

This is a simple Todo Application built with Node.js, Express, EJS, Passport-JWT, and MongoDB (Mongoose-ready)  
It allows users to sign up, log in, and manage their tasks (pending, completed, deleted). Tasks are filterable, and authentication is handled via JWT tokens.

Features
✅ User Sign-up and Login with JWT authentication
🔒 Secure password storage using bcryptjs
📝 Task states: pending, completed, deleted
🔍 Ability to filter tasks by state
🎨 EJS templating for UI with custom CSS styling
🛡️ Passport-JWT authentication middleware
⚡ Global and local error handling
🌍 Prepared for MongoDB Atlas (via Mongoose)

📂 Project Structure
.
├── config
│ └── passport.js # Passport JWT strategy
├── models
│ └── User.js # User schema (Mongoose)
│ └── Task.js # Task schema (Mongoose)
├── routes
│ └── auth.js # Sign-up & login routes
│ └── tasks.js # Task CRUD routes
├── views
│ ├── layout.ejs # Layout wrapper
│ ├── index.ejs # Dashboard (list tasks)
│ ├── login.ejs # Login page
│ └── register.ejs # Sign-up page
├── public
│ └── style.css # CSS styling
├── server.js # Entry point
├── .env # Environment variables
└── README.md # Project documentation

🔐 Authentication
Sign-up: Users create an account. Passwords are hashed with bcryptjs.
Login: Returns a JWT token, stored client-side.
Protected Routes: Tasks can only be accessed with a valid token.

🛠️ Built With
Node.js
Express.js
EJS
MongoDB + Mongoose
Passport-JWT
bcryptjs
