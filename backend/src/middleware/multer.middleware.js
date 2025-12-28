import multer from "multer";

const storage = multer.diskStorage({
    fileName:(req, file,cb)=>{
        const ext = path.extname(file.originalname || "").toLowerCase();
        const safeExt = [".jpeg",".jpg",".png",".webp"].includes(ext) ? ext : "";
        const unique = `${Date.now()} - ${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${safeExt}`);
    },
});

const fileFilter = (req, file, cb) =>{
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if(extname && mimeType){
        cb(null, true);
    }else{
        cb( new Error("Only image files are allowed(jpeg,jpg,png,webp)"));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits:{ fileSize: 5 * 1024 * 1024 },// 5MB limit
});