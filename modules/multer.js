import multer from 'multer';
import multerS3 from 'multer-s3'
import aws from 'aws-sdk';
import { config } from "dotenv";
config();

const s3 = new aws.S3({
  accessKeyId: process.env.S3_KEYID,
  secretAccessKey: process.env.S3_PRIVATE_KEY,
  region: process.env.S3_REGION,
})

let upload = multer({
  storage:multerS3({
    s3:s3,
    bucket: process.env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public_read',
    key: (req, file, cb) =>{
      cb(null, `polaroid/polaroid_${Date.now()}_${file.originalname}`);
    },
  }),
});


export default upload;