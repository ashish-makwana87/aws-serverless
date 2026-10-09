import {
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

export const createDynamoProfileCacheRepository = ({
  dynamoDb,
  tableName,
}) => {
  const CACHE_TTL_SECONDS = 60 * 60;

  return {
    async get(userId) {
      const command = new GetCommand({
        TableName: tableName,
        Key: {
          userId,
        },
      });

      const { Item } = await dynamoDb.send(command);

      return Item ?? null;
    },

    async put(profile) {
      const ttl = Math.floor(Date.now() / 1000) + CACHE_TTL_SECONDS;

      const { _id, createdAt, updatedAt, ...cacheProfile } = profile;

      const command = new PutCommand({
        TableName: tableName,
        Item: {
          ...cacheProfile,
          ttl,
        },
      });

      await dynamoDb.send(command);
    },

    async delete(userId) {
      const command = new DeleteCommand({
        TableName: tableName,
        Key: {
          userId,
        },
      });

      await dynamoDb.send(command);
    },
  };
};