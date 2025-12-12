output "lamp_security_group_id" {
  description = "LAMP security group ID"
  value       = aws_security_group.lamp.id
}

output "key_pair_name" {
  description = "SSH key pair name"
  value       = aws_key_pair.lamp.key_name
}

output "private_key_path" {
  description = "Path to private key file"
  value       = local_file.private_key.filename
}
