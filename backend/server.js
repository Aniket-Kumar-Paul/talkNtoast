require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const DbConnect = require('./database');
const cors = require('cors');
const cookieParser = require('cookie-parser')

app.use(cookieParser())

// to remove CORS Error
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000'], // frontend url
}
app.use(cors(corsOption))

app.use('/storage', express.static('storage')) // if url has /storage serve all files from storage folder as static files

const PORT = process.env.PORT || 5500;
DbConnect(); // connect database
app.use(express.json({ limit: '8mb' })) // giving limit to allow uploading image
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello from express');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));