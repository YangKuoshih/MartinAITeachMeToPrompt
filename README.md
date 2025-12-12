# Teach me Prompting 🎮⚡

> **Gamified Prompt Engineering Learning Platform**

An interactive learning platform that teaches prompt engineering through gamification, real-time AI feedback, and social competition. Built with LAPP stack (Linux, Apache, PostgreSQL, PHP) and deployable via Terraform.

**Live Demo:** [Contact administrator for access]

---

## 🎯 What is This?

Teach me Prompting transforms prompt engineering education into an engaging, game-like experience. Users complete challenges, earn points and badges, compete on leaderboards, and receive instant AI-powered feedback on their prompts.

### Key Features

✅ **Interactive Challenges** - Structured prompt engineering exercises with difficulty progression  
✅ **AI-Powered Playground** - Test prompts with configurable LLM parameters (temperature, top-k, max tokens)  
✅ **Gamification** - Points, levels, streaks, badges, and achievements  
✅ **Global Leaderboard** - Compete with peers in weekly/monthly/all-time rankings  
✅ **Progress Tracking** - Skill development across multiple prompt engineering topics  
✅ **Admin Panel** - Manage challenges and AI configuration (admin users only)  
✅ **Dark Mode** - Full dark/light theme support

---

## 🏗️ Architecture

### LAPP stack

**Frontend:**
- Apache 2.4 web server
- React 18.2 + TypeScript SPA
- Tailwind CSS for styling
- Served as static files

**Backend:**
- PHP 7.4 with Apache
- RESTful API architecture
- JWT-based authentication
- PSR-4 autoloading

**Database:**
- PostgreSQL 15
- Relational schema with 11 tables
- Optimized indexes for performance
- Full ACID compliance

**AI Integration:**
- LiteLLM proxy or direct OpenAI/Anthropic API
- Configurable AI models (GPT-4, Claude, etc.)
- Streaming responses support

**Infrastructure:**
- Terraform for Infrastructure as Code
- EC2 t3.medium instance (2 vCPU, 4GB RAM)
- Automated deployment via user-data script
- Optional: CloudFlare CDN for global distribution

---

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18.2, TypeScript, Tailwind CSS |
| **Backend** | PHP 7.4, Apache 2.4 |
| **Database** | PostgreSQL 15 |
| **Authentication** | JWT (JSON Web Tokens) |
| **AI Service** | LiteLLM / OpenAI / Anthropic |
| **Email** | SMTP (PHPMailer) |
| **Infrastructure** | Terraform, AWS EC2 (or any VPS) |
| **OS** | Ubuntu 20.04 LTS |

---

## 🚀 Quick Start

### Prerequisites

- **Terraform** >= 1.0 (for infrastructure deployment)
- **PHP** 7.4+ (for local development)
- **PostgreSQL** 15+ (for local development)
- **Node.js** 16+ (for frontend build)
- **Composer** (PHP package manager)

### Option 1: Deploy to AWS EC2 (Recommended)

```bash
# Navigate to Terraform directory
cd terraform-lamp

# Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Edit with your values

# Initialize and deploy
terraform init
terraform plan
terraform apply
```

**Deployment time**: ~10-15 minutes  
**Cost**: ~$42/month for t3.medium instance

See [`terraform-lamp/README.md`](terraform-lamp/README.md) for detailed deployment instructions.

### Option 2: Local Development

#### Backend Setup

```bash
# Install backend dependencies
cd backend-php
composer install

# Configure environment
cp .env.example .env
nano .env  # Edit database and API credentials

# Start PHP development server
php -S localhost:8000 -t public
```

#### Frontend Setup

```bash
# Install frontend dependencies
cd frontend
npm install

# Start development server
npm start
```

#### Database Setup

```bash
# Create database
createdb Teach me Prompting

# Import schema
psql -d Teach me Prompting -f database/schema.sql
```

See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for complete setup instructions.

---

## 📁 Project Structure

```
PromptTrainer/
├── backend-php/           # PHP 7.4 backend
│   ├── public/           # Entry point
│   ├── src/
│   │   ├── Controllers/  # API controllers (7)
│   │   ├── Services/     # Business logic (5)
│   │   ├── Models/       # Database models (3)
│   │   ├── Middleware/   # JWT authentication
│   │   └── Core/         # Router, Request, Response
│   ├── composer.json
│   └── .env
├── frontend/             # React TypeScript app
│   ├── src/
│   ├── public/
│   └── package.json
├── database/             # PostgreSQL schema
│   └── schema.sql
├── terraform-lamp/       # Infrastructure as Code
│   ├── main.tf
│   ├── modules/
│   │   ├── networking/   # VPC, subnets
│   │   ├── security/     # Security groups, SSH keys
│   │   └── compute/      # EC2 instance
│   └── README.md
├── apache-config/        # Apache configuration
│   └── Teach me Prompting-ssl.conf
└── docs/                 # Documentation
```

---

## 🎮 User Experience

### For Learners

**Dashboard** - View your stats, recommended challenges, and quick actions  
**Challenges** - Complete prompt engineering exercises across multiple topics:  
- Basic Prompt Engineering (8 challenges)
- Advanced Techniques and Best Practices
- Industry-Specific Applications

**Playground** - Interactive prompt testing environment:  
- Adjustable LLM parameters (temperature, top-k, max tokens)
- Real-time AI responses
- Example prompts and pro tips

**Gamification Hub** - Track achievements and badges:  
- 5 achievement types (First Steps, Getting Consistent, Point Collector, etc.)
- 7 badge rarities (common, rare, epic, legendary)
- Level progression (6 levels: 1000, 2500, 5000, 10000, 20000 points)

**Leaderboard** - Compete globally:  
- Weekly, monthly, and all-time rankings
- View top performers and your position
- Real-time updates

**Profile** - Monitor your progress:  
- Skill development across topics
- Recent activity history
- Badge collection

### For Administrators

**Admin Panel** - Manage the platform:  
- Create, edit, and delete challenges
- Configure LLM parameters for different use cases
- View all challenges and their metadata

---

## 🔐 Security & Authentication

**Authentication Flow:**
1. User submits credentials to PHP backend
2. Backend validates against PostgreSQL database
3. JWT token generated and returned
4. Token stored in browser localStorage
5. API calls include JWT in Authorization header
6. JWT middleware validates token on each request

**Security Features:**
- JWT tokens with configurable expiration
- Bcrypt password hashing
- Role-based access control (admin, users)
- CORS configuration
- Input sanitization and validation
- Prepared statements (SQL injection prevention)
- HTTPS support (via Let's Encrypt)
- Security headers (CSP, HSTS, X-Frame-Options)

---

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

### Progress (Protected)
- `GET /progress` - Get user progress
- `POST /progress/sync` - Sync progress data
- `GET /achievements` - Get user achievements
- `GET /badges` - Get user badges

### Profile (Protected)
- `GET /profile` - Get user profile
- `GET /profile/activities` - Get activity history

### Leaderboard (Protected)
- `GET /leaderboard?period=weekly|monthly|all-time` - Get rankings

### Quests (Protected)
- `GET /quests` - List all quests
- `GET /quests/{questId}/progress` - Get quest progress
- `POST /quests/{questId}/level/{levelNumber}` - Submit quest level

### Playground (Protected)
- `POST /prompt` - Execute prompt with AI

### Admin (Protected - Admin Only)
- `GET /admin/llm-config` - Get LLM configuration
- `PUT /admin/llm-config` - Update LLM configuration
- `GET /admin/challenges` - List all challenges
- `POST /admin/challenges` - Create challenge
- `PUT /admin/challenges/{id}` - Update challenge
- `DELETE /admin/challenges/{id}` - Delete challenge

**Total: 31 endpoints**

---

## 📊 Database Schema

PostgreSQL 15 with 11 tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `user_progress` | Points, levels, streaks |
| `challenges` | Challenge definitions |
| `user_challenges` | Challenge completions |
| `activities` | User activity log |
| `quests` | Quest metadata |
| `quest_progress` | Quest completion tracking |
| `achievements` | Achievement definitions |
| `user_achievements` | Earned achievements |
| `badges` | Badge definitions |
| `llm_config` | AI model configuration |

See [`database/schema.sql`](database/schema.sql) for complete schema.

---

## 🤖 AI Configuration

### LiteLLM Proxy (Recommended)

```bash
# Install LiteLLM
pip install litellm

# Run proxy
litellm --model gpt-4 --port 4000

# Configure in .env
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

---

## 💰 Cost Estimate

### AWS EC2 Deployment (Monthly)

| Resource | Specification | Cost |
|----------|--------------|------|
| EC2 Instance | t3.medium (2 vCPU, 4GB) | $30 |
| EBS Storage | 30GB gp3 | $3 |
| Elastic IP | 1 static IP | $0 |
| Data Transfer | ~100GB | $9 |
| **Total** | | **~$42/month** |

### AI API Costs (Variable)

| Provider | Model | Cost per 1M tokens |
|----------|-------|-------------------|
| OpenAI | GPT-4 | $30 (input) / $60 (output) |
| OpenAI | GPT-3.5 Turbo | $0.50 / $1.50 |
| Anthropic | Claude 3 Sonnet | $3 / $15 |

**Cost Optimization:**
- Use t3.small for development ($15/month)
- Use GPT-3.5 Turbo for lower costs
- Implement caching for AI responses
- Use Reserved Instances (30-40% savings)

---

## 🚀 Deployment

### Production Deployment

1. **Configure Terraform variables**
   ```bash
   cd terraform-lamp
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

2. **Deploy infrastructure**
   ```bash
   terraform init
   terraform apply
   ```

3. **Configure DNS** (optional)
   - Point your domain to the Elastic IP
   - Update `app_domain` in terraform.tfvars
   - Redeploy: `terraform apply`

4. **Set up SSL**
   ```bash
   ssh -i Teach me Prompting-lamp-key.pem ubuntu@<IP>
   sudo certbot --apache -d yourdomain.com
   ```

5. **Verify deployment**
   - Access application at your domain or IP
   - Test authentication flow
   - Verify AI integration

See [`terraform-lamp/README.md`](terraform-lamp/README.md) for detailed instructions.

---

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[PHP74_COMPATIBILITY.md](PHP74_COMPATIBILITY.md)** - PHP 7.4 compatibility guide
- **[CONVERSION_COMPLETE.md](CONVERSION_COMPLETE.md)** - Migration from AWS to LAMP
- **[terraform-lamp/README.md](terraform-lamp/README.md)** - Terraform infrastructure guide
- **[backend-php/README.md](backend-php/README.md)** - Backend API documentation

---

## 🛠️ Development

### Adding New Endpoints

1. Create controller method in `backend-php/src/Controllers/`
2. Add route in `backend-php/src/routes.php`
3. Add middleware if protected: `$auth->wrap([Controller::class, 'method'])`

### Adding New Models

1. Create model class in `backend-php/src/Models/`
2. Use PDO prepared statements
3. Follow existing patterns (see User.php, Challenge.php)

### Frontend Development

```bash
cd frontend
npm start  # Development server on port 3000
npm run build  # Production build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

**Code Standards:**
- Follow PSR-4 autoloading (PHP)
- Use TypeScript for frontend
- Add PHPDoc comments for public methods
- Keep controllers thin, move logic to services
- Use prepared statements for all database queries

---

## 📄 License

MIT License

---

## 📧 Contact

**Project Owner:** Tony Yang  
**Repository:** [YangKuoshih/PromptTrainer](https://github.com/YangKuoshih/PromptTrainer)

---

## 🎯 Why LAPP stack?

**Simplicity** - Single server, easy to understand and maintain  
**Cost-Effective** - Fixed monthly cost (~$42) vs variable serverless costs  
**Full Control** - Root access, custom configuration, no vendor lock-in  
**Proven Technology** - Battle-tested stack used by millions of applications  
**Easy Migration** - Can deploy to any VPS provider (DigitalOcean, Linode, etc.)  
**Developer Friendly** - Familiar technologies, extensive documentation  

---

## 🚀 Next Steps

1. **Deploy Infrastructure**: Follow the Terraform guide
2. **Configure AI Service**: Set up LiteLLM or direct API access
3. **Customize**: Modify challenges, themes, and settings
4. **Monitor**: Set up logging and backups
5. **Scale**: Add load balancing and CDN as needed
