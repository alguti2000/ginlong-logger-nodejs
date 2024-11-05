const mongoose=require('mongoose');

// create an schema
const solar = new mongoose.Schema({
            InverterSN: String,
            WattsNow: Number,
            KwhDay: Number,
            KwhTotal: Number,
            KwhYesterday: Number,
            KwhMonth: Number,
            KwhLastMonth: Number,
            Temp: Number,
            DCVolts1: Number,
            DCVolts2: Number,
            DCAmps1: Number,
            DCAmps2: Number,
            ACAmps1: Number,
            ACAmps2: Number,
            ACFreq: Number,
            Timestamp: Date
        });

const Solar = mongoose.model('solar', solar, 'solar');
        
module.exports = Solar;