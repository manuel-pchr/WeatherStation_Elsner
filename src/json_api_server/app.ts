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