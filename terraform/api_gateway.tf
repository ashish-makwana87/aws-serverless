resource "aws_apigatewayv2_api" "http_api" {
  name          = "dev-aws-api"
  protocol_type = "HTTP"

  tags = {
    STAGE = var.environment
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "aws-api-dev-ApiLambdaLambdaPermissionHttpApi-FOgTMqSmXDTG"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*"
}

resource "aws_apigatewayv2_integration" "api_lambda" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.api_lambda.invoke_arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 30000
}

locals {
  api_routes = {
    "POST /auth/login"                  = "372b1ee"
    "PUT /admin/profile/{userId}"       = "5wft3o0"
    "PUT /user/profile"                 = "b1x3aj6"
    "POST /user/deactivate"             = "dslzq2d"
    "GET /admin/stats"                  = "grbiewq"
    "DELETE /user/profile"              = "nd6s8f9"
    "POST /auth/signup"                 = "ny9wl05"
    "POST /user/avatar/upload-complete" = "qn4478d"
    "POST /user/avatar/upload-url"      = "vpucpgp"
    "GET /user/profile"                 = "x5ahwvo"
  }
}

resource "aws_apigatewayv2_route" "routes" {
  for_each = local.api_routes

  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = each.key
  target    = "integrations/${aws_apigatewayv2_integration.api_lambda.id}"
}

