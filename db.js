const mongoose = require('mongoose');
main().catch(err => console.log(err));

async function main() {
    if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_NAME) {
        throw new Error('Database configuration is missing in environment variables');
    }       
    await mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);  
    console.log('Connected to MongoDB successfully');
    
}

