## Quick profiler

Promisifies the ```inspector``` library and implements the boiler plate for you; then you
can make simpler calls to get memory and CPU profiling information ready to be visualized in
Google Chrome. All reports are returned as a stringified version of the JSON response to be 
ready to be stored in a file or returned in a REST endpoint.

Example:
```js
const Profiler = require('./profiler');
const fs = require('fs');

const profiler = new Profiler();

profiler.on('ready', _ => {
    console.log('profiler ready');
});

setTimeout(async () => {
	try {
		const report = await profiler.sampleCPU(10);
		fs.writeFileSync('profile.cpuprofile', report);
	} catch(e) {
		console.error(e);
	}
}, 4000); // Doing this to capture a sample later
```

## Methods:

### sampleCPU(time_seconds)
Captures a CPU profile for the amount of time specified by the argument, the default value is 
30.

### sampleMemory(time_seconds)
Captures a CPU profile for the amount of time specified by the argument, the default value is 
30.

### memorySnapshot

Captures a memory snapshot. Takes no argument.

### collectGarbage

Calls for garbage collection. Takes no argument.

## Suggested filename

| Type | File name |
| ---- | --------- |
| Heap snapshot | snapshot.heapsnapshot |
| Memory profiling | profile.heaptimeline |
| CPU profiling | profile.cpuprofile |