import express from 'express';
import { addWinch, getAllWinches, updateWinch, deleteWinch } from '../controllers/winch.controller.js';

const router = express.Router();

// Adding a new Winch
router.post('/', addWinch);

// Getting all Winches
router.get('/', getAllWinches);

// Updating a Winch
router.put('/:id', updateWinch);

// Deleting a Winch
router.delete('/:id', deleteWinch);

export default router;
