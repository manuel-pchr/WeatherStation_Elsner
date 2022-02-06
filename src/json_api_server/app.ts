import * as WeatherStation from '..'

const myWeatherStation = new WeatherStation.ElsnerP03 ( {
    instanceName: 'WeatherStation',
    comPort: '/dev/ttyUSB0',
    httpPort: 3000,
    log_cmdLine: true
})