import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

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

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName("test-durable");

  const subscription = stan.subscribe(
    "ticket:created",
    "orders-service-queue-group",
    options
  );

  subscription.on("message", (msg: Message) => {
    console.log(
      `Message received #${msg.getSequence()} with message: ${msg.getData()}`
    );

    msg.ack();
  });
});

//if server closes from terminal command then client will be closed too
process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
