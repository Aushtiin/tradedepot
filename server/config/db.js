const mongoose = require('mongoose');

const db = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true 
        })

        console.log(`MongoDB connected: ${conn.connection.host}`.green.underline)
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold)
        process.exit(1)
    }
}

module.exports = db;