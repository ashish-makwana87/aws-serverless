import { profileService } from "../../config/container.js";
import { success } from "../../utils/response.js";


export const getProfileController = async (event) => {
  
    const userId = event.user.id;
    const profile = await profileService.getProfile(userId);
    return success(profile);
};

export const updateProfileController = async (event) => {
    const userId = event.user.id;
    const body = event.validatedBody;

    const result = await profileService.updateProfile(userId, body);
    return success(result);
};

export const deleteProfileController = async (event) => {
  
    const userId = event.user.id;

    const result = await profileService.deleteProfile(userId);
    return success(result);
};
