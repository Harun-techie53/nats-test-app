import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher is connected to NATS");

  const data = JSON.stringify({
    id: "123",
    title: "Test Ticket",
    description: "test description",
    status: "instock",
    price: 20,
  });

  stan.publish("ticket:created", data, () => {
    console.log("Message published");
  });
});
