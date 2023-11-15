const http = require('http');
const { Server } = require("socket.io");
const {login} = require('../controller/auth.controller');
const { getFirestore } = require('firebase-admin/firestore');

class socket{
    constructor(app){
        const server = http.createServer(app);
        const io = new Server(server,  {cors: {origin: "*"}});

        //SOCKET
        server.listen(process.env.PORT_SOCKET, () => {
            console.log('\x1b[36m%s\x1b[0m',` ⏱  Websocket en el puerto: ${process.env.PORT_SOCKET}`);
        });

        //WEBSOCKETS
        io.on('connection', (socket) => {
            // const db = getFirestore();

            console.log('Usuario conectado');
            // socket.on('disconnect', () => { let id = socket.user_data ? socket.user_data.user_id : ''; leave({user_id: id}, io)});

            //comandos
            socket.on('login', (data, callback)=> login(data, callback, io))
        });
    }
}

module.exports = socket;