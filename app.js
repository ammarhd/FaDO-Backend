const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

var fs = require("fs");
const csv = require("csv-parser");

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
  });

  var trx1000 = [];

  // set the timout interval
  socket.on("messege", () => {
    socket.emit("FromAPI", trx1000);
    trx1000 = [];
    fileStream.resume();
  });

  fileStream = fs
    .createReadStream("./output.csv2")
    .pipe(csv(" "))
    .on("data", (row) => {
      trx1000.push(Object.values(row));
      if (trx1000.length >= 10000) {
        fileStream.pause();
        console.log(trx1000);
      }
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
