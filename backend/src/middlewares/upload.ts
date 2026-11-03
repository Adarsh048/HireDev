import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Ensure uploads directory exists
 */
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Allowed MIME types for resume uploads.
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/x-pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/octet-stream', // Some browsers send octet-stream for docx/pdf
];

/**
 * Multer disk storage configuration.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `${uuidv4()}${ext}`);
  },
});

/**
 * File filter: accept PDF and DOCX files by extension and/or mimetype.
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const validExt = ext === '.pdf' || ext === '.docx' || ext === '.doc';
  const validMime = ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (validExt || validMime) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are accepted'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

/**
 * Flexible middleware that accepts upload under either 'resume' or 'file' field.
 */
export const resumeUpload = (req: Request, res: Response, next: NextFunction): void => {
  const uploadHandler = upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]);

  uploadHandler(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      if (files['resume'] && files['resume'].length > 0) {
        req.file = files['resume'][0];
      } else if (files['file'] && files['file'].length > 0) {
        req.file = files['file'][0];
      }
    }
    next();
  });
};
