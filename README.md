# Bocantino ERP

A comprehensive ERP system built with SvelteKit, TypeScript, and PostgreSQL for managing inventory, suppliers, production, and more.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (if running locally without Docker)

### 🐳 Running with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Bocantino-ERP
   ```

2. **Set up environment variables**
   ```bash
   # For quick Docker setup with defaults:
   npm run docker:setup-dev
   
   # OR for custom configuration:
   npm run docker:setup
   # Then edit .env with your actual values
   ```

3. **Start the application**
   ```bash
   npm run docker:up
   ```

4. **View the application**
   - Application: http://localhost:3000
   - Database: localhost:5432

5. **Stop the application**
   ```bash
   npm run docker:down
   ```

### 💻 Local Development

#### Option 1: Development with Docker (Hot Reload)

```bash
# Set up environment variables for development
npm run docker:setup-dev

# Start development environment with hot reload
npm run docker:dev

# Stop development environment
npm run docker:dev-down
```

#### Option 2: Traditional Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp environment.example .env
   # Update NEON_DATABASE_URL for your local PostgreSQL instance
   ```

3. **Start PostgreSQL** (if not using Docker)
   ```bash
   # Using Docker for just the database
   docker run -d \
     --name postgres-local \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=mydatabase \
     -p 5432:5432 \
     postgres:15-alpine
   ```

4. **Run database migrations**
   ```bash
   npm run db-push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **View the application**
   - Development server: http://localhost:5173

## 🏗️ Production Deployment

### Docker Production Deployment

1. **Build production image**
   ```bash
   docker build -t bocantino-erp .
   ```

2. **Run production container**
   ```bash
   docker run -d \
     --name bocantino-erp-prod \
     -p 3000:3000 \
     --env-file .env \
     bocantino-erp
   ```

### Vercel Deployment

The application is pre-configured for Vercel deployment:

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
   - `NEON_DATABASE_URL`: Your Neon database connection string
   - `JWT_SECRET`: Your JWT secret key
3. **Deploy automatically on push to main branch**

### Manual Server Deployment

1. **Clone repository on server**
   ```bash
   git clone <your-repo-url>
   cd Bocantino-ERP
   ```

2. **Set up environment**
   ```bash
   cp environment.example .env
   # Configure production values in .env
   ```

3. **Install dependencies and build**
   ```bash
   npm ci --production
   npm run build
   ```

4. **Start with PM2 (recommended)**
   ```bash
   npm install -g pm2
   pm2 start build/index.js --name "bocantino-erp"
   pm2 save
   pm2 startup
   ```

## 📝 Available Scripts

### Docker Scripts
- `npm run docker:setup` - Create .env file from template
- `npm run docker:setup-dev` - Create .env file with Docker defaults
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run container from built image
- `npm run docker:up` - Start production environment
- `npm run docker:down` - Stop production environment
- `npm run docker:logs` - View application logs
- `npm run docker:dev` - Start development environment with hot reload
- `npm run docker:dev-down` - Stop development environment
- `npm run docker:clean` - Clean up containers and volumes

### Development Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check
- `npm run lint` - Lint code
- `npm run format` - Format code

### Database Scripts
- `npm run db-push` - Push database schema
- `npm run db-migrate` - Generate migrations

### Testing Scripts
- `npm run test` - Run tests with Docker database
- `npm run test:vitest` - Run tests only
- `npm run test:compose-up` - Start test database
- `npm run test:compose-down` - Stop test database

## 🔧 Configuration

### Environment Files

The project uses different environment files for different scenarios:

- **`.env`** - Your personal environment file (not tracked by git)
- **`.env.docker`** - Default Docker configuration with sensible defaults
- **`environment.example`** - Template file showing all required variables

#### Setting up Environment Variables

```bash
# Quick setup for Docker development (recommended)
npm run docker:setup-dev

# Custom setup (edit values after creation)
npm run docker:setup

# Manual setup
cp environment.example .env
# Edit .env with your values
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEON_DATABASE_URL` | PostgreSQL connection string | Required |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `HOST` | Application host | `0.0.0.0` |
| `JWT_SECRET_KEY` | JWT signing secret (min 32 chars) | Required for auth |
| `JWT_EXPIRES_IN` | JWT token expiration time in minutes | `60` |

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `app` | 3000 | Production SvelteKit application |
| `app-dev` | 5173 | Development server with hot reload |
| `postgres` | 5432 | PostgreSQL database |

## 🗄️ Database

The application uses PostgreSQL with Drizzle ORM:

- **Production**: Neon Database (serverless PostgreSQL)
- **Development**: Local PostgreSQL or Docker container
- **Testing**: Docker PostgreSQL container

### Database Operations

```bash
# Push schema changes to database
npm run db-push

# Generate migration files
npm run db-migrate

# Reset database (development only)
npm run docker:clean && npm run docker:up
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

This will:
1. Start a PostgreSQL container
2. Apply database migrations
3. Run all tests
4. Clean up containers

## 📚 Architecture

- **Framework**: SvelteKit with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: tRPC for type-safe APIs
- **Styling**: Tailwind CSS with Skeleton UI
- **Authentication**: JWT-based authentication
- **Deployment**: Docker, Vercel, or traditional servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

---

## 📖 Additional Resources

- [Domain Model](https://drive.google.com/file/d/1lwSNumP7MRxCC2nTSc_eueGmCpDp2uLi/view?usp=sharing)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Docker Documentation](https://docs.docker.com/)

