# PromptWARS PHP Backend

PHP/PostgreSQL backend for Teach me Prompting - LAPP stack application. Powered by MartinAI.

## 🚀 Quick Start

### Prerequisites
- PHP 7.4+
- PostgreSQL 15+
- Ubuntu 20.04+ compatible
- Composer
- LiteLLM proxy (or OpenAI/Anthropic API key)

### Installation

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure .env
nano .env
```

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promptwars
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=3600

# LiteLLM / AI Provider
LITELLM_API_KEY=your-api-key
LITELLM_BASE_URL=http://localhost:4000/v1
LITELLM_MODEL=gpt-4

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@promptwars.com

# App
APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Run Development Server

```bash
# Using PHP built-in server
php -S localhost:8000 -t public

# Or using Apache/Nginx (see apache-config/)
```

## 📁 Project Structure

```
backend-php/
├── public/
│   ├── index.php          # Entry point
│   └── .htaccess          # Apache config
├── src/
│   ├── Config/
│   │   └── Database.php   # PDO connection
│   ├── Controllers/       # API controllers
│   │   ├── AuthController.php
│   │   ├── ChallengeController.php
│   │   ├── ProgressController.php
│   │   ├── LeaderboardController.php
│   │   ├── ProfileController.php
│   │   ├── QuestController.php
│   │   ├── PlaygroundController.php
│   │   └── AdminController.php
│   ├── Core/              # Framework core
│   │   ├── Router.php
│   │   ├── Request.php
│   │   └── Response.php
│   ├── Middleware/
│   │   └── JwtMiddleware.php
│   ├── Models/            # Database models
│   │   ├── User.php
│   │   ├── UserProgress.php
│   │   └── Challenge.php
│   ├── Services/          # Business logic
│   │   ├── AuthService.php
│   │   ├── EmailService.php
│   │   ├── LiteLLMService.php
│   │   └── ChallengeService.php
│   └── routes.php         # Route definitions
├── composer.json
├── .env
└── README.md
```

## 🔌 API Endpoints

### Authentication (Public)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/verify` - Verify email with code
- `POST /auth/resend-code` - Resend verification code
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Challenges (Protected)
- `GET /challenges` - List all challenges
- `GET /challenges/recommended` - Get recommended challenges
- `POST /challenges/generate` - Generate new challenge
- `POST /challenges/evaluate` - Evaluate challenge submission
- `POST /challenges/submit` - Submit challenge (alias for evaluate)

### Progress (Protected)
- `GET /progress` - Get user progress
- `POST /progress/sync` - Sync progress data
- `GET /achievements` - Get user achievements
- `GET /badges` - Get user badges

### Profile (Protected)
- `GET /profile` - Get user profile
- `GET /profile/activities` - Get activity history

### Leaderboard (Protected)
- `GET /leaderboard` - Get global rankings

### Quests (Protected)
- `GET /quests` - List all quests
- `GET /quests/{questId}/progress` - Get quest progress
- `GET /quests/{questId}/level/{levelNumber}` - Get quest level
- `POST /quests/{questId}/level/{levelNumber}` - Submit quest level

### Playground (Protected)
- `POST /prompt` - Execute prompt with AI
- `POST /prompt/test` - Test prompt (alias)

### Admin (Protected - Admin Only)
- `GET /admin/llm-config` - Get LLM configuration
- `PUT /admin/llm-config` - Update LLM configuration
- `GET /admin/challenges` - List all challenges
- `POST /admin/challenges` - Create challenge
- `PUT /admin/challenges/{challengeId}` - Update challenge
- `DELETE /admin/challenges/{challengeId}` - Delete challenge

## 🧪 Testing

### Using PowerShell Script
```powershell
.\test-api.ps1
```

### Using cURL
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Generate Challenge (with token)
curl -X POST http://localhost:8000/challenges/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"topic":"basic-prompt-engineering","difficulty":"beginner"}'
```

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <access_token>
```

Token expires in 1 hour (configurable via JWT_EXPIRY).

## 🤖 AI Integration

### LiteLLM Proxy (Recommended)
```bash
# Install LiteLLM
pip install litellm

# Run proxy
litellm --model gpt-4 --port 4000

# Configure .env
LITELLM_BASE_URL=http://localhost:4000/v1
LITELLM_MODEL=gpt-4
```

### Direct OpenAI
```env
LITELLM_BASE_URL=https://api.openai.com/v1
LITELLM_API_KEY=sk-...
LITELLM_MODEL=gpt-4
```

### Direct Anthropic
```env
LITELLM_BASE_URL=https://api.anthropic.com/v1
LITELLM_API_KEY=sk-ant-...
LITELLM_MODEL=claude-3-sonnet-20240229
```

## 📊 Database

PostgreSQL schema located in `database/schema.sql`.

### Initialize Database
```bash
# Create database
createdb promptwars

# Run schema
psql -d promptwars -f ../database/schema.sql
```

## 🐛 Debugging

Enable error reporting in `public/index.php`:

```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

Check logs:
- PHP errors: Check Apache/Nginx error logs
- Application logs: `error_log()` outputs to PHP error log

## 📝 Development Notes

### Adding New Endpoints
1. Create controller method in `src/Controllers/`
2. Add route in `src/routes.php`
3. Add middleware if protected: `$auth->wrap([Controller::class, 'method'])`

### Adding New Models
1. Create model class in `src/Models/`
2. Use PDO prepared statements
3. Follow existing patterns (see User.php, Challenge.php)

### Adding New Services
1. Create service class in `src/Services/`
2. Inject dependencies via constructor
3. Follow single responsibility principle

## 🚀 Deployment

See `apache-config/` for Apache configuration examples.

### Production Checklist
- [ ] Set `display_errors = 0` in php.ini
- [ ] Configure proper CORS origins
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging

## 📚 Dependencies

- `firebase/php-jwt` - JWT authentication
- `phpmailer/phpmailer` - Email sending
- `vlucas/phpdotenv` - Environment variables
- `guzzlehttp/guzzle` - HTTP client for AI APIs

## 🤝 Contributing

1. Follow PSR-4 autoloading standards
2. Use type hints for parameters and return types
3. Add PHPDoc comments for public methods
4. Keep controllers thin, move logic to services
5. Use prepared statements for all database queries

## 📄 License

MIT License
