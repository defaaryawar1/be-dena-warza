"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMemory = exports.updateMemory = exports.createMemory = exports.getSingleMemory = exports.getAllMemories = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const upload_service_1 = require("../services/upload.service");
// Initialize Prisma and Multer
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
}).array('files', 10);
// Base Media Schema
const baseMediaSchema = {
    type: zod_1.z.enum(['photo', 'video']),
    url: zod_1.z.string().url({ message: 'URL media tidak valid' }),
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
};
// Schema Definitions
const mediaSchema = zod_1.z.object(Object.assign({ id: zod_1.z.string().optional() }, baseMediaSchema));
const memorySchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, { message: 'Judul harus memiliki minimal 3 karakter' })
        .max(100, { message: 'Judul tidak boleh lebih dari 100 karakter' }),
    description: zod_1.z.string()
        .min(10, { message: 'Deskripsi harus memiliki minimal 10 karakter' })
        .max(500, { message: 'Deskripsi tidak boleh lebih dari 500 karakter' })
        .optional()
        .nullable(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD' }),
    tags: zod_1.z.array(zod_1.z.string()).min(1, { message: 'Minimal harus ada 1 tag' }),
    media: zod_1.z.array(mediaSchema).min(1, { message: 'Minimal harus ada 1 media' }),
    existingMedia: zod_1.z.array(mediaSchema).optional(),
    mediaToDelete: zod_1.z.array(zod_1.z.string()).optional()
});
const updateMemorySchema = memorySchema.partial();
// Error Handler
const handleError = (error, res) => {
    if (error instanceof zod_1.z.ZodError) {
        return res.status(400).json({
            error: 'Validasi data gagal',
            details: error.errors
        });
    }
    console.error('Operation error:', error);
    return res.status(500).json({ error: 'Operasi gagal' });
};
// Controllers
const getAllMemories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memories = yield prisma.memory.findMany({ include: { media: true } });
        return res.json(memories);
    }
    catch (error) {
        return handleError(error, res);
    }
});
exports.getAllMemories = getAllMemories;
const getSingleMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memory = yield prisma.memory.findUnique({
            where: { id: req.params.id },
            include: { media: true }
        });
        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }
        return res.json(memory);
    }
    catch (error) {
        return handleError(error, res);
    }
});
exports.getSingleMemory = getSingleMemory;
const createMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return resolve(res.status(400).json({ error: 'File upload error', details: err.message }));
            }
            try {
                const files = req.files;
                const mediaUrls = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                    return ({
                        type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
                        url: (yield (0, upload_service_1.uploadToCloudinary)(file)).secure_url
                    });
                })));
                const memoryData = Object.assign(Object.assign({}, req.body), { media: mediaUrls });
                const validatedData = memorySchema.parse(memoryData);
                const existingMemory = yield prisma.memory.findFirst({
                    where: {
                        title: { equals: validatedData.title, mode: 'insensitive' }
                    }
                });
                if (existingMemory) {
                    return resolve(res.status(409).json({
                        error: 'Judul kenangan sudah ada',
                        field: 'title'
                    }));
                }
                const memory = yield prisma.memory.create({
                    data: {
                        title: validatedData.title,
                        description: validatedData.description,
                        date: new Date(validatedData.date),
                        tags: validatedData.tags,
                        media: { create: mediaUrls }
                    },
                    include: { media: true }
                });
                return resolve(res.status(201).json(memory));
            }
            catch (error) {
                return resolve(handleError(error, res));
            }
        }));
    });
});
exports.createMemory = createMemory;
const updateMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log('🚀 Starting memory update for ID:', id);
    try {
        const existingMemory = yield prisma.memory.findUnique({
            where: { id },
            include: { media: true }
        });
        if (!existingMemory) {
            console.log('❌ Memory not found with ID:', id);
            return res.status(404).json({ error: 'Kenangan tidak ditemukan' });
        }
        console.log('📝 Existing memory:', {
            id: existingMemory.id,
            title: existingMemory.title,
            mediaCount: existingMemory.media.length,
            mediaIds: existingMemory.media.map(m => m.id)
        });
        return new Promise((resolve) => {
            upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                if (err) {
                    console.log('❌ Upload error:', err);
                    return resolve(res.status(400).json({ error: 'File upload error', details: err.message }));
                }
                try {
                    const files = req.files || [];
                    console.log('📁 New files received:', files.length);
                    files.forEach((file, index) => {
                        console.log(`File ${index + 1}:`, {
                            originalname: file.originalname,
                            mimetype: file.mimetype,
                            size: file.size
                        });
                    });
                    const formData = JSON.parse(req.body.data || '{}');
                    console.log('📦 Received form data:', formData);
                    const validatedData = updateMemorySchema.parse(formData);
                    console.log('✅ Validated data:', validatedData);
                    if ((_a = validatedData.mediaToDelete) === null || _a === void 0 ? void 0 : _a.length) {
                        console.log('🗑️ Media marked for deletion:', validatedData.mediaToDelete);
                    }
                    // Start transaction
                    console.log('🔄 Starting database transaction');
                    const updatedMemory = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                        var _a, _b;
                        // Handle media deletions
                        if ((_a = validatedData.mediaToDelete) === null || _a === void 0 ? void 0 : _a.length) {
                            console.log('🗑️ Deleting media with IDs:', validatedData.mediaToDelete);
                            yield tx.media.deleteMany({
                                where: { id: { in: validatedData.mediaToDelete } }
                            });
                        }
                        // Upload new files
                        console.log('📤 Uploading new files to Cloudinary');
                        const newMedia = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                            const uploadResult = yield (0, upload_service_1.uploadToCloudinary)(file);
                            console.log('☁️ Cloudinary upload result:', {
                                originalname: file.originalname,
                                secure_url: uploadResult.secure_url
                            });
                            return {
                                type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
                                url: uploadResult.secure_url
                            };
                        })));
                        console.log('📸 New media prepared:', newMedia);
                        // Prepare update data
                        const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (validatedData.title && { title: validatedData.title })), (validatedData.description !== undefined && {
                            description: validatedData.description
                        })), (validatedData.date && { date: new Date(validatedData.date) })), (validatedData.tags && { tags: validatedData.tags })), { media: Object.assign({ create: newMedia }, (((_b = validatedData.mediaToDelete) === null || _b === void 0 ? void 0 : _b.length) && {
                                deleteMany: {
                                    id: { in: validatedData.mediaToDelete }
                                }
                            })) });
                        console.log('📝 Final update data:', updateData);
                        // Perform update
                        const result = yield tx.memory.update({
                            where: { id },
                            data: updateData,
                            include: { media: true }
                        });
                        console.log('✨ Update result:', {
                            id: result.id,
                            title: result.title,
                            mediaCount: result.media.length,
                            mediaIds: result.media.map(m => m.id)
                        });
                        return result;
                    }));
                    console.log('✅ Transaction completed successfully');
                    return resolve(res.json(updatedMemory));
                }
                catch (error) {
                    console.error('❌ Error during update:', error);
                    return resolve(handleError(error, res));
                }
            }));
        });
    }
    catch (error) {
        console.error('❌ Error in main try block:', error);
        return handleError(error, res);
    }
});
exports.updateMemory = updateMemory;
const deleteMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.memory.delete({ where: { id: req.params.id } });
        return res.status(204).send();
    }
    catch (error) {
        return handleError(error, res);
    }
});
exports.deleteMemory = deleteMemory;
