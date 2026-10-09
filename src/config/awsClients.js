import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { env } from "./env.js";

const clientConfig = {
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT || undefined,
};

export const s3Client = new S3Client(clientConfig);

export const sqsClient = new SQSClient(clientConfig);

export const secretsManagerClient = new SecretsManagerClient(clientConfig);

export const dynamoDbClient = DynamoDBDocumentClient.from(
  new DynamoDBClient(clientConfig),
);
