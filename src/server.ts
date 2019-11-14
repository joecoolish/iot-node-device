import { Client, Message } from "azure-iot-device";
import { Mqtt } from "azure-iot-device-mqtt";
import { IoTClient, OpenState } from "./client";
import * as express from "express";
import * as http from "http";
import * as bodyParser from "body-parser";

const connectionString =
  "HostName=PimpHub.azure-devices.net;DeviceId=TestNodeDevice;SharedAccessKey=DfeNL7PsJAj4qGK3DWwTwrVo0mdtYtHg7Lr12j/q5bA=" ||
  process.env.CONNECTION_STRING;
const client = new IoTClient(
  Client.fromConnectionString(connectionString, Mqtt)
);
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.get("/status", async (req, res) => {
  try {
    const twin = await client.getStatusAsync();
    res.json(twin.properties);
  } catch (error) {
    res.json({ error });
  }
});

app.post("/api/setProp", (req, res) => {
  const property = req.body;

  if (client.openState === OpenState.Open) {
    client
      .setPropertyAsync(property)
      .then(() => res.send({ success: true }))
      .catch(error => {
        res.status(500);
        res.send({ error });
      });
  } else {
    res.status(500);
    res.send({ error: `Current client status is ${client.openState}` });
  }
});

const port = process.env.PORT || "3000";
app.set("port", port);

server.listen(port, () =>
  console.log(`API started. Running on 10.0.75.2:${port}`)
);
