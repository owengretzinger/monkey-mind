import { Router, Request, Response } from 'express';
import User from '../models/User';


const router = Router();

router.post('/newUser', async (req: Request, res: Response) => {
    console.log("HIIIIII");

    console.log(req.body)
    try {
        const { email } = req.body;
        const user = new User({
          email,
        });


        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: 'Error creating note' });
    }
});

export default router;