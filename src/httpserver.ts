import express from 'express';
import { DataRows_ElsnerP03 } from '.';
import { Logger } from './log';

export class HttpServer {
  setWeatherData(weatherData: DataRows_ElsnerP03) {
    throw new Error('Method not implemented.');
  }
	public instanceName: string
	public http_server_port: number
	public log_cmdLine: boolean

	private log: Logger
	private weatherData!: DataRows_ElsnerP03;

	constructor (options: {
		port: number,
		instanceName: string,
		log_cmdLine: boolean
		}){
		this.instanceName = ''
		this.http_server_port = 0
		this.log_cmdLine = false

		if(options.port)
			this.http_server_port = options.port;

		if(options.instanceName)
			this.instanceName = options.instanceName
		
		if(options.log_cmdLine)
			this.log_cmdLine = options.log_cmdLine

		this.log = new Logger({
			instanceName: this.instanceName,
			log_cmdLine: this.log_cmdLine
		})

		this.setWeatherData = function(weatherData: DataRows_ElsnerP03){
			this.weatherData = weatherData;
		}

		const app = express();

		app.get('/', (req: any, res): void => {
			const response = JSON.stringify(this.weatherData);
			res.set('Content-Type', 'text/json');
			res.send(response);
		})

		app.listen(this.http_server_port, () => {
			this.log.write(`HTTP-Server started at port ${this.http_server_port}`)
		})
	}
}