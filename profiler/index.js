const Events = require('events');

let inspector = null;
let session = null;

function initialize() {
	if (session == null) {
		inspector = require('inspector');
		session = new inspector.Session();
		session.connect();
	}
}

class Profiler extends Events {
    
    constructor() {
		super();
		initialize();
        this.ready = false;
	}
	
	init() {
		session.post('Profiler.enable', () => {
            this.emit('ready', true);
            this.ready = true;
        });
	}

	sampleCPU(time_seconds=30) {
        return new Promise((resolve, reject) => {
			session.post('Profiler.enable', () => {
				session.post('Profiler.start', () => {
					setTimeout(() => {
						session.post('Profiler.stop', (err, { profile }) => { 
							if(!err) {
								resolve(JSON.stringify(profile));
							} else {
								reject(error);
							}
						});
					}, time_seconds * 1000);
				});
			});
		});
    }

    sampleMemory(time_seconds=30) {
		return new Promise((resolve, reject) => {
			session.post('HeapProfiler.enable', () => {
				session.post('HeapProfiler.startSampling', () => {
					setTimeout(() => {
						session.post('HeapProfiler.stopSampling', (err, { profile }) => { 
							if(!err) {
								resolve(JSON.stringify(profile));
							} else {
								reject(err);
							}
						});
					}, time_seconds * 1000);
				});
			});
		});
    }

    memorySnapshot() {
        let memDump = '';
		const delimiter = ']}';
		return new Promise((resolve, reject) => {
			session.on('inspectorNotification', (ev) => {
				if (ev.method === 'HeapProfiler.addHeapSnapshotChunk') {
					const chunk = ev.params.chunk;
					memDump+=chunk;
					const lastChars = (memDump.length >= delimiter.length) ? memDump.substring(memDump.length - 2, memDump.length) : '';
					if (lastChars === delimiter) {
						resolve(memDump);
					}
				} else {
					this.emit('inspector_method', ev );
				}
			});
			
			session.post('HeapProfiler.enable', () => {
				session.post('HeapProfiler.takeHeapSnapshot', _ => {});
			});
		});
	}
	
	collectGarbage() {
		return new Promise((resolve, reject) => {
			session.post('HeapProfiler.enable', () => {
				session.post('HeapProfiler.collectGarbage', (err) => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		});
	}
}

module.exports = Profiler