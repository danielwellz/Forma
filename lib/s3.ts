import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Bucket = process.env.S3_BUCKET ?? "forma";

export function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION ?? "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 env vars are missing.");
  }

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getPublicFileUrl(key: string) {
  const base = process.env.S3_PUBLIC_BASE_URL;
  if (base) {
    return `${base.replace(/\/$/, "")}/${key}`;
  }

  return `${process.env.S3_ENDPOINT?.replace(/\/$/, "")}/${s3Bucket}/${key}`;
}

export async function createPresignedUpload(params: {
  key: string;
  contentType: string;
}) {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: params.key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  return {
    uploadUrl,
    objectKey: params.key,
  };
}

export async function createPresignedDownload(params: { key: string; expiresInSec?: number }) {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: params.key,
  });

  return getSignedUrl(client, command, { expiresIn: params.expiresInSec ?? 120 });
}

export async function deleteObjectByKey(key: string) {
  const client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: s3Bucket,
    Key: key,
  });

  await client.send(command);
}
