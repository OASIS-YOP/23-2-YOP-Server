
import express from 'express';
const router = express.Router();
import upload from '../modules/multer.js';
import PolaroidController from '../controller/polaroids.js';

router.post('/edit/save', upload, PolaroidController.uploadImage);

export default router;



