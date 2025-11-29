require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const db = require('./models'); 
const postRoutes = require('./routes/postRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = process.env.RENDER
  ? '/tmp/uploads'                
  : path.join(__dirname, 'uploads');  

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

app.use('/api/posts', postRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'post-blog.html'));
});

// ініціалізація бази
(async () => {
    try {
        await db.sequelize.sync({ alter: true });
        console.log('✅ Database synced');
    } catch (err) {
        console.error(' Error syncing DB:', err);
    }
})();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));