import { profileService } from "../../config/container.js";
import { success } from "../../utils/response.js";

export const adminUpdateProfileController = async (event) => {
  const targetUserId = event.pathParameters.userId;
  const body = JSON.parse(event.body);

  const result = await profileService.updateProfile(targetUserId, body);

  return success(result);
};
