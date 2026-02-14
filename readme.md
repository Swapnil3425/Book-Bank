# Book Bank Management System (MERN)

## 📖 Overview

**Book Bank** is a comprehensive full-stack web application designed to digitize and streamline the book lending process for educational institutions. It replaces traditional paper-based registers with a modern, automated system that handles book inventory, student borrowing, due date tracking, and overdue management.

Built with the **MERN Stack** (MongoDB, Express.js, React, Node.js), it features a robust backend, a responsive frontend, and automated email notifications.

## ✨ Key Features

### 👤 For Students
-   **Dashboard:** View current borrowings, due dates, and fines.
-   **Book Search:** Browse the library catalog with real-time availability.
-   **Profile Management:** Update personal details and contact info.
-   **History:** View complete borrowing history (returned, overdue, etc.).
-   **Notifications:** Receive email alerts for issued books, due dates, and overdue returns.

### 🛡️ For Admins
-   **Dashboard:** High-level overview of total books, active issues, and overdue returns.
-   **User Management:** Manage student accounts and verification requests.
-   **Book Management:** Add, update, or remove books from the inventory.
-   **Issue/Return:** Streamlined process to issue and return books using Institutional IDs.
-   **Reports:** Generate and view reports on system usage.

### 🤖 Automation
-   **Cron Jobs:**
    -   Daily check for overdue books (midnight).
    -   Daily reminder for books due in 5 days (09:00 AM).
    -   Daily reminder for books due in 3 days (10:00 AM).
-   **Email Alerts:** Automated emails via Nodemailer for all critical actions.

## 🛠️ Tech Stack

-   **Frontend:** React (Vite), Tailwind CSS, React Router, Axios.
-   **Backend:** Node.js, Express.js.
-   **Database:** MongoDB (Mongoose ORM).
-   **Authentication:** JWT (JSON Web Tokens) with HttpOnly cookies.
-   **Email Service:** Nodemailer (Gmail/SMTP).
-   **Scheduling:** node-cron.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16+)
-   MongoDB (Local running on port `27017` or Atlas URI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd book-bank-mernV34
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    -   Create a `.env` file in `backend/` with the following:
        ```env
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/bookbankV3
        JWT_SECRET=your_super_secret_key
        CLIENT_URL=http://localhost:5173
        EMAIL_USER=your_email@gmail.com
        EMAIL_PASS=your_app_password
        FINE_PER_DAY=50
        ```
    -   **Seed Data (Optional):**
        ```bash
        npm run seed # If script script is available, or:
        node seedData.js
        ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start Backend:**
    ```bash
    cd backend
    npm run dev
    # Server runs on http://localhost:5000
    ```

2.  **Start Frontend:**
    ```bash
    cd frontend
    npm run dev
    # Client runs on http://localhost:5173
    ```

## 🔐 Default Credentials

The system comes pre-seeded with the following accounts for testing.
**Password for all accounts:** `123456`

### Admin
| Role | Institutional ID | Email |
| :--- | :--- | :--- |
| **System Admin** | `ADMIN-001` | `admin@bookbank.com` |

### Students
| Name | Institutional ID | Email | Course |
| :--- | :--- | :--- | :--- |
| Aarav Sharma | `11231001` | `aarav.cse23@iiitp.ac.in` | CSE |
| Diya Patel | `11231002` | `diya.cse23@iiitp.ac.in` | CSE |
| Rohan Verma | `11231003` | `rohan.ece23@iiitp.ac.in` | ECE |
| Ishita Nair | `11231004` | `ishita.ece23@iiitp.ac.in` | ECE |

## 📂 Project Structure

```
book-bank-mernV34/
├── backend/                # Express server & API
│   ├── config/             # DB connection
│   ├── middleware/         # Auth & Error handling
│   ├── models/             # Mongoose models (User, Book, Borrow)
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions (Email)
│   ├── server.js           # Entry point
│   └── seedData.js         # Data seeding script
│
└── frontend/               # React application
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Application pages (Login, Dashboard, etc.)
    │   ├── context/        # React Context (Auth)
    │   └── api/            # Axios instance
    └── index.html
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
Developed for IIITP Software Engineering Lab.