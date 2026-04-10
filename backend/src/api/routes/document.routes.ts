// src/routes/document.routes.ts
import express from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, getDocument } from '../controllers/document.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/tmp_uploads' }); // multer stores temp files here

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);

router.get('/:id', getDocument);

export default router;
