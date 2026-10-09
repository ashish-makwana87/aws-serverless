import { env } from "./env.js";

export const storageConfig = {
  provider: env.STORAGE_PROVIDER,
  avatar: {
    bucket: env.AVATAR_BUCKET,
    maxSizeMB: env.AVATAR_MAX_SIZE_MB,
    allowedTypes: env.AVATAR_ALLOWED_TYPES,
  },
};

