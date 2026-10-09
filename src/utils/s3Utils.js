import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const createS3Utils = ({ s3Client, bucket }) => {

  const generateUploadURL = async ({ key, contentType, maxSizeMB }) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 60 });
};


const deleteAvatarObjects = async (avatarKey) => {
  if (!avatarKey) return;

  const originalKey = `avatars/original/${avatarKey}`;
  const optimizedKey = `avatars/optimized/${avatarKey}.webp`;

  const deleteCommands = [
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: originalKey,
    }),
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: optimizedKey,
    }),
  ];

  // Does not throw error if one fails to execute
  await Promise.allSettled(deleteCommands.map((cmd) => s3Client.send(cmd)));
};

  return {
    generateUploadURL,
    deleteAvatarObjects,
  };
};



