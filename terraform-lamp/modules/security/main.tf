# Security Module - Security Groups, Key Pairs
# Manages security configuration for LAMP stack

# Security Group for LAMP Stack
resource "aws_security_group" "lamp" {
  name        = "${var.project_name}-${var.environment}-lamp-sg"
  description = "Security group for LAMP stack EC2 instance"
  vpc_id      = var.vpc_id
  
  # SSH
  ingress {
    description = "SSH from allowed CIDR"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }
  
  # HTTP
  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # HTTPS
  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # PHP Development Server (optional, for testing)
  ingress {
    description = "PHP dev server"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Outbound - Allow all
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-lamp-sg"
  }
}

# SSH Key Pair
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "lamp" {
  key_name   = var.ssh_key_name
  public_key = tls_private_key.ssh.public_key_openssh
  
  tags = {
    Name = "${var.project_name}-${var.environment}-key"
  }
}

# Save private key locally
resource "local_file" "private_key" {
  content         = tls_private_key.ssh.private_key_pem
  filename        = "${path.root}/${var.ssh_key_name}.pem"
  file_permission = "0600"
}
