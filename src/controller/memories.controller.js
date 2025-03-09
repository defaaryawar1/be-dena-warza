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
exports.deleteMemory = exports.updateMemory = exports.getSingleMemory = exports.createMemory = exports.getAllMemories = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const upload_service_1 = require("../services/upload.service");
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
const prisma = new client_1.PrismaClient();
const mediaSchema = zod_1.z.object({
    type: zod_1.z.enum(['photo', 'video']),
    url: zod_1.z.string().url()
});
const memorySchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().min(10).max(500).optional(),
    date: zod_1.z.string(),
    tags: zod_1.z.array(zod_1.z.string()),
    media: zod_1.z.array(mediaSchema)
});
const getAllMemories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memories = yield prisma.memory.findMany({
            include: {
                media: true
            }
        });
        return res.json(memories);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch memories' });
    }
});
exports.getAllMemories = getAllMemories;
const createMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Handle file uploads first
        upload.array('files', 10)(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(400).json({ error: 'File upload error', details: err.message });
            }
            const files = req.files;
            // Upload files to Cloudinary
            const mediaPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, upload_service_1.uploadToCloudinary)(file);
                return {
                    type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
                    url: result.secure_url
                };
            }));
            const mediaUrls = yield Promise.all(mediaPromises);
            // Validate and create memory with uploaded media URLs
            const memoryData = Object.assign(Object.assign({}, req.body), { media: mediaUrls });
            const validatedData = memorySchema.parse(memoryData);
            // Check for duplicate title
            const existingMemory = yield prisma.memory.findFirst({
                where: {
                    title: {
                        equals: validatedData.title,
                        mode: 'insensitive'
                    }
                }
            });
            if (existingMemory) {
                return res.status(409).json({
                    error: 'Judul kenangan sudah ada',
                    field: 'title'
                });
            }
            const memory = yield prisma.memory.create({
                data: {
                    title: validatedData.title,
                    description: validatedData.description,
                    date: new Date(validatedData.date),
                    tags: validatedData.tags,
                    media: {
                        create: mediaUrls
                    }
                },
                include: {
                    media: true
                }
            });
            return res.status(201).json(memory);
        }));
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validasi data gagal',
                details: error.errors
            });
        }
        console.error('Memory creation error:', error);
        return res.status(500).json({ error: 'Gagal membuat kenangan' });
    }
});
exports.createMemory = createMemory;
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
        return res.status(500).json({ error: 'Failed to fetch memory' });
    }
});
exports.getSingleMemory = getSingleMemory;
const updateMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = memorySchema.parse(req.body);
        const memory = yield prisma.memory.update({
            where: { id: req.params.id },
            data: {
                title: validatedData.title,
                description: validatedData.description,
                date: new Date(validatedData.date),
                tags: validatedData.tags,
                media: {
                    deleteMany: {},
                    create: validatedData.media
                }
            },
            include: {
                media: true
            }
        });
        return res.json(memory);
    }
    catch (error) {
        return res.status(400).json({ error: 'Invalid data format' });
    }
});
exports.updateMemory = updateMemory;
const deleteMemory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.memory.delete({
            where: { id: req.params.id }
        });
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete memory' });
    }
});
exports.deleteMemory = deleteMemory;
