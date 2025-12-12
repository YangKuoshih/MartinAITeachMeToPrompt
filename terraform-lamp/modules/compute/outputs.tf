output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.lamp.id
}

output "private_ip" {
  description = "Private IP address"
  value       = aws_instance.lamp.private_ip
}

output "public_ip" {
  description = "Public IP address (before EIP)"
  value       = aws_instance.lamp.public_ip
}
