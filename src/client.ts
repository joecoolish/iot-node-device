import { Client, Message, Twin } from "azure-iot-device";
import { Subject } from "rxjs";

export enum OpenState {
  Open,
  Closed,
  Error
}

export class IoTClient {
  public openState = OpenState.Closed;
  public openStateChanged = new Subject<OpenState>();

  constructor(private client: Client) {
    client.open(err => this._openHandler(err));
  }

  setPropertyAsync(property: any) {
    return new Promise((resolve, reject) => {
      this.getStatusAsync()
        .then(twin => {
          try {
            console.log(`property: ${property}`);
            twin.properties.reported.update(property, err => {
              console.log(`err: ${err}`);
              if (err) {
                console.error("could not update twin");
                reject({ error: "could not update twin" });
              } else {
                console.log("twin state reported");
                resolve();
              }
            });
          } catch (error) {
            console.error(error);
            reject(error);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  getStatusAsync() {
    return new Promise<Twin>((resolve, reject) => {
      this.client.getTwin((err, twin) => {
        if (err) {
          console.error("could not get twin");
          reject({ error: "could not get twin" });
        } else {
          resolve(twin);
        }
      });
    });
  }

  private _openHandler(err) {
    if (err) {
      console.error("could not open IotHub client");
      this.openState = OpenState.Error;
    } else {
      console.log("client opened");
      this.openState = OpenState.Open;
    }

    this.openStateChanged.next(this.openState);
  }
}
