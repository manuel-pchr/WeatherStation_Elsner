import * as WeatherStation from '../'

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