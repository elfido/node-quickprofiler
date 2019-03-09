const Profiler = require('./profiler');

const profiler = new Profiler();

profiler.on('created', function() {
    console.log('created');
});

profiler.on('ready', _ => {
    console.log('profiler ready');
});

profiler.on('error', (err) => {
    console.dir(err);
});

profiler.on('profile_available', (profileInfo) => {
    console.dir(profileInfo);
});

if (profiler.ready) {
    console.log('cool');
}

setTimeout(() => {
    profiler.memSnapShot(25);
}, 1400);

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