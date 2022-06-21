require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const DbConnect = require('./database');

const PORT = process.env.PORT || 5500;
DbConnect(); // connect database
app.use(express.json())
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello from express');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));