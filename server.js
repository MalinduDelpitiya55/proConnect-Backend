const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

const port = 5000

const db = mysql.createConnection({
    host: 'botdoajmzuujoafbrf5i-mysql.services.clever-cloud.com',
    user: 'uzk4sijc3uptkipy',
    password: 'ZNeZLSRAJLSQvzrTBHCR',
    database: 'botdoajmzuujoafbrf5i'
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})