import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {
    this.region = this.configService.get<string>('AWS_REGION');
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');
  }

  async uploadFile(
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ): Promise<string> {
    const validExtensions = [
      'png',
      'jpg',
      'jpeg',
      'webp',
      'pdf',
      'doc',
      'docx',
      'xlsx',
      'txt',
    ];
    if (!validExtensions.includes(ext.toLowerCase())) {
      throw new BadRequestException('올바른 확장자가 아닙니다.');
    }

    const contentType = this.getContentType(ext);
    if (!contentType) {
      throw new BadRequestException('지원하지 않는 파일 형식입니다.');
    }

    const uniqueFileName = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${uniqueFileName}`;
  }

  private getContentType(ext: string): string | null {
    const extensionMap: { [key: string]: string } = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
    };

    return extensionMap[ext.toLowerCase()] || null;
  }
}
