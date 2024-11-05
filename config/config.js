if (!process.env.NODE_ENV){
    require('dotenv').config();
}

module.exports = {
	name: 'Solar Inverter Listener',
	version: '2.5.0',
	env: process.env.NODE_ENV,
	port: process.env.PORT,
	db: process.env.MONGODB_URI,
	host: process.env.HOST,
	data_header: process.env.DATA_HEADER
};