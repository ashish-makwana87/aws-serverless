variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "ap-south-1"
}

variable "service_name" {
  description = "Serverless service name"
  type        = string
  default     = "aws-api"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "aws-serverless"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "mongodb_uri" {
  type        = string
  description = "MongoDB connection string"
}

variable "db_name" {
  type        = string
  description = "MongoDB database name"
}

variable "jwt_exp" {
  type        = string
  description = "JWT expiration"
}

variable "cloudfront_url" {
  type        = string
  description = "CloudFront distribution URL"
}

variable "sqs_queue_url" {
  type        = string
  description = "Avatar processing queue URL"
}

variable "profile_cache_table" {
  type        = string
  description = "DynamoDB profile cache table"
}

variable "storage_provider" {
  type        = string
  description = "Storage provider"
}

variable "avatar_max_size_mb" {
  type        = string
  description = "Maximum avatar size"
}

variable "avatar_allowed_types" {
  type        = string
  description = "Allowed avatar MIME types"
}

variable "lambda_image_uri" {
  description = "ECR image URI used by Lambda functions"
  type        = string
}











