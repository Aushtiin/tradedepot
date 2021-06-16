const express = require('express');
const colors = require('colors')
const db = require('./config/db')
const routes = require('./routes')

const app = express()

const PORT = process.env.PORT || 6070
require('dotenv').config()

db()


app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use('/api', routes)

app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} mode, on port ${PORT}`.cyan.bold))