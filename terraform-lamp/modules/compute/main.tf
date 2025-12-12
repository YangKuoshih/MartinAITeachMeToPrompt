# Compute Module - EC2 Instance
# Creates and configures EC2 instance for LAMP stack

# Get latest Ubuntu 20.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Render user-data script with variables
data "template_file" "user_data" {
  template = file("${path.module}/user-data.sh")
  
  vars = {
    db_password     = var.db_password
    jwt_secret      = var.jwt_secret
    litellm_api_key = var.litellm_api_key
    litellm_model   = var.litellm_model
    smtp_host       = var.smtp_host
    smtp_port       = var.smtp_port
    smtp_user       = var.smtp_user
    smtp_pass       = var.smtp_pass
    smtp_from       = var.smtp_from
    app_url         = var.app_domain != "" ? "https://${var.app_domain}" : "http://localhost"
    domain_name     = var.app_domain != "" ? var.app_domain : "localhost"
    git_repo_url    = var.git_repo_url
    git_branch      = var.git_branch
  }
}

# EC2 Instance
resource "aws_instance" "lamp" {
  ami                    = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = var.security_group_ids
  
  user_data = data.template_file.user_data.rendered
  
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    encrypted             = true
    
    tags = {
      Name = "${var.project_name}-${var.environment}-root-volume"
    }
  }
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }
  
  tags = {
    Name = "${var.project_name}-${var.environment}-lamp-instance"
  }
  
  lifecycle {
    ignore_changes = [ami]
  }
}
