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
    httpPort: 80,
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