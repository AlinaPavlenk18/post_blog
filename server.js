require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./models'); 
const postRoutes = require('./routes/postRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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