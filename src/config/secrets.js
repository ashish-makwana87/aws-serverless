import {
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { env } from "./env.js";
import { secretsManagerClient } from "./awsClients.js";

let cachedSecrets = null;

export const loadSecrets = async () => {
  
  // Prevent repeated calls during warm invocations
  if (cachedSecrets) {
    return cachedSecrets;
  }

  try {
    const command = new GetSecretValueCommand({
    SecretId: env.SECRET_NAME,
  });

  const response = await secretsManagerClient.send(command);

  cachedSecrets = JSON.parse(response.SecretString);

  return cachedSecrets;
  } catch (error) {
    console.error("Failed to load secrets from AWS Secrets Manager", {
      secretName: env.SECRET_NAME,
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

export const getSecrets = () => {

  if (!cachedSecrets) {
    throw new Error(
      "Secrets have not been loaded. Call loadSecrets() before using getSecrets().",
    );
  }

  return cachedSecrets;
};