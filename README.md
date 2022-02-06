Weather Station Elsner JSON API 
========
for serial line weather stations from manufacturer Elsner.

---

Currently only `Elsner P03/3-RS485 basic` is supported!

---

## Examples

### Basic usage

Just create an instance an browse the webservice. If you want to debug your communication, enable `log_cmdLine`.

```typescript
import * as WeatherStation from './'

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

## Docker Help:


### Build Image for current system:
```
docker build -t weather_station_server:latest .
```

### You can see what build platforms are supported by buildx by running:
```
docker buildx ls
```

### Build image for Raspberry Pi 4:
```
docker build --platform linux/arm/v7 -t weather_station_server:latest .
```

### Allow access to hardware devices from docker container
```
https://stackoverflow.com/questions/24225647/docker-a-way-to-give-access-to-a-host-usb-or-serial-device
```

### Export image(for moving to another machine):
```
docker save -o C:\weather_station_server.tar weather_station_server:latest
```

### Run Container:
```
docker run -d -p 3000:3000 -i --device=/dev/ttyUSB0 --name weatherStation --restart=always weather_station_server:latest
```