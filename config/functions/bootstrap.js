"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/concepts/configurations.html#bootstrap
 */

module.exports = () => {
  const express = require("express");
  const http = require("http");
  const app = express();
  const server = http.createServer(app);

  var io = require("socket.io").listen(server);
  server.listen(5000, console.log("socket server running"));

  console.log(io);
  io.on("connection", function (socket) {
    console.log("Conectado");
    // send message on user connection
    socket.emit("hello", JSON.stringify({ message: "Hello food lover" }));
    // listen for user diconnect
    socket.on("disconnect", () => console.log("a user disconnected"));
  });
  strapi.io = io; // register socket io inside strapi main object to use it globally anywhere
  strapi.nuevoPedido = (pedido) => io.emit("nuevo_pedido", pedido);
};
