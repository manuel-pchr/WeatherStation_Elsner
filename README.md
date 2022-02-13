Weather Station Elsner RESTful API JSON
========
for RS-485 serial interface weather stations from manufacturer Elsner.

---

### Currently only `Elsner P03/3-RS485 basic` is supported!

---

## Examples

### Basic usage

Just create an instance an browse the webservice. If you want to debug the communication, enable logging.

```typescript
// json_api_server/app.ts

import { processenv } from 'processenv';
import * as WeatherStation from '..'

const environment_NODE_ENV = String( processenv('NODE_ENV') ?? 'production' );
const environment_SERIAL_COM_PORT = String( processenv('SERIAL_COM_PORT') ?? '/dev/ttyUSB0' )
const environment_HTTP_SERVER_PORT = Number( processenv('HTTP_SERVER_PORT') ?? 3000 );
const environment_LOG_DEBUG = Boolean( processenv('LOG_DEBUG') ?? false );

const myWeatherStation = new WeatherStation.ElsnerP03 ( {
    instanceName: 'WeatherStation',
    comPort: environment_SERIAL_COM_PORT,
    httpPort: environment_HTTP_SERVER_PORT,
    log_cmdLine: environment_LOG_DEBUG
})
```

```typescript
// example/basic_use.ts

import * as WeatherStation from '..'

const myWeatherStation = new WeatherStation.ElsnerP03 ( {
    instanceName: 'WeatherStation_Example',
    comPort: '/dev/ttyUSB0',
    httpPort: 3000,
    log_cmdLine: true
})

myWeatherStation.on('update', (weatherData: WeatherStation.DataRows_ElsnerP03, err: string) => {
    if(!err) {
        console.log('Weather Station Data: ', weatherData)
    } else { 
        console.log('Error: ', err)
    }
})
```



---
---

## Docker Help


### Build Image for current system:
```
docker build -t weather_station_server:version .
```

### You can see which platforms are supported for image building by running:
```
docker buildx ls
```

### Build image for Raspberry Pi 4:
```
docker build --platform linux/arm/v7 -t weather_station_server:version .
```

### Access to hardware devices from docker container:
Set permissions for device to allow access from docker container(the easy way):
```
sudo chmod a+rwx /dev/ttyUSB0
```
chmod setting is not permanent and has to be set each startup
--> put the command in /etc/rc.local

https://stackoverflow.com/questions/24225647/docker-a-way-to-give-access-to-a-host-usb-or-serial-device

### Export image(for moving to another machine):
```
docker save -o C:\weather_station_server_version.tar weather_station_server:version
```

### Run Container:
```
docker run -d -p 3000:3000 -i --device=/dev/ttyUSB0 --env SERIAL_COM_PORT=/dev/ttyUSB0 --env HTTP_SERVER_PORT=3000 --env LOG_DEBUG=true --name WeatherStation --restart=always weather_station_server:version
```

---

## ToDo

* remove dependency watchout