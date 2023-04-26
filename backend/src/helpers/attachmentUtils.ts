import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const BUCKET_NAME = process.env.ATTACHMENTS_S3_BUCKET

const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
        private readonly bucketName = BUCKET_NAME
    ) {}
    async getAttachmentUrl(todoId: string): Promise<string> {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
    }

    async getUploadUrl(todoId: string): Promise<string> {
        const s3Url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(urlExpiration)
        })
        return s3Url as string;
    }


}