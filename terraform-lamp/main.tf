# PromptWARS LAMP Stack on AWS EC2
# Terraform configuration for deploying Apache, PHP 7.4, PostgreSQL 15

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "PromptWARS"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Stack       = "LAMP"
    }
  }
}

# Networking Module
module "networking" {
  source = "./modules/networking"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  az           = var.availability_zone
}

# Security Module
module "security" {
  source = "./modules/security"
  
  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  allowed_ssh_cidr = var.allowed_ssh_cidr
  ssh_key_name    = var.ssh_key_name
}

# Compute Module
module "compute" {
  source = "./modules/compute"
  
  project_name        = var.project_name
  environment         = var.environment
  instance_type       = var.instance_type
  ami_id              = var.ami_id
  key_name            = module.security.key_pair_name
  subnet_id           = module.networking.public_subnet_id
  security_group_ids  = [module.security.lamp_security_group_id]
  
  # Application configuration
  db_password         = var.db_password
  jwt_secret          = var.jwt_secret
  litellm_api_key     = var.litellm_api_key
  litellm_model       = var.litellm_model
  smtp_host           = var.smtp_host
  smtp_port           = var.smtp_port
  smtp_user           = var.smtp_user
  smtp_pass           = var.smtp_pass
  smtp_from           = var.smtp_from
  app_domain          = var.app_domain
  
  # Repository configuration
  git_repo_url        = var.git_repo_url
  git_branch          = var.git_branch
}

# Elastic IP for static public IP
resource "aws_eip" "lamp" {
  domain   = "vpc"
  instance = module.compute.instance_id
  
  tags = {
    Name = "${var.project_name}-${var.environment}-eip"
  }
}
