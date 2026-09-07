# TaskFlow – MERN Task Management Application

A full-stack Trello-like task management application developed as part of the **Software Engineer Intern Technical Assignment**.

TaskFlow allows users to create and manage tasks through a visual Kanban-style board with **To Do**, **Doing**, and **Done** status columns. The application includes secure authentication, role-based access control, task assignment, drag-and-drop functionality, and administrator management.

---

## 📌 Project Overview

TaskFlow is a full-stack task management system designed to demonstrate:

* Full-stack web application development
* RESTful API development
* User authentication and authorization
* Role-based access control
* MongoDB database management
* Drag-and-drop task management
* Responsive frontend development
* Backend security
* Deployment of frontend and backend applications

The project follows a **separate frontend and backend architecture**, as required by the assignment.

---

## ✨ Features

### 👤 User Authentication

* User registration
* User login
* JWT-based authentication
* Secure password hashing
* Protected API routes
* Persistent login sessions

### 🔐 Role-Based Access Control

The system supports two user roles:

#### Normal User

Normal users can:

* Register an account
* Log in
* Create tasks
* View their permitted tasks
* Assign unassigned tasks to themselves
* Manage their own tasks
* Move tasks between statuses

#### Administrator

Administrators have elevated privileges and can:

* View all users
* View all tasks
* Create and manage tasks
* Assign tasks to any user
* Reassign tasks between users
* Manage the overall task system

Administrators are created through database seeding rather than normal registration.

---

## 📋 Task Management

Each task contains:

* Title
* Description
* Status
* Creator
* Assigned user
* Creation timestamp
* Last updated timestamp

Tasks can be moved between:

```text
To Do → Doing → Done
```
Task status changes are persisted in MongoDB so that changes remain after refreshing the application.

---

## 🖱️ Drag-and-Drop Task Board

The application provides a **Kanban-style board** with three columns for efficient task management:

| Status | Description | Emoji |
|--------|-------------|-------|
| **To Do** | Tasks that have not yet been started | 📋 |
| **Doing** | Tasks currently being worked on | 🔄 |
| **Done** | Completed tasks | ✅ |

### ✨ Key Features

- 🎯 **Drag and Drop** - Users can drag and drop task cards between columns
- 💾 **Auto-Save** - The updated status is automatically saved to the backend
- 🔄 **Persistent** - Changes are stored in MongoDB and persist after page refresh
- 🎨 **Visual Feedback** - Smooth animations and visual cues during drag operations

---

## 🛠️ Technology Stack

### 🎨 Frontend

| Technology | Purpose |
|------------|---------|
| **React.js** | UI library for building the user interface |
| **JavaScript** | Core programming language |
| **HTML5** | Markup language for structure |
| **CSS3** | Styling and animations |
| **Axios** | HTTP client for API requests |
| **React Router** | Navigation and routing |
| **Drag-and-Drop** | Native or library-based drag functionality |

### ⚙️ Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web application framework |
| **RESTful APIs** | API architecture style |
| **JWT Authentication** | Secure token-based authentication |
| **bcrypt.js** | Password hashing library |
| **CORS** | Cross-Origin Resource Sharing |
| **dotenv** | Environment variable management |

### 🗄️ Database

| Technology | Purpose |
|------------|---------|
| **MongoDB** | NoSQL database |
| **MongoDB Atlas** | Cloud database service |

### 🛠️ Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Code editor |
| **Git** | Version control |
| **GitHub** | Repository hosting |
| **Postman** | API testing |
| **npm** | Package manager |

---

## 🚀 Getting Started

Follow these steps to set up and run the TaskFlow application on your local machine.

---

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Description | Check Version |
|-------------|-------------|---------------|
| **Node.js** | JavaScript runtime environment | `node --version` |
| **npm** | Node package manager | `npm --version` |
| **MongoDB Atlas** | Cloud database service | Account required |
| **Git** | Version control system | `git --version` |
| **VS Code** | Code editor (recommended) | - |

---

### 📥 Installation

```bash
# Clone the Repository
git clone https://github.com/ruwinya10/TaskFlow-Task-Management-System.git

# Navigate into the project directory.
cd Taskflow
```
---

### ⚙️ Backend Setup

```bash
# Navigate to Backend Directory
cd backend

# Install Dependencies
npm install
```

### Configure Environment Variables

Create a .env file in the backend folder & add the following backend environment variables to it.

```text
PORT=5000
MONGO_URI (YOUR_MONGODB_CONNECTION_STRING)
JWT_SECRET (YOUR_JWT_SECRET)
CLIENT_URL (Vercel url)

# Start the Backend Server
npm run dev
```

---

### 🎨 Frontend Setup

```bash
# Navigate to Frontend Directory
cd frontend

# Install Dependencies
npm install

# Configure Environment Variables
# Create a .env file in the frontend folder & add the following frontend environment variable to your .env file:
VITE_API_URL (Railway URL)

# Start the Frontend Development Server
npm run dev
```
---

### 👨‍💼 Administrator Setup

Administrators are not created through the normal registration process. They are created using a database seed script.

```bash
# Navigate to Backend Directory (if not already there)
cd backend

# Run the Seed Script
npm run seed
```
---

## 📁 Project Structure

```text
TaskFlow/
│
├── backend/
│   │
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   │
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```
---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |

### Tasks

| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | `/api/tasks`            | Get permitted tasks    |
| POST   | `/api/tasks`            | Create a task          |
| PUT    | `/api/tasks/:id`        | Update a task          |
| DELETE | `/api/tasks/:id`        | Delete a task          |
| PUT    | `/api/tasks/:id/status` | Update task status     |
| PUT    | `/api/tasks/:id/assign` | Assign/reassign a task |

### Users

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | `/api/users`     | Get users        |
| GET    | `/api/users/:id` | Get user details |

> **Note:** Endpoint availability depends on the user's authentication status and role.

---

## 🌐 Deployment

The application is deployed as separate frontend and backend services for scalability and maintainability.

### 📦 Frontend Deployment
Deployment Platform: Vercel

### ⚙️ Backend Deployment
Deployment Platform: Railway

```text
https://task-flow-task-management-system-sepia.vercel.app/
```
Database
Database: MongoDB Atlas

The deployed frontend communicates with the deployed backend through the configured REST API URL.

---

## 📸 Application Screenshots

### 🔐 Authentication Pages

<table>
  <tr>
    <td align="center">
      <img width="1920" height="860" alt="Login Page" src="https://github.com/user-attachments/assets/7ec12fbf-f4e4-47dc-b03a-0d78b28005fb" /><br>
      <sub><b>Login Page</b>: Users can securely log in with their email and password.</sub>
    </td>
  </tr> 
  <tr>
    <td align="center">
      <img width="1893" height="858" alt="Registration Page" src="https://github.com/user-attachments/assets/c70e1a39-fc15-4be6-b39f-9df07ad41ba4" /><br>
      <sub><b>Registration Page</b>: New users can create an account to get started.</sub>
    </td>
  </tr>
</table>

---

### 📊 User Dashboard

<table>
  <tr>
    <td align="center">
      <img width="1899" height="858" alt="User Dashboard" src="https://github.com/user-attachments/assets/b6b849d9-48bc-4116-9266-9d2bb8e73c9f" /><br>
      <sub><b>User Dashboard</b>: Overview of tasks assigned to the current user.</sub>
    </td>
  </tr> 
  <tr>
    <td align="center">
      <img width="1900" height="858" alt="Task Board" src="https://github.com/user-attachments/assets/1980ae6b-a97e-4b73-bd47-c68db4a14e14" /><br>
      <sub><b>Task Board</b>: Kanban-style board with To Do, Doing, and Done columns.</sub>
    </td>
  </tr>
</table>

### 📊 Admin Dashboard

<table>
  <tr>
    <td align="center">
      <img width="1895" height="866" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/55f2e5ea-e345-4be2-be9a-4800f07d573a" /><br>
      <sub><b>Admin Dashboard</b>: Admin view with all tasks and user management.</sub>
    </td>
  </tr> 
  <tr>
    <td align="center">
      <img width="1920" height="856" alt="User Management" src="https://github.com/user-attachments/assets/016ad43d-44e8-4883-a00f-a404c26050c7" /><br>
      <sub><b>User Management</b>: Administrators can view and manage all users.</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img width="1900" height="861" alt="Task Management" src="https://github.com/user-attachments/assets/6f948e3b-6457-4790-97c1-9458f8a43365" /><br>
      <sub><b>Task Management</b>: Assign tasks to specific users.</sub>
    </td>
  </tr>
</table>
