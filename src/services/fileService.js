import { profileService, s3Utils } from "../config/container.js";
import { storageConfig } from "../config/storageConfig.js";
import { activityLogger } from "../utils/activityLogger.js";
import { BadRequestError } from "../utils/httpErrors.js";

export const fileService = {
  createAvatarUpload: async (userId, fileType) => {

    if(storageConfig.provider !== "s3") {
      throw new BadRequestError("Unsupported storage provider")
    }
    
    if (!storageConfig.avatar.allowedTypes.includes(fileType)) {
      throw new BadRequestError(`Unsupported file type. Allowed file types: ${storageConfig.avatar.allowedTypes.join(", ")}`)
    }

    await profileService.cleanupOldAvatar(userId);

    const avatarKey = `${userId}-${Date.now()}`;
    const s3Key = `avatars/original/${avatarKey}`;

    const uploadURL = await s3Utils.generateUploadURL({
      key: s3Key,
      contentType: fileType,
      maxSizeMB: storageConfig.avatar.maxSizeMB,
    });
  
  await activityLogger.logAvatarUploadInitiated({userId, avatarKey})

  return { uploadURL, key: s3Key };
  },
};
