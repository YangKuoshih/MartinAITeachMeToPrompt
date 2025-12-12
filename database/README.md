# Database Setup

## PostgreSQL Installation

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database
```bash
sudo -u postgres psql
CREATE DATABASE promptwars;
CREATE USER promptwars_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE promptwars TO promptwars_user;
\q
```

## Run Migrations

```bash
psql -U promptwars_user -d promptwars -f schema.sql
```

## Schema Overview

### Core Tables
- **users**: User accounts and authentication
- **user_progress**: Points, levels, streaks, overall stats
- **topic_progress**: Per-topic challenge completion tracking
- **badges**: User badge collection
- **activities**: User activity history

### Challenge System
- **challenges**: Challenge definitions
- **quests**: Quest metadata
- **quest_levels**: Individual quest level data
- **quest_progress**: User quest completion tracking

### Configuration
- **llm_config**: AI model parameters

### Views
- **leaderboard**: Optimized leaderboard query with rankings

## Key Differences from DynamoDB

| DynamoDB | PostgreSQL |
|----------|------------|
| Single table with pk/sk | Multiple normalized tables |
| GSI for leaderboard | Materialized view with indexes |
| Flexible schema | Strict schema with constraints |
| No joins | Foreign key relationships |
| Item-based queries | SQL queries with joins |

## Indexes
All critical query paths are indexed:
- User lookups (user_id, username, email)
- Leaderboard sorting (points DESC)
- Activity history (timestamp DESC)
- Challenge filtering (difficulty, category)

## Performance Tips
- Use connection pooling (pg_pool)
- Enable query caching
- Monitor slow queries with pg_stat_statements
- Regular VACUUM and ANALYZE