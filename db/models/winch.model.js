import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/winch.js'

// Define the Winch Model
class Winch extends Model {}

Winch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    sequelize,
    modelName: 'Winch',
    tableName: 'winch',
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Sync the model with the database
sequelize.sync().then(() => console.log('Database synced!')).catch((err) => console.error(err))

// Initialize Express
const app = express()
app.use(express.json())

// Routes

// GET all Winches
app.get('/winches', async (req, res) => {
  try {
    const winches = await Winch.findAll()
    res.json(winches)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET a specific Winch by ID
app.get('/winches/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const winch = await Winch.findByPk(id)
    if (!winch) {
      return res.status(404).json({ message: 'Winch not found' })
    }
    res.json(winch)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE a Winch by ID
app.delete('/winches/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Winch.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Winch not found' })
    }
    res.json({ message: 'Winch deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// PUT (update) a Winch by ID
app.put('/winches/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, profilePhoto, area, rating } = req.body;
  try {
    const [updated] = await Winch.update(
      { firstName, lastName, email, password, profilePhoto, area, rating },
      { where: { id } }
    )
    if (!updated) {
      return res.status(404).json({ message: 'Winch not found' })
    }
    res.json({ message: 'Winch updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default Winch
