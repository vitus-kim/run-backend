# Node.js Express MongoDB Server

A basic Node.js server setup with Express.js and MongoDB using Mongoose.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## API Endpoints

### Basic Routes
- `GET /` - Server status
- `GET /api/health` - Health check

### User Routes
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

## Project Structure

```
Server/
├── config/
│   └── database.js          # Database connection configuration
├── models/
│   └── User.js              # User model schema
├── routes/
│   ├── index.js             # Main router
│   ├── userRoutes.js        # User-related routes
│   └── authRoutes.js        # Authentication routes
├── index.js                 # Main server file
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Database Setup

Make sure MongoDB is running on your system:
- Local MongoDB: `mongodb://localhost:27017/myapp`
- MongoDB Atlas: Update the `MONGODB_URI` in your `.env` file

## Development

The server uses nodemon for development, which automatically restarts the server when files change.

## Next Steps

1. Implement actual database operations in the route handlers
2. Add authentication middleware
3. Add input validation
4. Add error handling
5. Add logging
6. Add tests

