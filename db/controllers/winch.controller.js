import Winch from '../db/models/winch.model.js';

// إضافة Winch جديد
export const addWinch = async (req, res) => {
  try {
    const { firstName, lastName, email, password, profilePhoto, area, rating } = req.body;
    const newWinch = await Winch.create({ firstName, lastName, email, password, profilePhoto, area, rating });
    res.status(201).json({ message: 'Winch added successfully!', data: newWinch });
  } catch (err) {
    res.status(400).json({ message: 'Failed to add Winch', error: err.message });
  }
};

// جلب جميع Winches
export const getAllWinches = async (req, res) => {
  try {
    const winches = await Winch.findAll();
    res.status(200).json({ message: 'Winches fetched successfully!', data: winches });
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch Winches', error: err.message });
  }
};

// تحديث Winch
export const updateWinch = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedWinch = await Winch.update(req.body, { where: { id }, returning: true });
    res.status(200).json({ message: 'Winch updated successfully!', data: updatedWinch[1][0] });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update Winch', error: err.message });
  }
};

// حذف Winch
export const deleteWinch = async (req, res) => {
  try {
    const { id } = req.params;
    await Winch.destroy({ where: { id } });
    res.status(200).json({ message: 'Winch deleted successfully!' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete Winch', error: err.message });
  }
};
