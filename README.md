# SecureBank API

A modern online banking platform built with Express.js and React.

## Features

- **Customer Management**: Complete customer lifecycle management
- **Transaction Processing**: Secure money transfers and transaction history
- **Document Management**: Upload, download, and manage banking documents
- **Report Generation**: Financial reports and analytics
- **Financial Calculator**: Interest calculations and mathematical operations
- **Authentication**: JWT-based secure authentication system

## Tech Stack

**Backend:**
- Express.js 4.14.0
- MySQL 2.15.0
- JWT Authentication
- Winston Logging
- Multer File Upload

**Frontend:**
- React 18
- Tailwind CSS
- Axios HTTP Client
- React Router
- React Hook Form

## Getting Started

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Start the development server:
```bash
# Backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-token` - Token verification

### Customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `GET /api/customers/search/:term` - Search customers
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions/transfer` - Process money transfer
- `POST /api/transactions/:id/note` - Add transaction note
- `GET /api/transactions/history/:accountId` - Get transaction history
- `GET /api/transactions/export/:format/:accountId` - Export transactions

### Documents
- `GET /api/documents/download/:filename` - Download document
- `GET /api/documents/preview/:customerPath` - Preview document
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/list/:directory` - List documents
- `GET /api/documents/exists/:documentPath` - Check if document exists
- `GET /api/documents/stats/:filePath` - Get file statistics

### Reports
- `GET /api/reports/generate/:type` - Generate standard report
- `POST /api/reports/custom` - Execute custom report command
- `GET /api/reports/system/:action` - System management actions
- `POST /api/reports/schedule` - Schedule recurring reports
- `GET /api/reports/export/:format/:command` - Export report data

### Calculator
- `GET /api/calculator/eval/:expression` - Evaluate mathematical expression
- `POST /api/calculator/interest` - Calculate interest with custom formula
- `GET /api/calculator/timeout/:code/:delay` - Schedule code execution
- `POST /api/calculator/batch-calculate` - Batch calculations
- `GET /api/calculator/formula/:type/:params` - Execute mathematical formulas

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation with Joi
- JWT token authentication
- Bcrypt password hashing
- Request logging with Winston

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## License

MIT License - see LICENSE file for details.