import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import { uploadToCloudinary } from '../services/upload.service';

// Initialize Prisma and Multer
const prisma = new PrismaClient();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
}).array('files', 10);

// Base Media Schema
const baseMediaSchema = {
    type: z.enum(['photo', 'video']),
    url: z.string().url({ message: 'URL media tidak valid' }),
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.string().optional(),
    tags: z.array(z.string()).optional()
};

// Schema Definitions
const mediaSchema = z.object({
    id: z.string().optional(),
    ...baseMediaSchema
});

const memorySchema = z.object({
    title: z.string()
        .min(3, { message: 'Judul harus memiliki minimal 3 karakter' })
        .max(100, { message: 'Judul tidak boleh lebih dari 100 karakter' }),
    description: z.string()
        .min(10, { message: 'Deskripsi harus memiliki minimal 10 karakter' })
        .max(500, { message: 'Deskripsi tidak boleh lebih dari 500 karakter' })
        .optional()
        .nullable(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD' }),
    tags: z.array(z.string()).min(1, { message: 'Minimal harus ada 1 tag' }),
    media: z.array(mediaSchema).min(1, { message: 'Minimal harus ada 1 media' }),
    existingMedia: z.array(mediaSchema).optional(),
    mediaToDelete: z.array(z.string()).optional()
});

const updateMemorySchema = memorySchema.partial();

// Types
type MediaItem = z.infer<typeof mediaSchema>;
type MemoryInput = z.infer<typeof memorySchema>;
type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;

// Error Handler
const handleError = (error: unknown, res: Response) => {
    if (error instanceof z.ZodError) {
        return res.status(400).json({
            error: 'Validasi data gagal',
            details: error.errors
        });
    }
    console.error('Operation error:', error);
    return res.status(500).json({ error: 'Operasi gagal' });
};

// Controllers
export const getAllMemories = async (_req: Request, res: Response) => {
    try {
        const memories = await prisma.memory.findMany({ include: { media: true } });
        return res.json(memories);
    } catch (error) {
        return handleError(error, res);
    }
};

export const getSingleMemory = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const memory = await prisma.memory.findUnique({
            where: { id: req.params.id },
            include: { media: true }
        });
        
        if (!memory) {
            return res.status(404).json({ error: 'Memory not found' });
        }
        
        return res.json(memory);
    } catch (error) {
        return handleError(error, res);
    }
};

export const createMemory = async (req: Request, res: Response): Promise<Response> => {
    return new Promise((resolve) => {
        upload(req, res, async (err) => {
            if (err) {
                return resolve(res.status(400).json({ error: 'File upload error', details: err.message }));
            }

            try {
                const files = req.files as Express.Multer.File[];
                const mediaUrls = await Promise.all(files.map(async (file) => ({
                    type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
                    url: (await uploadToCloudinary(file)).secure_url
                })));

                const memoryData = { ...req.body, media: mediaUrls };
                const validatedData = memorySchema.parse(memoryData);

                const existingMemory = await prisma.memory.findFirst({
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

                const memory = await prisma.memory.create({
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
            } catch (error) {
                return resolve(handleError(error, res));
            }
        });
    });
};

export const updateMemory = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    console.log('🚀 Starting memory update for ID:', id);

    try {
        const existingMemory = await prisma.memory.findUnique({
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
            upload(req, res, async (err) => {
                if (err) {
                    console.log('❌ Upload error:', err);
                    return resolve(res.status(400).json({ error: 'File upload error', details: err.message }));
                }

                try {
                    const files = req.files as Express.Multer.File[] || [];
                    console.log('📁 New files received:', files.length);
                    files.forEach((file, index) => {
                        console.log(`File ${index + 1}:`, {
                            originalname: file.originalname,
                            mimetype: file.mimetype,
                            size: file.size
                        });
                    });

                    const formData: UpdateMemoryInput = JSON.parse(req.body.data || '{}');
                    console.log('📦 Received form data:', formData);

                    const validatedData = updateMemorySchema.parse(formData);
                    console.log('✅ Validated data:', validatedData);

                    if (validatedData.mediaToDelete?.length) {
                        console.log('🗑️ Media marked for deletion:', validatedData.mediaToDelete);
                    }

                    // Start transaction
                    console.log('🔄 Starting database transaction');
                    const updatedMemory = await prisma.$transaction(async (tx) => {
                        // Handle media deletions
                        if (validatedData.mediaToDelete?.length) {
                            console.log('🗑️ Deleting media with IDs:', validatedData.mediaToDelete);
                            await tx.media.deleteMany({
                                where: { id: { in: validatedData.mediaToDelete } }
                            });
                        }

                        // Upload new files
                        console.log('📤 Uploading new files to Cloudinary');
                        const newMedia = await Promise.all(files.map(async (file) => {
                            const uploadResult = await uploadToCloudinary(file);
                            console.log('☁️ Cloudinary upload result:', {
                                originalname: file.originalname,
                                secure_url: uploadResult.secure_url
                            });
                            return {
                                type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
                                url: uploadResult.secure_url
                            };
                        }));
                        console.log('📸 New media prepared:', newMedia);

                        // Prepare update data
                        const updateData = {
                            ...(validatedData.title && { title: validatedData.title }),
                            ...(validatedData.description !== undefined && { 
                                description: validatedData.description 
                            }),
                            ...(validatedData.date && { date: new Date(validatedData.date) }),
                            ...(validatedData.tags && { tags: validatedData.tags }),
                            media: {
                                create: newMedia,
                                ...(validatedData.mediaToDelete?.length && {
                                    deleteMany: {
                                        id: { in: validatedData.mediaToDelete }
                                    }
                                })
                            }
                        };
                        console.log('📝 Final update data:', updateData);

                        // Perform update
                        const result = await tx.memory.update({
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
                    });

                    console.log('✅ Transaction completed successfully');
                    return resolve(res.json(updatedMemory));
                } catch (error) {
                    console.error('❌ Error during update:', error);
                    return resolve(handleError(error, res));
                }
            });
        });
    } catch (error) {
        console.error('❌ Error in main try block:', error);
        return handleError(error, res);
    }
};

export const deleteMemory = async (req: Request<{ id: string }>, res: Response) => {
    try {
        await prisma.memory.delete({ where: { id: req.params.id } });
        return res.status(204).send();
    } catch (error) {
        return handleError(error, res);
    }
};