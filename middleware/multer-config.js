const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    try {
      const outputDir = process.env.IMAGES_FOLDER || 'images';

      // Crée le dossier s'il n'existe pas
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Nettoyage du nom et création du nom final
      const baseName = req.file.originalname
        .toLowerCase()
        .replace(/\s+/g, '_')
        .split('.')[0];

      const fileName = `${baseName}_${Date.now()}.webp`;
      const outputPath = path.join(outputDir, fileName);

      // Conversion sharp en webp avec resize et qualité
      await sharp(req.file.buffer)
        .resize(parseInt(process.env.IMAGE_WIDTH) || 800)
        .webp({ quality: parseInt(process.env.IMAGE_QUALITY) || 80 })
        .toFile(outputPath);

      // Stocke le nom du fichier dans req.file.filename pour le controller
      req.file.filename = fileName;

      next();
    } catch (error) {
      next(error);
    }
  });
};
