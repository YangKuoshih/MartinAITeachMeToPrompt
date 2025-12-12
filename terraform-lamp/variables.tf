# Project Configuration
variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "promptwars"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "production"
}

# AWS Configuration
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "availability_zone" {
  description = "Availability zone for resources"
  type        = string
  default     = "us-east-1a"
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Compute
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "ami_id" {
  description = "AMI ID for Ubuntu 20.04 LTS (leave empty for auto-lookup)"
  type        = string
  default     = ""
}

# Security
variable "ssh_key_name" {
  description = "Name for the SSH key pair (will be created if doesn't exist)"
  type        = string
  default     = "promptwars-lamp-key"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH (restrict to your IP!)"
  type        = string
  default     = "0.0.0.0/0"  # WARNING: Change this to your IP!
}

# Application Configuration
variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key for authentication"
  type        = string
  sensitive   = true
}

variable "litellm_api_key" {
  description = "LiteLLM/OpenAI API key"
  type        = string
  sensitive   = true
}

variable "litellm_model" {
  description = "AI model to use (gpt-4, claude-3-sonnet-20240229, etc.)"
  type        = string
  default     = "gpt-4"
}

variable "smtp_host" {
  description = "SMTP server host"
  type        = string
  default     = "smtp.gmail.com"
}

variable "smtp_port" {
  description = "SMTP server port"
  type        = number
  default     = 587
}

variable "smtp_user" {
  description = "SMTP username"
  type        = string
}

variable "smtp_pass" {
  description = "SMTP password"
  type        = string
  sensitive   = true
}

variable "smtp_from" {
  description = "From email address"
  type        = string
  default     = "noreply@promptwars.com"
}

variable "app_domain" {
  description = "Application domain name (leave empty if no domain)"
  type        = string
  default     = ""
}

# Repository Configuration
variable "git_repo_url" {
  description = "Git repository URL for application code"
  type        = string
  default     = "https://github.com/YangKuoshih/PromptTrainer.git"
}

variable "git_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}
