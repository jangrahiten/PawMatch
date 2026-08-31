import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const uploadPetImages = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ];

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const isImageMime = file.mimetype.startsWith("image/");
    const isAllowedExtension =
      allowedExtensions.includes(extension);

    if (!isImageMime && !isAllowedExtension) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
}).array("images", 5);