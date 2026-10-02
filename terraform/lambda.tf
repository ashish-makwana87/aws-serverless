resource "aws_ecr_repository" "app" {
  name = "${var.service_name}-${var.environment}"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = local.common_tags
}

resource "aws_lambda_function" "api_lambda" {

  function_name = "${var.service_name}-${var.environment}-apiLambda"

  package_type = "Image"
  image_uri    = var.lambda_image_uri

  image_config {
    command = ["src/api/handler.handler"]
  }

  role = aws_iam_role.lambda_role.arn

  timeout     = 6
  memory_size = 1024

  environment {
    variables = {
      MONGODB_URI = var.mongodb_uri
      DB_NAME     = var.db_name
      JWT_EXP     = var.jwt_exp

      AVATAR_BUCKET       = data.aws_s3_bucket.avatar_bucket.bucket
      CLOUDFRONT_URL      = var.cloudfront_url
      SQS_QUEUE_URL       = var.sqs_queue_url
      PROFILE_CACHE_TABLE = var.profile_cache_table

      STORAGE_PROVIDER     = var.storage_provider
      AVATAR_MAX_SIZE_MB   = var.avatar_max_size_mb
      AVATAR_ALLOWED_TYPES = var.avatar_allowed_types

      SECRET_NAME = "aws-serverless/dev"
    }
  }

  tags = local.common_tags
}


resource "aws_lambda_function" "image_resize" {

  function_name = "${var.service_name}-${var.environment}-imageResize"

  package_type = "Image"
  image_uri    = var.lambda_image_uri

  image_config {
    command = ["src/functions/imageResizeHandler.handler"]
  }

  role = aws_iam_role.lambda_role.arn

  timeout     = 6
  memory_size = 1024

  environment {
    variables = {
      MONGODB_URI = var.mongodb_uri
      DB_NAME     = var.db_name
      JWT_EXP     = var.jwt_exp

      AVATAR_BUCKET       = data.aws_s3_bucket.avatar_bucket.bucket
      CLOUDFRONT_URL      = var.cloudfront_url
      SQS_QUEUE_URL       = var.sqs_queue_url
      PROFILE_CACHE_TABLE = var.profile_cache_table

      STORAGE_PROVIDER     = var.storage_provider
      AVATAR_MAX_SIZE_MB   = var.avatar_max_size_mb
      AVATAR_ALLOWED_TYPES = var.avatar_allowed_types

      SECRET_NAME = "aws-serverless/dev"
    }
  }

  tags = local.common_tags
}


resource "aws_lambda_event_source_mapping" "image_resize_sqs" {
  event_source_arn = data.aws_sqs_queue.avatar_processing.arn
  function_name    = aws_lambda_function.image_resize.arn
  batch_size       = 1
  enabled          = true
}