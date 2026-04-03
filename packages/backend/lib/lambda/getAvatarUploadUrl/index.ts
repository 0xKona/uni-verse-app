import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});
const BUCKET_NAME = process.env.BUCKET_NAME!;
const BUCKET_REGION = process.env.AWS_REGION!;

export const handler = async (event: {
  arguments: { fileName: string };
  identity: { username: string };
}) => {
  const { fileName } = event.arguments;
  const userId = event.identity.username;

  // avatars/<userId>/<fileName> — user-scoped prefix for IAM policies and efficient lookups
  const key = `avatars/${userId}/${fileName}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
    { expiresIn: 300 }
  );

  const avatarUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${key}`;

  return JSON.stringify({ url, key, avatarUrl });
};
