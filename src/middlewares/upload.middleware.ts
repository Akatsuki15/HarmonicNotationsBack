import multer from 'multer';

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('Processing file:', file.originalname, 'with mimetype:', file.mimetype);
    
    if (file.fieldname === 'pdfFile' && file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

// Configuración de multer
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
}).single('pdfFile'); // Especificar explícitamente que esperamos un solo archivo con el campo 'pdfFile' 