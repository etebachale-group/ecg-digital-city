.PHONY: help install dev test test-cov lint format clean services-start services-stop db-setup db-reset

help:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║     ECG Digital City - WSL Ubuntu Development             ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Installation:"
	@echo "  make install         - Install dependencies for both projects"
	@echo ""
	@echo "Services (WSL):"
	@echo "  make services-start  - Start PostgreSQL and Redis in WSL"
	@echo "  make services-stop   - Stop PostgreSQL and Redis"
	@echo "  make services-status - Show services status"
	@echo ""
	@echo "Development:"
	@echo "  make dev             - Start backend + frontend (requires separate terminals)"
	@echo "  make dev-backend     - Start only backend"
	@echo "  make dev-frontend    - Start only frontend"
	@echo ""
	@echo "Database:"
	@echo "  make db-setup        - Create database and tables"
	@echo "  make db-reset        - Drop and recreate database"
	@echo "  make db-seed         - Seed database with initial data"
	@echo ""
	@echo "Testing:"
	@echo "  make test            - Run tests for backend and frontend"
	@echo "  make test-cov        - Run tests with coverage reports"
	@echo "  make test-backend    - Run only backend tests"
	@echo "  make test-frontend   - Run only frontend tests"
	@echo "  make test-watch      - Run tests in watch mode"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint            - Run ESLint on both projects"
	@echo "  make format          - Format code with Prettier"
	@echo "  make lint-fix        - Fix linting issues automatically"
	@echo "  make format-check    - Check formatting without modifying"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean           - Clean build artifacts and caches"
	@echo "  make clean-deps      - Remove node_modules"
	@echo "  make reinstall       - Clean and reinstall all dependencies"
	@echo ""
	@echo "Info:"
	@echo "  make info            - Show configuration and URLs"
	@echo "  make health          - Check if services are running"
	@echo ""
	@echo "📖 Full setup guide: See SETUP-WSL-UBUNTU.md"
	@echo ""

# ═══════════════════════════════════════════════════════════════════════════
# INSTALLATION
# ═══════════════════════════════════════════════════════════════════════════

install:
	@echo "Installing backend dependencies..."
	@cd backend && npm install --legacy-peer-deps
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install --legacy-peer-deps
	@echo "✅ All dependencies installed!"

reinstall: clean install
	@echo "✅ Dependencies reinstalled!"

# ═══════════════════════════════════════════════════════════════════════════
# DEVELOPMENT (WSL)
# ═══════════════════════════════════════════════════════════════════════════

dev:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║     Development Mode (requires separate terminals)        ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "1. First, ensure WSL services are running:"
	@echo "   $$ make services-start"
	@echo ""
	@echo "2. Open TWO separate terminals and run:"
	@echo ""
	@echo "   Terminal 1 - Backend:"
	@echo "   $$ cd backend && npm run dev"
	@echo ""
	@echo "   Terminal 2 - Frontend:"
	@echo "   $$ cd frontend && npm run dev"
	@echo ""
	@echo "3. Access from Windows:"
	@echo "   Backend:  http://localhost:3000"
	@echo "   Frontend: http://localhost:5173"
	@echo ""

dev-backend:
	@echo "Starting backend server..."
	@echo "Backend: http://localhost:3000"
	@cd backend && npm run dev

dev-frontend:
	@echo "Starting frontend development server..."
	@echo "Frontend: http://localhost:5173"
	@cd frontend && npm run dev

# ═══════════════════════════════════════════════════════════════════════════
# TESTING
# ═══════════════════════════════════════════════════════════════════════════

test:
	@echo "Running backend tests..."
	@cd backend && npm test
	@echo ""
	@echo "Running frontend tests..."
	@cd frontend && npm test

test-cov:
	@echo "Running backend tests with coverage..."
	@cd backend && npm test -- --coverage
	@echo ""
	@echo "Running frontend tests with coverage..."
	@cd frontend && npm test -- --coverage
	@echo ""
	@echo "Coverage reports generated in:"
	@echo "  - backend/coverage"
	@echo "  - frontend/coverage"

test-backend:
	@echo "Running backend tests..."
	@cd backend && npm test

test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test

test-watch:
	@echo "Running tests in watch mode..."
	@echo "Backend in terminal 1: cd backend && npm test -- --watch"
	@echo "Frontend in terminal 2: cd frontend && npm test -- --watch"

# ═══════════════════════════════════════════════════════════════════════════
# CODE QUALITY
# ═══════════════════════════════════════════════════════════════════════════

lint:
	@echo "Linting backend code..."
	@cd backend && npm run lint || true
	@echo ""
	@echo "Linting frontend code..."
	@cd frontend && npm run lint || true

lint-fix:
	@echo "Fixing linting issues..."
	@cd backend && npm run lint:fix || true
	@cd frontend && npm run lint:fix || true
	@echo "✅ Linting issues fixed!"

format:
	@echo "Formatting code with Prettier..."
	@cd backend && npx prettier --write src/ || true
	@cd frontend && npx prettier --write src/ || true
	@echo "✅ Code formatted!"

format-check:
	@echo "Checking code format..."
	@cd backend && npx prettier --check src/ || true
	@cd frontend && npx prettier --check src/ || true

# ═══════════════════════════════════════════════════════════════════════════
# SERVICES (WSL PostgreSQL and Redis)
# ═══════════════════════════════════════════════════════════════════════════

services-start:
	@echo "🚀 Starting WSL services..."
	@wsl sudo service postgresql start
	@wsl sudo service redis-server start
	@echo "✅ Services started!"
	@echo ""
	@echo "Verify with: make services-status"

services-stop:
	@echo "⏹️  Stopping WSL services..."
	@wsl sudo service postgresql stop
	@wsl sudo service redis-server stop
	@echo "✅ Services stopped!"

services-status:
	@echo "📊 PostgreSQL Status:"
	@wsl sudo service postgresql status || echo "PostgreSQL is not running"
	@echo ""
	@echo "📊 Redis Status:"
	@wsl sudo service redis-server status || echo "Redis is not running"

# ═══════════════════════════════════════════════════════════════════════════
# CLEANUP
# ═══════════════════════════════════════════════════════════════════════════

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf backend/dist backend/build backend/coverage
	@rm -rf frontend/dist frontend/build frontend/coverage
	@rm -rf .DS_Store
	@echo "✅ Cleanup complete!"

clean-deps:
	@echo "Removing node_modules..."
	@rm -rf backend/node_modules
	@rm -rf frontend/node_modules
	@echo "✅ node_modules removed!"

# ═══════════════════════════════════════════════════════════════════════════
# DATABASE (WSL PostgreSQL)
# ═══════════════════════════════════════════════════════════════════════════

db-setup:
	@echo "📦 Creating database..."
	@wsl sudo -u postgres createdb ecg_digital_city 2>/dev/null || echo "Database already exists"
	@echo "✅ Database setup complete!"
	@echo ""
	@echo "To view database:"
	@echo "  wsl psql -U postgres -d ecg_digital_city"

db-reset:
	@echo "🔄 Resetting database..."
	@wsl sudo -u postgres dropdb ecg_digital_city 2>/dev/null || echo "Database did not exist"
	@wsl sudo -u postgres createdb ecg_digital_city
	@echo "✅ Database reset complete!"

db-seed:
	@echo "🌱 Seeding database..."
	@cd backend && npm run seed
	@echo "✅ Database seeded!"

db-migrate:
	@echo "🔄 Running database migrations..."
	@cd backend && npm run migrate
	@echo "✅ Migrations complete!"

# ═══════════════════════════════════════════════════════════════════════════
# UTILITY
# ═══════════════════════════════════════════════════════════════════════════

info:
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║     ECG Digital City - Development Configuration          ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🌐 Backend (Node.js + Express):"
	@echo "   URL: http://localhost:3000"
	@echo "   Health: http://localhost:3000/health"
	@echo "   WebSocket: ws://localhost:3000"
	@echo ""
	@echo "🎨 Frontend (React + Vite):"
	@echo "   URL: http://localhost:5173"
	@echo ""
	@echo "📊 Database (PostgreSQL via WSL):"
	@echo "   Host: localhost:5432 (from Windows)"
	@echo "   User: postgres"
	@echo "   Password: postgres (default, change in .env)"
	@echo "   Database: ecg_digital_city"
	@echo "   Connect: wsl psql -U postgres -d ecg_digital_city"
	@echo ""
	@echo "🔴 Cache (Redis via WSL):"
	@echo "   Host: localhost:6379 (from Windows)"
	@echo "   Connect: wsl redis-cli"
	@echo ""
	@echo "📁 Project Structure:"
	@echo "   backend/     - Node.js server + Socket.IO"
	@echo "   frontend/    - React application + Three.js"
	@echo "   docs/        - Documentation and technical specs"
	@echo ""
	@echo "⚙️  Environment:"
	@echo "   OS: Windows with WSL2 Ubuntu"
	@echo "   Node.js: 18+"
	@echo "   npm: 9+"
	@echo ""

health:
	@echo "🏥 Checking services..."
	@echo ""
	@echo "1️⃣  PostgreSQL:"
	@wsl -e sh -c "sudo service postgresql status | grep running" > /dev/null && echo "   ✅ Running" || echo "   ❌ Not running"
	@echo ""
	@echo "2️⃣  Redis:"
	@wsl -e sh -c "sudo service redis-server status | grep running" > /dev/null && echo "   ✅ Running" || echo "   ❌ Not running"
	@echo ""
	@echo "3️⃣  Backend API:"
	@-curl -s http://localhost:3000/health 2>/dev/null | findstr /V "^$" >nul && echo "   ✅ Running" || echo "   ❌ Not responding"
	@echo ""
	@echo "4️⃣  Frontend:"
	@-curl -s http://localhost:5173/ 2>/dev/null | findstr /V "^$" >nul && echo "   ✅ Running" || echo "   ❌ Not responding"
	@echo ""
	@echo "📖 Start services with: make services-start"
	@echo "📖 Start dev servers with: make dev"
