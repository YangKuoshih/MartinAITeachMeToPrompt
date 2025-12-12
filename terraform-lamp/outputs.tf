# Network Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "public_subnet_id" {
  description = "Public subnet ID"
  value       = module.networking.public_subnet_id
}

# Security Outputs
output "security_group_id" {
  description = "LAMP security group ID"
  value       = module.security.lamp_security_group_id
}

output "key_pair_name" {
  description = "SSH key pair name"
  value       = module.security.key_pair_name
}

# Compute Outputs
output "instance_id" {
  description = "EC2 instance ID"
  value       = module.compute.instance_id
}

output "instance_private_ip" {
  description = "EC2 instance private IP"
  value       = module.compute.private_ip
}

output "instance_public_ip" {
  description = "EC2 instance public IP (Elastic IP)"
  value       = aws_eip.lamp.public_ip
}

# Connection Information
output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.ssh_key_name}.pem ubuntu@${aws_eip.lamp.public_ip}"
}

output "application_url" {
  description = "Application URL"
  value       = var.app_domain != "" ? "https://${var.app_domain}" : "http://${aws_eip.lamp.public_ip}"
}

output "api_url" {
  description = "API URL"
  value       = var.app_domain != "" ? "https://${var.app_domain}/api" : "http://${aws_eip.lamp.public_ip}:8000"
}

# Database Information
output "database_connection_string" {
  description = "PostgreSQL connection string (for reference)"
  value       = "postgresql://promptwars_user:***@localhost:5432/promptwars"
  sensitive   = true
}

# Next Steps
output "next_steps" {
  description = "Next steps after deployment"
  value       = <<-EOT
    
    ✅ Deployment Complete!
    
    1. SSH into the instance:
       ${self.ssh_command}
    
    2. Check deployment status:
       sudo systemctl status apache2
       sudo systemctl status postgresql
    
    3. View logs:
       sudo tail -f /var/log/apache2/error.log
       sudo tail -f /var/log/deployment.log
    
    4. Access the application:
       Frontend: ${self.application_url}
       API: ${self.api_url}
    
    5. Configure DNS (if using domain):
       Point ${var.app_domain} to ${aws_eip.lamp.public_ip}
    
    6. Set up SSL certificate:
       sudo certbot --apache -d ${var.app_domain}
    
  EOT
}
