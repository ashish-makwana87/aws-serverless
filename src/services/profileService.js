import { userProfileRepository } from "../repositories/userProfileRepository.js";
import { userProfileModel } from "../models/userProfileModel.js";
import { activityLogger } from "../utils/activityLogger.js";
import { NotFoundError } from "../utils/httpErrors.js";


export const createProfileService = ({
  dynamoProfileCacheRepository,
  s3Utils,
  sqsUtils,
  cloudFrontUrl,
  avatarBucket,
}) => ({
  getProfile: async (userId) => {
    
    // Checking cache
    let profile = await dynamoProfileCacheRepository.get(userId);

    if (profile) {
      if (profile.avatarKey) {
        profile.avatarUrl = `${cloudFrontUrl}/avatars/optimized/${profile.avatarKey}.webp`;
      } else {
        profile.avatarUrl = null;
      }

      return profile;
    }

    // Fetch from MongoDB
    profile = await userProfileRepository.findByUserId(userId);

    if (!profile) {
      profile = userProfileModel.defaultProfile(userId);
      await userProfileRepository.create(profile);
    }

    // Store in cache
    await dynamoProfileCacheRepository.put(profile);

    if (profile.avatarKey) {
      profile.avatarUrl = `${cloudFrontUrl}/avatars/optimized/${profile.avatarKey}.webp`;
    } else {
      profile.avatarUrl = null;
    }

    return profile;
  },

  updateProfile: async (userId, data) => {
    const updatedFields = Object.keys(data);

    const currentProfile = await userProfileRepository.findByUserId(userId);
    if (!currentProfile) {
      throw new NotFoundError("Profile not found");
    }

    await userProfileRepository.update(userId, data);

    // Invalidate cache
    await dynamoProfileCacheRepository.delete(userId);

    await activityLogger.logProfileUpdate({ userId, updatedFields });

    return { message: "Profile updated" };
  },

  deleteProfile: async (userId) => {
    await userProfileRepository.delete(userId);

    // Remove cache
    await dynamoProfileCacheRepository.delete(userId);

    return { message: "Profile deleted" };
  },

  updateAvatarKey: async (userId, avatarKey) => {
    if (!userId || !avatarKey) return;

    await userProfileRepository.updateAvatarKey(userId, avatarKey);

    // Remove cache
    await dynamoProfileCacheRepository.delete(userId);
  },

  cleanupOldAvatar: async (userId) => {
    if (!userId) return;

    const profile = await userProfileRepository.findByUserId(userId);
    if (!profile || !profile.avatarKey) return;

    await s3Utils.deleteAvatarObjects(profile.avatarKey);

    await activityLogger.logAvatarDeleted({
      userId,
      oldAvatarKey: profile.avatarKey,
    });
  },

  uploadComplete: async (userId, key) => {
    await sqsUtils.publishImageProcessingJob({
      bucket: avatarBucket,
      key,
      userId,
    });
  },
});
