output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "region" {
  value = data.aws_region.current.name
}

output "ecr_repository_url" {
  description = "ECR repository URL for Lambda container images"
  value       = aws_ecr_repository.app.repository_url
}

