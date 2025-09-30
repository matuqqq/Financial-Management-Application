# FinanceFlow - Personal Finance Management Application

A comprehensive full-stack financial management application built with React, Express, Prisma, and SQLite. Features modern UI/UX design, secure authentication, and comprehensive financial tracking capabilities.

## 🚀 Features

### Frontend (React)
- **Modern UI/UX**: Minimalist design with green pastel theme and smooth animations
- **Authentication**: Complete auth flow with JWT tokens (access + refresh)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Form Validation**: React Hook Form with Zod validation
- **State Management**: React Query for server state management
- **Internationalization**: i18n structure ready (react-i18next)

### Backend (Express + Prisma)
- **RESTful API**: Complete REST API with proper error handling
- **Authentication & Authorization**: JWT-based auth with refresh token rotation
- **Database**: SQLite with Prisma ORM for type-safe database operations
- **Security**: Helmet, CORS, rate limiting, input validation
- **File Uploads**: Multer for handling receipt/document uploads
- **Email Service**: Nodemailer for password reset emails
- **Comprehensive Logging**: Winston for structured logging

### Core Functionality
- **Transaction Management**: Create, read, update, delete financial transactions
- **Categories**: Organize transactions by categories
- **Dashboard**: Visual analytics with charts and statistics
- **User Management**: Profile management and password changes
- **Data Export**: Export financial data in various formats
- **Filtering & Search**: Advanced filtering and search capabilities

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Framer Motion for animations
- React Query (TanStack Query) for data fetching
- React Hook Form + Zod for form handling
- React Router v6 for routing
- Recharts for data visualization
- React Hot Toast for notifications

### Backend
- Node.js with Express
- Prisma ORM with SQLite
- JWT for authentication
- Bcrypt for password hashing
- Celebrate (Joi) for request validation
- Winston for logging
- Nodemailer for emails
- Multer for file uploads

### DevOps & Deployment
- Docker & Docker Compose
- Nginx for production
- Environment-based configuration
- Database migrations with Prisma
- Comprehensive error handling

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker & Docker Compose (for containerized deployment)

## 🏃‍♂️ Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd financial-management-app
```

### 2. Install dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd server
npm install
```

### 3. Set up environment variables

**Server (.env):**
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
```

### 4. Set up database
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 5. Start development servers

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Demo Credentials
- Email: `demo@financeflow.com`
- Password: `demo123`

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose up -d
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password

### User Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile
- `DELETE /api/v1/users/me` - Delete user account
- `GET /api/v1/users/me/stats` - Get user statistics

### Transaction Endpoints
- `GET /api/v1/items` - Get transactions (with filtering)
- `POST /api/v1/items` - Create transaction
- `GET /api/v1/items/:id` - Get transaction by ID
- `PATCH /api/v1/items/:id` - Update transaction
- `DELETE /api/v1/items/:id` - Delete transaction
- `GET /api/v1/items/stats` - Get transaction statistics

### Category Endpoints
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### File Upload
- `POST /api/v1/uploads` - Upload files (receipts, documents)

## 🗃️ Database Schema

### Users
- ID, email, name, password (hashed), role, timestamps

### Refresh Tokens
- ID, token hash, user ID, expiry date, created at

### Categories  
- ID, name

### Items (Transactions)
- ID, title, amount, type (income/expense), date, notes, user ID, category ID, timestamps

## 🔒 Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT access tokens (15min expiry) + refresh tokens (7 days)
- Rate limiting (100 requests/15min general, 5 auth requests/15min)
- Input validation and sanitization
- CORS protection
- Security headers (Helmet)
- SQL injection protection (Prisma)
- File upload validation
- Environment-based secrets

## 🧪 Testing

Run tests:
```bash
cd server
npm test
```

## 📁 Project Structure

```
financial-management-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static files
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

---

Built with ❤️ using React, Express, Prisma, and SQLite.