import { env } from "./env.js";
import {
  s3Client,
  sqsClient,
  dynamoDbClient,
} from "./awsClients.js";
import { createProfileService } from "../services/profileService.js";
import { createS3Utils } from "../utils/s3Utils.js";
import { createSqsUtils } from "../utils/sqsUtils.js";
import {
  createDynamoProfileCacheRepository,
} from "../repositories/dynamoProfileCacheRepository.js";
import { imageResizeProcessor } from "../handlers/imageResizeProcessor.js";
import { getOrdersPool } from "../libs/postgres.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { createOrderService } from "../services/orderService.js";

const s3Utils = createS3Utils({
  s3Client,
  bucket: env.AVATAR_BUCKET,
});

const sqsUtils = createSqsUtils({
  sqsClient,
  queueUrl: env.SQS_QUEUE_URL,
});

const dynamoProfileCacheRepository = createDynamoProfileCacheRepository({
  dynamoDb: dynamoDbClient,
  tableName: env.PROFILE_CACHE_TABLE,
});

const profileService = createProfileService({
  dynamoProfileCacheRepository,
  s3Utils,
  sqsUtils,
  cloudFrontUrl: env.CLOUDFRONT_URL,
  avatarBucket: env.AVATAR_BUCKET,
});


const orderService = createOrderService({
  orderRepository,
  getOrdersPool,
});

const imageResizeHandler = imageResizeProcessor({s3Client, profileService});

export {
  s3Utils,
  sqsUtils,
  dynamoProfileCacheRepository,
  profileService,
  orderService,
  imageResizeHandler
};


