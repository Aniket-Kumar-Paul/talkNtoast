require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const DbConnect = require('./database');
const cors = require('cors');

// to remove CORS Error
const corsOption = {
    origin: ['http://localhost:3000'], // frontend url
}
app.use(cors(corsOption))

const PORT = process.env.PORT || 5500;
DbConnect(); // connect database
app.use(express.json())
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello from express');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));