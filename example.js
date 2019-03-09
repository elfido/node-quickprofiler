const Profiler = require('./profiler');
const fs = require('fs');

const profiler = new Profiler();

profiler.on('ready', _ => {
    console.log('profiler ready');
});

profiler.on('inspector_method',(ev) =>{
	console.log(ev);
});

setTimeout(async () => {
	try {
		const report = await profiler.sampleCPU(10);
		fs.writeFileSync('profile.cpuprofile', report);
	} catch(e) {
		console.error(e);
	}
}, 4000);

const collection = [];

setInterval(() => {
    console.log('ping');
    const b = { a: 'b' };
    for (let i=0; i<10; i++) {
        collection.push('a');
        collection.push(b);
    }
    console.log(collection.length);
}, 1333);