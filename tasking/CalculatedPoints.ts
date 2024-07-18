import jspredict from 'jspredict';

export type PointingData = { azimuth: number, elevation: number };

class CalculatedPoints {
    private time_map: Map<number, PointingData>;
    private times_iterator: IterableIterator<number>;
    private last_mark: number;

    interval: number;
    start_time: number;
    end_time: number;


    constructor(tle: string, qth: number[], start_time: number, duration: number, interval: number) {
        this.time_map = new Map();
        this.interval = interval;
        this.start_time = start_time;
        this.end_time = this.start_time + duration;

        let observe_time = this.start_time;

        while (observe_time <= this.end_time) {
            const { azimuth, elevation } = jspredict.observe(tle, qth, observe_time) as { azimuth: number, elevation: number };

            this.time_map.set(observe_time, { azimuth, elevation });

            observe_time += this.interval;
        }

        console.log(`Calculated ${this.time_map.size} pointing(s)`);

        this.times_iterator = this.time_map.keys();
        this.last_mark = this.times_iterator.next().value;
    }

    mark() {
        const stamp = Date.now();

        if (stamp < this.start_time || stamp > this.end_time) {
            return null;
        }

        while (stamp > this.last_mark + this.interval) {
            this.last_mark = this.times_iterator.next().value;
        }

        return this.time_map.get(this.last_mark) || null;
    }
}

export default CalculatedPoints;
