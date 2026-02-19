# Report Manager

A comprehensive full-stack application for managing reports, dashboards, and data sources, featuring AI insights and role-based access control.

<img width="1706" height="465" alt="image" src="https://github.com/user-attachments/assets/e2477509-0810-4b19-bbb6-808c583c05f4" />

> **Tech Stack at a Glance**
> 
> | Layer    | Technology                                      |
> |----------|------------------------------------------------|
> | Frontend | Next.js 14 · TypeScript · Tailwind CSS · Radix UI |
> | Backend  | Node.js · Express.js · SQLite                   |
> | Auth     | JWT (JSON Web Tokens)                           |
> | Deploy   | Docker · Docker Compose                         |

## Features

- **Authentication**: Secure login and registration with JWT-based authentication.
- **Dashboard Management**: Create and view customizable dashboards.
- **Report Management**: Manage various types of reports.
- **Data Sources**: Connect and test different data sources (Postgres, Excel, etc.).
- **AI Insights**: Get AI-powered analysis of your data.
- **Scheduling**: Schedule report generation tasks.
- **Admin Panel**: Manage users and roles (Admin access only).
- **Role-Based Access Control**: Differentiate between Admin and Regular users.

## Tech Stackc

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **UI Components**: Radix UI, Lucide React
- **State/Data Fetching**: Axios, React Hooks
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JSON Web Tokens (JWT)
- **Database**: SQLite (better-sqlite3)

---

## Quick Start (Recommended)

Run the interactive installer to set up the project (Local or Docker):

```bash
chmod +x setup.sh
./setup.sh
```

Follow the on-screen prompts to configure Backend, Frontend, and AI Engine.

---

## Quick Start with Docker (Manual)

### Prerequisites
- Docker & Docker Compose

### Run with Docker

```bash
# Clone the repository
git clone <repository-url>
cd 30ReportManager

# Make the management script executable
chmod +x docker.sh

# Start the application
./docker.sh start
```

### Docker Management Script

A comprehensive shell script (`docker.sh`) is provided for easy Docker container management:

| Command | Description |
|---------|-------------|
| `./docker.sh start` | Build and start all containers |
| `./docker.sh stop` | Stop all running containers |
| `./docker.sh status` | Show status, health, and resource usage |
| `./docker.sh reset` | Stop, remove volumes, and rebuild fresh |
| `./docker.sh clear` | Remove all containers, images, and volumes |
| `./docker.sh logs` | Show live logs from all containers |
| `./docker.sh help` | Display help message |

**Quick Examples:**
```bash
./docker.sh start    # Start the application
./docker.sh status   # Check container status
./docker.sh logs     # View live logs (Ctrl+C to exit)
./docker.sh stop     # Stop the application
./docker.sh reset    # Fresh restart with clean data
./docker.sh clear    # Complete cleanup
```

### Access the Application
| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:3050   |
| Backend  | http://localhost:3025   |

### Default Credentials
| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@example.com      | P@ssw0rd   |
| User    | user@example.com       | P@ssw0rd   |
| Manager | manager@example.com    | P@ssw0rd   |

---

## Manual Installation (Development)

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd 30ReportManager
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The backend server will run on `http://localhost:3025`.

3. **Frontend Setup:**
   Open a new terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend application will run on `http://localhost:3050`.

---

## API Endpoints

The backend runs on port `3025` and provides the following endpoints:

- **Auth**: `/login`, `/register`, `/me`
- **Reports**: `/reports` (GET, POST, PUT, DELETE)
- **Data Sources**: `/data-sources` (GET, POST, PUT, DELETE, TEST)
- **Dashboards**: `/dashboards` (GET, POST, DELETE)
- **Schedules**: `/schedules` (GET, POST, DELETE)
- **AI**: `/ai/analyze`
- **Admin**: `/users`, `/roles`

---

## Project Structure

```
30ReportManager/
├── backend/                                                # Express.js backend
│   ├── database.js                                         # SQLite database setup
│   ├── server.js                                           # Main server file
│   ├── Dockerfile                                          # Backend container config
│   └── database/                                           # Database directory
│       └── report-manager-backend.sqlite                   # SQLite database file
├── frontend/                                               # Next.js frontend
│   ├── src/app/                                            # App Router pages and layouts
│   ├── src/components/                                     # Reusable UI components
│   ├── src/lib/                                            # Utility functions and configurations
│   └── Dockerfile                                          # Frontend container config
├── compose.yaml                                            # Docker Compose configuration
├── docker.sh                                               # Docker management script
└── .env.example                                            # Environment variables template
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Backend
SECRET_KEY=supersecretkey
NODE_ENV=production
```
