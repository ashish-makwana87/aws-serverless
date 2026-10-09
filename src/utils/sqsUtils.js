import { SendMessageCommand } from "@aws-sdk/client-sqs";

export const createSqsUtils = ({
  sqsClient,
  queueUrl,
}) => {
  const publishImageProcessingJob = async ({
    bucket,
    key,
    userId,
  }) => {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({
        bucket,
        key,
        userId,
      }),
    });

    await sqsClient.send(command);
  };

  return {
    publishImageProcessingJob,
  };
};