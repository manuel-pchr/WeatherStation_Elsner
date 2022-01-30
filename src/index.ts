/** 
 * Elsner P03/3 RS485 Weather Station - JSON REST Webservice
*/
import EventEmitter from 'events'
import SerialPort from 'serialport';
const Watchout = require('watchout')

import { Logger } from './log';
import { HttpServer } from './httpserver';

interface instanceParameters {
  instanceName: string
  comPort: string
  httpPort: number
  log_cmdLine: boolean
}

interface dataRowSingle {
  value: number | 'Y' | 'N' | 'unknown'
  unit: string
  info: string
}

interface commuicationStatusParameters {
  Communication: string
  TimeLastValidData: string
  LastDataChecksum: string
}

/** 
 * All available data from the weather station 
 */
export interface DataRows_ElsnerP03 {
  Temperature: dataRowSingle
  SunSouth: dataRowSingle
  SunWest: dataRowSingle
  SunEast: dataRowSingle
  Twilight: dataRowSingle
  DayLight: dataRowSingle
  Wind: dataRowSingle
  Rain: dataRowSingle
  Status: commuicationStatusParameters
}

/**
 * Communication with weather station Elsner P03/3
 */
export class ElsnerP03 extends EventEmitter
  implements instanceParameters {
  public instanceName: string
  public comPort: string
  public httpPort: number
  public log_cmdLine: boolean
  public weatherData!: DataRows_ElsnerP03;

  private httpserver: HttpServer
  private serialConnection: SerialPort 
  private log: Logger
  private watchdog_receiveData: typeof Watchout
  private watchdog_telegram: typeof Watchout
  private dataBuffer: Buffer
 
  constructor (parameters: instanceParameters) {
    super();
    
    this.instanceName = 'WeatherStation'
    this.comPort = ''
    this.httpPort = 0
    this.log_cmdLine = false

    this.dataBuffer = Buffer.from([])

    this.init_weatherData();

    /* ----- constructor parameters ----- */
    if (parameters.instanceName) { // TODO: test!
      this.instanceName = parameters.instanceName
    }

    if (parameters.log_cmdLine) { // TODO: test!
      this.log_cmdLine = parameters.log_cmdLine
    }

    this.log = new Logger({
      instanceName: this.instanceName + this.comPort.toUpperCase(),
      log_cmdLine: this.log_cmdLine
    })

    if (parameters.comPort) { // TODO: test!
      this.comPort = parameters.comPort
    } else {
      throw new Error("Communication port must be defined! eg. RaspberryPi '/dev/ttyAMA0', '/dev/ttyUSB0'; Windows 'COM1'");
    }

    if (parameters.httpPort) {
      this.httpPort = parameters.httpPort
    } else {
      this.httpPort = 80
      this.log.write('httpPort was not specified --> use default port 80')
    }

    this.httpserver = new HttpServer({
      port: this.httpPort,
      instanceName: this.instanceName + '_HTTP_SRV_PORT' + this.httpPort,
      log_cmdLine: this.log_cmdLine
    })
      
    this.serialConnection = new SerialPort(this.comPort, {
      baudRate: 19200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    })

    /* ----- watchdogs ----- */
    this.watchdog_receiveData = new Watchout(3000, (haltedTimeout: number) => { // 3seconds
      if (haltedTimeout) { // Timeout did not occur
      } else {
        let error = 'Timeout serial data'
        this.log.write(error)
        this.weatherData.Status.Communication = 'invalid'
        this.httpserver.setWeatherData(this.weatherData)
        this.emit('update', this.weatherData, error)
      }
    })

    this.watchdog_telegram = new Watchout(3000, (haltedTimeout: number) => { // 3seconds
      if (haltedTimeout) { // Timeout did not occur
      } else {
        let error = 'Timeout serial data (no complete telegram was received)'
        this.log.write(error)
        this.weatherData.Status.Communication = 'invalid'
        this.httpserver.setWeatherData(this.weatherData)
        this.emit('update', this.weatherData, error)
      }
    })

    /* ----- serial communication ----- */
    this.serialConnection.on('data',  (data: Array<number>) => {
      this.watchdog_receiveData.reset();
      
      if (data.toString().indexOf('W') > -1) { // start of telegram detected
        this.dataBuffer = Buffer.from(data)
      }

      let dataStatus = ''
      if (this.dataBuffer.byteLength >= 40) {
        // this.log.write("dataBuffer: Length ok")
        if (this.dataBuffer.toString('utf8').slice(0, 1) === 'W') {
          dataStatus = 'valid'
        }
        else {
          dataStatus = 'invalid'
        }
      }
      else {
        dataStatus = 'invalid'
      }

      if (dataStatus === 'valid') {
        this.weatherData = this.analyzeData(this.dataBuffer)
        this.httpserver.setWeatherData(this.weatherData)
        this.emit('update', this.weatherData)
      } 
      else { // error or telegram not complete yet
      }
    })

    this.serialConnection.on('close', () => {
      this.log.write('Serial connection closed! Try to reconnect...')
      this.reconnectSerial()
    })

    this.serialConnection.on('error', (msg: string) => {
      this.log.write('serialConnection: ' + msg)
    })

    process.on('SIGINT', () => {
      this.serialConnection.close()
      process.exit()
    })

  }

  private init_weatherData() {
    this.weatherData = {
      Temperature: { value: 'unknown', unit: 'degreeCelsius', info: 'Range -40 - 80, Accuracy +-1.5 at -25 - 80' },
      SunSouth: { value: 'unknown', unit: 'klx', info: 'Range 0-99' },
      SunWest: { value: 'unknown', unit: 'klx', info: 'Range 0-99' },
      SunEast: { value: 'unknown', unit: 'klx', info: 'Range 0-99' },
      Twilight: { value: 'unknown', unit: 'Y/N', info: 'Y when <10lx' },
      DayLight: { value: 'unknown', unit: 'lx', info: 'Range 0-999' },
      Wind: { value: 'unknown', unit: 'm/s', info: 'Range 0-70, Accuracy +-25% at 0-15'},
      Rain: { value: 'unknown', unit: 'Y/N', info: 'Y when detected' },
      Status: { Communication: 'unknown', TimeLastValidData: 'unknown', LastDataChecksum: 'unknown' }
    }
  }

  private reconnectSerial(): void {
    this.log.write('Initiating reconnect!')
    setTimeout( () => {
      this.log.write('Reconnect!')
      this.constructor()
    }, 2000)
  }

  private analyzeData (dataTelegram: Buffer): DataRows_ElsnerP03 { // on complete telegram received
    this.watchdog_telegram.reset()
    this.weatherData.Status.Communication = 'valid'
    let checksum = 0
    
    for (let byteCnt = 0; byteCnt < 35; byteCnt++) {
      if (dataTelegram.byteLength >= 40) {
        checksum = checksum + dataTelegram.readUInt8(byteCnt)
      }
    }

    let dataString = dataTelegram.toString('utf8')
    this.log.write('Data (valid): ' + dataString)

    let checksumStatus = ''
    if (checksum === parseInt(dataString.slice(35, 39))) {
      checksumStatus = 'valid'
      this.weatherData.Status.TimeLastValidData = new Date().toString()
      this.weatherData.Status.LastDataChecksum = checksumStatus
      // this.log.write("Checksum OK");
    } else {
      checksumStatus = 'invalid'
      this.log.write('Checksum not OK!')
      // this.log.write("Checksum not OK! Checksum calculated:", checksum);
      this.weatherData.Status.LastDataChecksum = checksumStatus
      return this.weatherData
      
    }

    this.weatherData.Temperature.value = parseFloat(dataString.slice(1, 6))
    this.weatherData.SunSouth.value = parseInt(dataString.slice(6, 8))
    this.weatherData.SunWest.value = parseInt(dataString.slice(8, 10))
    this.weatherData.SunEast.value = parseInt(dataString.slice(10, 12))
    this.weatherData.Twilight.value = dataString.slice(12, 13).replace('J', 'Y') == 'Y' ? 1 : 0; 
    this.weatherData.DayLight.value = parseInt(dataString.slice(13, 16))
    this.weatherData.Wind.value = parseFloat(dataString.slice(16, 20))
    this.weatherData.Rain.value = dataString.slice(20, 21).replace('J', 'Y') == 'Y' ? 1 : 0; 

    return this.weatherData
  }

}