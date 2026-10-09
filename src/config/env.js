import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["dev", "test", "prod"]).default("dev"),

  AWS_REGION: z.string().min(1).default("ap-south-1"),

  AWS_ENDPOINT: z.url().optional().or(z.literal("")),

  AVATAR_BUCKET: z.string().min(1),

  AVATAR_MAX_SIZE_MB: z.coerce.number().positive().default(5),

  AVATAR_ALLOWED_TYPES: z
    .string()
    .min(1)
    .transform((value) => value.split(",").map((type) => type.trim())),

  STORAGE_PROVIDER: z.string().default("s3"),

  SQS_QUEUE_URL: z.url(),

  PROFILE_CACHE_TABLE: z.string().min(1),

  CLOUDFRONT_URL: z.string().min(1),

  JWT_EXP: z.string().default("15m"),

  SECRET_NAME: z.string().min(1),

  MONGODB_URI: z.string().min(1),

  DB_NAME: z.string().min(1),

  TEST_DB_NAME: z.string().min(1).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");

  console.error(z.prettifyError(parsedEnv.error));

  throw new Error("Application environment configuration is invalid.");
}

export const env = parsedEnv.data;
