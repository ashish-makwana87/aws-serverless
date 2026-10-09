import { success } from "../../utils/response.js";
import { profileService } from "../../config/container.js";

export const uploadCompleteController = async (event) => {
  const { key } = event.validatedBody;
  const userId = event.user.id;

  await profileService.uploadComplete(userId, key);

  return success({
    message: "Image queued for processing.",
  });
};
