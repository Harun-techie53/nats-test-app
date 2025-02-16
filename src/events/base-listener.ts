import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  private client: Stan;
  abstract subject: T["subject"];
  abstract queueGroup: string;
  abstract onMessage(data: T["data"], msg: Message): void;
  protected ackWait = 5 * 1000;

  constructor(stan: Stan) {
    this.client = stan;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroup);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroup,
      this.subscriptionOptions()
    );
    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroup}`);

      const parsedData = this.parseMessage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();

    if (!data) {
      console.error("Received empty data");
    }

    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
