export class Logger {
	public instanceName: string
	public log_cmdLine: boolean

	constructor (options: {
		instanceName: string,
		log_cmdLine: boolean}){
		this.instanceName = ''
		this.log_cmdLine = false
		
		if(options.instanceName)
			this.instanceName = options.instanceName
	
		if(options.log_cmdLine)
			this.log_cmdLine = options.log_cmdLine
	}
	
	private timeNow = (): string => {
		const date = new Date()
		const hour = (date.getHours()<10?'0':'') + date.getHours()
		const minute = (date.getMinutes()<10?'0':'') + date.getMinutes()
		const second = (date.getSeconds()<10?'0':'') + date.getSeconds()
		const time = `${hour}:${minute}:${second}`;
		return time;
	}

	public write (message: string): void {
		if(this.log_cmdLine) {
			if(this.instanceName !== '')
				console.log( `${this.timeNow()} ${this.instanceName}: ${message}` );
			else
				console.log( `${this.timeNow()} ${message}` );
		}
	}
}