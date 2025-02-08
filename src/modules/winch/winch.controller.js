import Winch from '../../../db/models/winch.model.js';
import { ApiFeature } from '../../../src/utils/apiFeature.js'; // تأكد من تعديل مسار الاستيراد حسب موقع الملف

// إنشاء عنصر جديد من نوع Winch
export const createWinch = async (req, res) => {
  try {
    const { firstName, lastName, email, password, profilePhoto, area, rating } = req.body;
    const newWinch = await Winch.create({
      firstName,
      lastName,
      email,
      password,
      profilePhoto,
      area,
      rating
    });
    res.status(201).json(newWinch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllWinches = async (req, res) => {
    try {
      // إنشاء كائن ApiFeature بتمرير نموذج Winch ومعاملات الاستعلام المرسلة مع الطلب
      const apiFeature = new ApiFeature(Winch, req.query)
        .filter()    // لتطبيق التصفية على الحقول المسموح بها
        .search()    // لتطبيق البحث في الحقول الافتراضية (مثل title, description)
        .sort()      // لتطبيق الفرز على الحقول المحددة
        .select()    // لتحديد الحقول المراد إرجاعها
        .pagination(); // لتقسيم النتائج إلى صفحات
  
      // تنفيذ الاستعلام باستخدام الخيارات المُعدّة
      const result = await apiFeature.execute();
  
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// الحصول على عنصر Winch بواسطة المعرف
export const getWinchById = async (req, res) => {
  try {
    const { id } = req.params;
    const winch = await Winch.findByPk(id);
    if (!winch) {
      return res.status(404).json({ message: 'Winch not found' });
    }
    res.status(200).json(winch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث بيانات عنصر Winch
export const updateWinch = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Winch.update(req.body, {
      where: { id }
    });
    if (updated) {
      const updatedWinch = await Winch.findByPk(id);
      return res.status(200).json(updatedWinch);
    }
    res.status(404).json({ message: 'Winch not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف عنصر Winch
export const deleteWinch = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Winch.destroy({
      where: { id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    res.status(404).json({ message: 'Winch not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
