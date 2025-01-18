import { Router, Request, Response } from 'express';
import Note from '../models/Note';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { url, content, userId } = req.body;
        const note = new Note({
            url,
            content,
            userId
        });
        const savedNote = await note.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(500).json({ error: 'Error creating note' });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const { url, userId } = req.query;
        const query = {
            ...(url && { url }),
            ...(userId && { userId })
        };
        const notes = await Note.find(query);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { content, updatedAt: new Date() },
            { new: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ error: 'Error updating note' });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting note' });
    }
});

export default router;