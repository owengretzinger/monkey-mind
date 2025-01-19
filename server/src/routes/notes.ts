import { Router, Request, Response } from 'express';
import Note from '../models/Note';

const router = Router();



router.get('/all', async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        const query = {
            ...(url && { url }),
        };
        const notes = await Note.find(query);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});



router.post('/', async (req: Request, res: Response) => {
    console.log("big macccc");
    try {
        const { url, content, idSpecial, title, positionX, positionY, color, author, date, tilt, profilePic, hat, link } = req.body;

        console.log(idSpecial, "HI THERE STUPID FUC");
        const note = new Note({
            _id: idSpecial,
            url,
            content,
            title,
            positionX,
            positionY,
            color,
            author,
            date,
            tilt,
            profilePic,
            hat,
            link
        });

        console.log(note, "HI THERE STUPID FUC");
        const savedNote = await note.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ 
            error: 'Error creating note',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});



router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { content },
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