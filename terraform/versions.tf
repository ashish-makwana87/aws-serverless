terraform {
  required_version = ">= 1.8.0"
  
  backend "s3" {
  bucket       = "aws-serverless-terraform-state-460783431820"
  key          = "aws-serverless/dev/terraform.tfstate"
  region       = "ap-south-1"
  use_lockfile = true
}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

