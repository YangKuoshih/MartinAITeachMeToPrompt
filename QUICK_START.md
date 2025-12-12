# Quick Start Guide - Teach me Prompting

## 🚀 Get Started in 5 Minutes

### Prerequisites

- **PHP 7.4+**
- **PostgreSQL 15+**
- **Node.js 16+**
- **Composer**

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YangKuoshih/PromptTrainer.git
cd PromptTrainer
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb prompttrainer

# Import schema
psql -d prompttrainer -f database/schema.sql
```

### 3. Configure Backend

```bash
cd backend-php

# Install dependencies
composer install

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Required .env variables:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prompttrainer
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-random-secret-key-min-32-chars
JWT_EXPIRY=3600

LITELLM_API_KEY=sk-...  # OpenAI or Anthropic API key
LITELLM_BASE_URL=https://api.openai.com/v1
LITELLM_MODEL=gpt-4

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@prompttrainer.com

APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### 4. Start Backend Server

```bash
# From backend-php directory
php -S localhost:8000 -t public
```

Backend API will be available at `http://localhost:8000`

### 5. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at `http://localhost:3000`

---

## Production Deployment (AWS EC2)

### Using Terraform

```bash
cd terraform-lamp

# Copy configuration template
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars

# Deploy infrastructure
terraform init
terraform plan
terraform apply
```

**Deployment includes:**
- ✅ EC2 t3.medium instance (Ubuntu 20.04)
- ✅ Apache 2.4 + PHP 7.4
- ✅ PostgreSQL 15
- ✅ Automated application deployment
- ✅ Security groups and networking
- ✅ Elastic IP for static address

**Deployment time:** ~15 minutes  
**Monthly cost:** ~$42

See `terraform-lamp/README.md` for detailed instructions.

---

## First Steps After Setup

### 1. Create Admin User

```bash
# SSH into server (if using Terraform deployment)
ssh -i prompttrainer-lamp-key.pem ubuntu@<your-ip>

# Or locally, navigate to backend-php
cd backend-php

# Create admin user
php -r "
require 'vendor/autoload.php';
\$db = new PDO('pgsql:host=localhost;dbname=prompttrainer', 'postgres', 'your_password');
\$hash = password_hash('admin123', PASSWORD_BCRYPT);
\$db->exec(\"INSERT INTO users (username, email, password_hash, is_admin, email_verified) VALUES ('admin', 'admin@example.com', '\$hash', true, true)\");
echo 'Admin user created!\n';
"
```

### 2. Log In

- Navigate to `http://localhost:3000` (or your server IP)
- Click "Sign In"
- Use credentials: `admin` / `admin123`
- **Change password immediately!**

### 3. Test AI Integration

- Go to **Playground**
- Enter a test prompt
- Verify AI responses are working

### 4. Explore Features

- **Dashboard** - View your progress
- **Challenges** - Complete prompt engineering exercises
- **Quests** - Try role-playing scenarios
- **Leaderboard** - Compete with others
- **Profile** - Track your skills
- **Admin Panel** - Manage challenges (admin only)

---

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8000   # Windows
```

**Database connection error:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials in .env
psql -h localhost -U postgres -d prompttrainer
```

### Frontend Issues

**Dependencies not installing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API calls failing:**
- Check backend is running on port 8000
- Verify CORS settings in backend `.env`
- Check browser console for errors

### AI Integration Issues

**API key not working:**
- Verify `LITELLM_API_KEY` in `.env`
- Check API key has credits
- Test with curl:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $LITELLM_API_KEY"
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         User's Browser                  │
│  ┌───────────────────────────────────┐ │
│  │   React Frontend (Port 3000)      │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
                 ↓ HTTP
┌─────────────────────────────────────────┐
│         Server                          │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Apache      │  │  PHP 7.4 API    │ │
│  │  (Port 80)   │  │  (Port 8000)    │ │
│  └──────────────┘  └─────────────────┘ │
│                           ↓             │
│                    ┌─────────────────┐ │
│                    │  PostgreSQL 15  │ │
│                    └─────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18.2 + TypeScript |
| **Backend** | PHP 7.4 + Apache 2.4 |
| **Database** | PostgreSQL 15 |
| **Auth** | JWT tokens |
| **AI** | LiteLLM / OpenAI / Anthropic |
| **Email** | SMTP (PHPMailer) |
| **Deploy** | Terraform + AWS EC2 |

---

## Next Steps

1. **Customize Challenges** - Add your own prompt engineering exercises
2. **Configure AI Model** - Choose GPT-4, Claude, or other models
3. **Set Up SSL** - Use Let's Encrypt for HTTPS
4. **Add Users** - Invite team members
5. **Monitor** - Set up logging and backups

---

## Need Help?

- **Documentation**: See `README.md` for full details
- **Terraform Guide**: See `terraform-lamp/README.md`
- **Backend API**: See `backend-php/README.md`
- **Issues**: Open an issue on GitHub

---

## License

MIT License - See `LICENSE` file
