import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../src/repositories/userProfileRepository.js",
  () => ({
    userProfileRepository: {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateAvatarKey: jest.fn(),
    },
  }),
);

jest.unstable_mockModule("../../src/models/userProfileModel.js", () => ({
  userProfileModel: {
    defaultProfile: jest.fn(),
  },
}));

jest.unstable_mockModule("../../src/utils/activityLogger.js", () => ({
  activityLogger: {
    logProfileUpdate: jest.fn(),
    logAvatarDeleted: jest.fn(),
  },
}));

const { createProfileService } =
  await import("../../src/services/profileService.js");
const { userProfileRepository } =
  await import("../../src/repositories/userProfileRepository.js");
const { userProfileModel } =
  await import("../../src/models/userProfileModel.js");
const { activityLogger } = await import("../../src/utils/activityLogger.js");

const dynamoProfileCacheRepository = {
  get: jest.fn().mockResolvedValue(null),
  put: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};

const s3Utils = {
  deleteAvatarObjects: jest.fn().mockResolvedValue(undefined),
};

const sqsUtils = {
  publishImageProcessingJob: jest.fn().mockResolvedValue(undefined),
};

const profileService = createProfileService({
  dynamoProfileCacheRepository,
  s3Utils,
  sqsUtils,
  cloudFrontUrl: "https://test-cloudfront.example.com",
  avatarBucket: "test-bucket",
});

describe("profileService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================
  //  getProfile test
  // ===========================

  describe("getProfile", () => {
    it("returns existing profile if found", async () => {
      const userId = "user-1";
      const profile = { userId, firstName: "Ashish" };
      jest
        .mocked(userProfileRepository.findByUserId)
        .mockResolvedValue(profile);

      const result = await profileService.getProfile(userId);

      expect(userProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(userProfileRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(profile);
    });

    it("creates and returns default profile if not found", async () => {
      const userId = "user-2";
      const defaultProfile = { userId };

      jest.mocked(userProfileRepository.findByUserId).mockResolvedValue(null);
      jest
        .mocked(userProfileModel.defaultProfile)
        .mockReturnValue(defaultProfile);

      const result = await profileService.getProfile(userId);

      expect(userProfileModel.defaultProfile).toHaveBeenCalledWith(userId);
      expect(userProfileRepository.create).toHaveBeenCalledWith(defaultProfile);
      expect(result).toEqual(defaultProfile);
    });
  });

  // ===========================
  //  updateProfile test
  // ===========================

  describe("updateProfile", () => {
    it("updates profile and logs updated fields", async () => {
      const userId = "user-3";
      const profile = { userId, firstName: "Ashish" };
      const data = { firstName: "Ashish", phone: "123" };

      jest
        .mocked(userProfileRepository.findByUserId)
        .mockResolvedValue(profile);
      jest.mocked(userProfileRepository.update).mockResolvedValue({});
      activityLogger.logProfileUpdate.mockResolvedValue();

      const result = await profileService.updateProfile(userId, data);

      expect(userProfileRepository.update).toHaveBeenCalledWith(userId, data);

      expect(activityLogger.logProfileUpdate).toHaveBeenCalledWith({
        userId,
        updatedFields: ["firstName", "phone"],
      });

      expect(result).toEqual({ message: "Profile updated" });
    });

    it("throws NotFoundError when profile does not exist", async () => {
      const userId = "user-3";
      const profile = { userId, firstName: "Ashish" };

      jest.mocked(userProfileRepository.findByUserId).mockResolvedValue(null);

      await expect(
        profileService.updateProfile(userId, profile),
      ).rejects.toThrow("Profile not found");
    });
  });

  // ===========================
  //  deleteProfile test
  // ===========================

  describe("deleteProfile", () => {
    it("deletes profile", async () => {
      const userId = "user-4";

      jest.mocked(userProfileRepository.delete).mockResolvedValue({});

      const result = await profileService.deleteProfile(userId);

      expect(userProfileRepository.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ message: "Profile deleted" });
    });
  });

  // ===========================
  //  updateAvatarKey test
  // ===========================

  describe("updateAvatarKey", () => {
    it("updates avatar key when valid inputs are provided", async () => {
      const userId = "user-5";
      const avatarKey = "avatar-123";

      jest.mocked(userProfileRepository.updateAvatarKey).mockResolvedValue({});

      await profileService.updateAvatarKey(userId, avatarKey);

      expect(userProfileRepository.updateAvatarKey).toHaveBeenCalledWith(
        userId,
        avatarKey,
      );
    });

    it("does nothing when userId or avatarKey is missing", async () => {
      await profileService.updateAvatarKey(null, null);

      expect(userProfileRepository.updateAvatarKey).not.toHaveBeenCalled();
    });
  });

  // ===========================
  //  cleanupOldAvatar test
  // ===========================

  describe("cleanupOldAvatar", () => {
    it("deletes old avatar and logs deletion", async () => {
      const userId = "user-6";
      const profile = { avatarKey: "old-avatar" };

      jest
        .mocked(userProfileRepository.findByUserId)
        .mockResolvedValue(profile);
      s3Utils.deleteAvatarObjects.mockResolvedValue();
      activityLogger.logAvatarDeleted.mockResolvedValue();

      await profileService.cleanupOldAvatar(userId);

      expect(s3Utils.deleteAvatarObjects).toHaveBeenCalledWith("old-avatar");

      expect(activityLogger.logAvatarDeleted).toHaveBeenCalledWith({
        userId,
        oldAvatarKey: "old-avatar",
      });
    });

    it("does nothing if profile does not exist", async () => {
      jest.mocked(userProfileRepository.findByUserId).mockResolvedValue(null);

      await profileService.cleanupOldAvatar("user-7");

      expect(s3Utils.deleteAvatarObjects).not.toHaveBeenCalled();
      expect(activityLogger.logAvatarDeleted).not.toHaveBeenCalled();
    });

    it("does nothing if profile has no avatarKey", async () => {
      jest.mocked(userProfileRepository.findByUserId).mockResolvedValue({});

      await profileService.cleanupOldAvatar("user-8");

      expect(s3Utils.deleteAvatarObjects).not.toHaveBeenCalled();
      expect(activityLogger.logAvatarDeleted).not.toHaveBeenCalled();
    });
  });
});
