const inspector = require('inspector');
const Events = require('events');

const session = new inspector.Session();
session.connect();

let isRunning = false;

class Profiler extends Events {
    
    constructor() {
        super();
        this.ready = false;
        this.lastChunkId = 0;
        this.lastProfile = {
            cpu: null,
            mem: null,
            snapshot: null,
        }
        session.post('Profiler.enable', () => {
            this.emit('ready', true);
            this.ready = true;
        });
    }

    memSample(time_seconds, filename='./profile.heaptimeline') {
        const self = this;
        session.post('HeapProfiler.enable', () => {
            session.post('HeapProfiler.startSampling', () => {
                setTimeout(() => {
                    session.post('HeapProfiler.stopSampling', (err, { profile }) => { 
                        if(!err) {
                            this.lastProfile.mem = JSON.stringify(profile);
                            self.emit('profile_available', { type: 'memory', file: filename })
                        } else {
                            self.emit('error', err);
                        }
                    });
                }, time_seconds * 1000);
            });
        });
    }

    memSnapShot(time_seconds, filename='snapshot') {
        const self = this;
        let ndx = 0;
        let memDump = '';
        const delimiter = ']}';
        session.on('inspectorNotification', (ev) => {
            if (ev.method === 'HeapProfiler.addHeapSnapshotChunk') {
                const chunk = ev.params.chunk;
                memDump+=chunk;
                const lastChars = (memDump.length >= delimiter.length) ? memDump.substring(memDump.length - 2, memDump.length) : '';
                if (lastChars === delimiter) {
                    const fn = 'heapsnapshot-final.heapsnapshot';
                    fs.writeFileSync(fn, memDump);
                    this.emit('profile_available', { type: 'mem', file: fn })
                }
                this.lastChunkId = ndx++;
            } else {
                this.emit('method_called', ev.method);
            }
        });
        
        session.post('HeapProfiler.enable', () => {
            session.post('HeapProfiler.takeHeapSnapshot', _ => {});
        });
    }

    cpuSample(time_seconds, filename='./profile.cpuprofile') {
        const self = this;
        session.post('Profiler.enable', () => {
            session.post('Profiler.start', () => {
                setTimeout(() => {
                    session.post('Profiler.stop', (err, { profile }) => { 
                        if(!err) {
                            fs.writeFileSync(filename, JSON.stringify(profile));
                            self.emit('profile_available', { type: 'cpu', file: filename })
                        } else {
                            self.emit('error', err);
                        }
                    });
                }, time_seconds * 1000);
            });
        });
    }
}

module.exports = Profiler