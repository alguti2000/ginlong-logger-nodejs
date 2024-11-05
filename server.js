if (!process.env.NODE_ENV){
    require('dotenv').config();
}

const net = require('net');
const mongoose=require('mongoose');
const db = require('./helpers/db');
const  ObjectId = require('mongodb').ObjectId;

const Solar = require('./models/solar');

// Change these values as needed
const HOST = config.host;  // Hostname or IP address of the interface, leave blank for all
const PORT = config.port;  // Listening on port 9999

// Inverter values (offsets in bytes)
const header = config.data_header;  // Hex stream header
const dataSize = 95;  // Hex stream size
const offsets = {
    sn: 15, temp: 31, vdc1: 33, vdc2: 35, adc1: 39, adc2: 41,
    aac: 45, vac: 51, freq: 57, now: 59, yesterday: 67,
    day: 69, total: 71, month: 87, lastMonth: 91
};

// Helper function to parse hex data
function parseHexData(hexdata, start, length, divisor = 1) {
    return parseInt(hexdata.slice(start * 2, start * 2 + length), 16) / divisor;
}

function hexToAscii(hexdata, start, length) {
    //Get the array of bytes that contain the string
    const buffer = hexdata.slice(start * 2, start * 2 + length);
    // Get the hex value representation for each byte in the array
    const hexstr = buffer.toString('hex');
    //create a character array
    const chararray = Buffer.from(hexstr, 'hex');
    // Finally, return the human-readable version of the array: a string
    return chararray.toString('ascii');;
  }

// Create the server and handle incoming connections
const server = net.createServer(conn => {
    conn.on('data', rawdata => {
        const hexdata = rawdata.toString('hex');
        
        console.log('Data Received: ' + hexdata);

        // Check for valid data
        if (hexdata.startsWith(header) && hexdata.length > dataSize) {
            const sn = hexToAscii(hexdata, offsets.sn, 30);
            
            console.log('Reporting Inverting Serial Number: ' + sn);

            const data = {
                InverterSN: `${sn}`,
                WattNow: parseHexData(hexdata, offsets.now, 4),
                KwhDay: parseHexData(hexdata, offsets.day, 4, 100),
                KwhTotal: parseHexData(hexdata, offsets.total, 8, 10),
                KwhYesterday: parseHexData(hexdata, offsets.yesterday, 4, 100),
                KwhMonth: parseHexData(hexdata, offsets.month, 4),
                KwhLastMonth: parseHexData(hexdata, offsets.lastMonth, 4),                
                Temp: parseHexData(hexdata, offsets.temp, 4, 10),
                DCVolts1: parseHexData(hexdata, offsets.vdc1, 4, 10),
                DCVolts2: parseHexData(hexdata, offsets.vdc2, 4, 10),
                DCAmps1: parseHexData(hexdata, offsets.adc1, 4, 10),
                DCAmps2: parseHexData(hexdata, offsets.adc2, 4, 10),
                ACVolts: parseHexData(hexdata, offsets.vac, 4, 10),
                ACAmps: parseHexData(hexdata, offsets.aac, 4, 10),
                ACFreq: parseHexData(hexdata, offsets.freq, 4, 100),
                Timestamp: new Date(new Date().toUTCString())
            };

            Solar.create(data).then((doc) => {
                console.log('Data saved! Record Id: ' + doc._id)
            }).catch((err) => {
                console.log('Error saving data: ' + err.message);
            });              

            console.log(JSON.stringify(data));
            
        } else{
            console.log('Missing, or Invalid Data!');
        }
    });

    conn.on('close', () => {
        console.log('Connection closed');
    });

    conn.on('error', (err) => {
        console.log('Error: ' + err.message);
    });    
});

// mongodb handlers
db.on('error', (err) => {
    throw new Error(err);
});

db.once('open', () => {
    console.log(`Connected to MongoDB`);
});

// start listening
server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST || 'all interfaces'}:${PORT}`);
});

