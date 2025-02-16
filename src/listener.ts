import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-listener";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener is connected to NATS");

  //if a listener closes then nats-streaming-server will
  //immediately close the corresponding subscription
  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

//if server closes from terminal command then client will be closed too
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
