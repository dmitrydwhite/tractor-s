import jspredict from 'jspredict';
import CalculatedPoints from './tasking/CalculatedPoints';
import Forecasting from './forecasting/Forecasting';
import Tractor from './Tractor';

// const ONE_DAY = 60 * 1000 * 60 * 24;
// const ISS = 24455;

// const TLE = `
// 1 33591U 09005A   24190.47293606  .00000259  00000-0  16336-3 0  9996
// 2 33591  99.0460 246.4963 0013092 229.1830 130.8206 14.13042638794636`;

// const qth = [45, -122.79, 0.081];

// const [next_transit] = jspredict.transits(TLE, qth, Date.now(), Date.now() + (2 * ONE_DAY));
// const { start, duration } = next_transit as { start: number, duration: number };

// const transit = new CalculatedPoints(TLE, qth, new Date(start), duration, 500);

// console.log('Identifying mark');
// console.log(transit.mark());
// console.log(`Next transit expected at ${new Date(start)}`);

// const beep = new Forecasting();

// beep.get_tle('33591');

const tractor = new Tractor([45, -122.79, .081]);

tractor.run();
