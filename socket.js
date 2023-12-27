const express = require('express');
const app = express();
const { createServer } = require('node:http');

const { Server } = require("socket.io");

const server = createServer(app);
const io = new Server(server);

module.exports = {
    server,
    io,
    app
}
