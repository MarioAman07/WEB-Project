# Travel Planner

## Description
**Travel Planner** is a full-stack web application for organizing and managing travel destinations.  
The project allows users to browse destinations, save favorites, leave reviews, and manage travel data through a secure CRUD API.

The application implements **authentication, authorization, role-based access control, and owner-level permissions**, making it suitable for a production-ready backend project.

---

## Core Features
- Destination browsing with category filters
- Secure CRUD operations via REST API
- User authentication (sessions + bcrypt)
- Role-based access control (User / Admin)
- Owner access (users can modify only their own records)
- Admin panel for role management
- Favorites system using `localStorage`
- Reviews stored in `localStorage`
- Contact form storing messages on the server
- MongoDB database with Mongoose ODM

---

## Team Members & Contributions
- **Sabina**  
  UI/UX styling, layout consistency, visual polish.

- **Aiym**  
  Frontend logic, dynamic rendering, filtering, and interactivity.

- **Aman**  
  Feature planning, testing user flows, system validation.

- **Alibek**  
  Backend architecture, MongoDB integration, authentication, authorization, and security logic.

---

## Technology Stack
### Backend
- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **Mongoose**
- **express-session**
- **connect-mongo**
- **bcryptjs**
- **express-validator**

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

---

## Database Used
### MongoDB (Atlas)
The project uses **MongoDB Atlas** as the primary database.  
All domain data is stored using **Mongoose models**.

---

## Database Models

### User
```js
{
  username: String,
  password: String (hashed),
  role: 'user' | 'admin'
}
```

### Destination
```js
{
  ownerId: ObjectId (User),
  name: String,
  category: String,
  description: String,
  img: String,
  location: String,
  price: Number,
  rating: Number,
  activities: [String],
  createdAt: Date
}
```

## Authentication & Authorization

- Session-based authentication  
- Password hashing using **bcrypt**  
- Role-based access control:

  - **User**
    - Can create, update, and delete **only their own destinations**

  - **Admin**
    - Can manage **all destinations**
    - Can manage **user roles**

- Middleware-based security:
  - `isAuthenticated`
  - `requireAdmin`
  - `requireOwnerOrAdmin`

---

## API Routes (CRUD)

### Public Routes

#### `GET /api/items`
Fetch all destinations.

Supports:
- Filtering: `?category=`
- Sorting: `?sort=name`
- Projection: `?fields=name,category`

---

#### `GET /api/items/:id`
Fetch a single destination by ID.

---

### Protected Routes (Authentication Required)

#### `POST /api/items`
Create a new destination.

- Owner is automatically assigned from the active session.

---

#### `PUT /api/items/:id`
Update an existing destination.

- Allowed for:
  - Destination **owner**
  - **Admin**

---

#### `DELETE /api/items/:id`
Delete a destination.

- Allowed for:
  - Destination **owner**
  - **Admin**

---

## Admin Routes (Admin Only)

#### `POST /admin/promote`
Promote a user to admin.

**Request body:**
```json
{
  "username": "user123"
}
```

## Admin Role Management

### `POST /admin/demote`
Demote an admin back to a regular user.

**Security rules:**
- Prevents removing the **last admin**
- Prevents **self-demotion** (an admin cannot demote themselves)

---

## Contact Form

- HTML form available at `/contact`
- Messages are saved to a **server-side JSON file**

**Includes:**
- Input validation
- Safe error handling

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/travelPlannerDB
SESSION_SECRET=your_session_secret
NODE_ENV=development

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin12345
```

### Important:
The .env file is ignored by Git for security reasons.

## Seeding the Database
To populate the database with realistic data:
```bash
node seed.js
```

### This will:

- Clear existing destinations
- Insert **20 realistic destinations**
- Assign ownership to the **admin user**

---

## How to Run the Project

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

### 3. Open in browser
```arduino
http://localhost:3000
```

## Defense Notes

During the defense, the project demonstrates:

- Full CRUD functionality via the Web UI
- Authentication and secure session handling
- Clear role separation (**User vs Admin**)
- Owner-level access protection
- Secure API endpoints
- Clean, modular project architecture
