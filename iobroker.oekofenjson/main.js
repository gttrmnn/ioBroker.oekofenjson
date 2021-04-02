"use strict";

/*
 * Created with @iobroker/create-adapter v1.32.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const axios = require("axios");

// Load your modules here, e.g.:
// const fs = require("fs");

class Oekofenjson extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "oekofenjson",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
	
		const host = this.config.host;
		const port = this.config.port;
		const password = this.config.password;
		const device = this.config.device;

		const oekofenUrl = 'http://' + host + ':' + port + '/' + password + '/' + device

		this.log.info("Oekofen URL: " + oekofenUrl);

		axios({
			method: 'get',
			url: oekofenUrl	,
			timeout: 10000,
			responseType: 'json'
		}).then(
			async (response) => {
				const content = response.data;

				this.log.info('request done');
				this.log.info('received data (' + response.status + '): ' + JSON.stringify(content));

				await this.setObjectNotExistsAsync('responseCode', {
					type: 'state',
					common: {
						name: 'responseCode',
						type: 'number',
						role: 'value',
						read: true,
						write: false
					},
					native: {}
				});
				this.setState('responseCode', {val: response.status, ack: true});

				if (content && Object.prototype.hasOwnProperty.call(content, 'pe1')) {
					this.log.info('pe1 found')

			
					this.log.info('content.L_temp_act='+content.pe1.L_temp_act);
					this.log.info('content.L_temp_set='+content.pe1.L_temp_set); 


					//this.setState("Oekofen.System.Aussentemperatur", parseFloat((content.system.L_ambient * 0.1).toFixed(1)));
 					// 	let unit = null;
					// 	let role = 'value';

					//unit = '°C';
					//role = 'value.temperature'

					await this.setObjectNotExistsAsync('Oekofen.System.Aussentemperatur', {
							type: 'state',
							common: {
								name: 'Oekofen.System.Aussentemperatur',
								type: 'number',
								role: 'value.temperature',
								unit: '°C',
								read: true,
								write: false
							},
							native: {}
						});
						this.setState('Oekofen.System.Aussentemperatur', {val: parseFloat((content.system.L_ambient * 0.1).toFixed(1)), ack: true});


					// for (obj in content.pe1) {

					// 	this.log.info('obj=' + obj)
						
					// 	// await this.setObjectNotExistsAsync(obj.L_temp_act, {
					// 	// 	type: "state",
					// 	// 	common: {
					// 	// 		name: "testVariable",
					// 	// 		type: "boolean",
					// 	// 		role: "indicator",
					// 	// 		read: true,
					// 	// 		write: true,
					// 	// 	},
					// 	// 	native: {},
					// 	// });
				
					// 	// this.subscribeStates("testVariable");
					// 	// await this.setStateAsync("testVariable", true);
				
					// }


					// for (const key in content.datavalues) {
					// 	const obj = content.datavalues[key];

					// 	this.log.info(obj);

					// 	let unit = null;
					// 	let role = 'value';

					// 	//if (obj.value)

					// 	if (obj.value_type.indexOf('L_temp_act') >= 0) {
					// 		this.log.info('L_statetext found')
					// 		unit = '°C';
					// 		role = 'value.temperature'
					// 	} else if (obj.value_type.indexOf('SDS_') >= 0) {
					// 		unit = 'µg/m³';
					// 		role = 'value.ppm';
					// 	} else if (obj.value_type.indexOf('temperature') >= 0) {
					// 		unit = '°C';
					// 		role = 'value.temperature';
					// 	} else if (obj.value_type.indexOf('humidity') >= 0) {
					// 		unit = '%';
					// 		role = 'value.humidity';
					// 	} else if (obj.value_type.indexOf('pressure') >= 0) {
					// 		unit = 'Pa';
					// 		role = 'value.pressure';
					// 	} else if (obj.value_type.indexOf('noise') >= 0) {
					// 		unit = 'dB(A)';
					// 		role = 'value';
					// 	} else if (Object.prototype.hasOwnProperty.call(unitList, obj.value_type)) {
					// 		unit = unitList[obj.value_type];
					// 		role = roleList[obj.value_type];
					// 	}

					// 	await this.setObjectNotExistsAsync(obj.value_type, {
					// 		type: 'state',
					// 		common: {
					// 			name: obj.value_type,
					// 			type: 'number',
					// 			role: role,
					// 			unit: unit,
					// 			read: true,
					// 			write: false
					// 		},
					// 		native: {}
					// 	});
					// 	this.setState(obj.value_type, {val: parseFloat(obj.value), ack: true});
					//}
				} else {
					this.log.warn('Response has no valid content. Check Config and try again.');
				}

			}
		).catch(
			(error) => {
				if (error.response) {
					// The request was made and the server responded with a status code

					this.log.warn('received error ' + error.response.status + ' response from ' + oekofenUrl + ' with content: ' + JSON.stringify(error.response.data));
				} else if (error.request) {
					// The request was made but no response was received
					// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
					// http.ClientRequest in node.js<div></div>
					this.log.error(error.message);
				} else {
					// Something happened in setting up the request that triggered an Error
					this.log.error(error.message);
				}
			}
		);


		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectNotExistsAsync("testVariable", {
			type: "state",
			common: {
				name: "testVariable",
				type: "boolean",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		this.subscribeStates("testVariable");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);

        this.killTimeout = setTimeout(this.stop.bind(this), 15000);

	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Oekofenjson(options);
} else {
	// otherwise start the instance directly
	new Oekofenjson();
}