import { get_next_task, update_replace_new_tasks } from './datastore/crud/tasks';
import { get_expired_tles, update_tles } from './datastore/crud/tles';
import { TLE } from './datastore/StoredDataType';
import Forecasting from './forecasting/Forecasting';
import HardwarePointingHarness from './hardware/HardwarePointingHarness';
import PointingTask from './tasking/PointingTask';
import { is_expired } from './tasking/TaskData';
import { QTH } from './types/types';

class Tractor {
    private step: number;
    private run_interval: NodeJS.Timeout;
    private active_task: PointingTask | null;
    private upcoming_task: PointingTask | null;
    private hardware: HardwarePointingHarness;
    private forecasting: Forecasting;
    private is_updating: boolean;

    qth: QTH;
    imminent_window: number;

    constructor(qth: QTH) {
        this.qth = qth;
        this.forecasting = new Forecasting();
        this.hardware = new HardwarePointingHarness({ indicator: 1, pan_pin: 2, tilt_pin: 3 });
        this.active_task = null;
        this.is_updating = false;
        this.imminent_window = 120000;
    }

    private manage_active_task() {
        if (!this.active_task) return;

        if (is_expired(this.active_task)) {
            this.active_task = null;
            this.hardware.assign(null);
            
            return;
        }

        this.hardware.assign(this.active_task.update());
    }

    private check_for_stale_tles(): Promise<TLE[]> {
        return new Promise(resolve => {
            get_expired_tles().then(expired => resolve(expired));
        });
    }

    private async update_stale_tles_and_tasks(stale_tles: TLE[]) {
        const new_tles = await this.forecasting.get_tles(stale_tles);
        
        await update_tles(new_tles);

        const new_tasks = this.forecasting.get_task_list(this.qth, new_tles);

        await update_replace_new_tasks(new_tasks);
    }

    private async cue_next_task() {
        const next_task = await get_next_task();
        this.upcoming_task = new PointingTask(next_task);

        console.info(`Cueing upcoming task scheduled at ${new Date(next_task.start)}`);
    }

    private is_imminent(task?: PointingTask) {
        if (!task) {
            return false;
        }

        return Date.now() >= task.start - this.imminent_window;
    }

    private activate_upcoming_task() {
        this.active_task = this.upcoming_task;
        this.upcoming_task = null;

        console.info(`Upcoming task is imminent: promoting task id ${this.active_task.id} to active`);
    }

    private async update() {
        // This method is async because we might need to check a database for an upcoming task or something
        if (this.active_task) {
            this.manage_active_task();
        } else if (!this.is_updating) {
            this.is_updating = true;

            const stale_tles = await this.check_for_stale_tles();

            if (stale_tles.length) {
                await this.update_stale_tles_and_tasks(stale_tles);
                await this.cue_next_task();
            }

            this.is_updating = false;
        }

        if (!this.is_updating && !this.upcoming_task) {
            await this.cue_next_task();
        }

        if (this.is_imminent(this.upcoming_task)) {
            this.activate_upcoming_task();
        }
    }

    run() {
        console.log('Starting the tractor...');
        this.run_interval = setInterval(this.update.bind(this), this.step);
    }

    stop() {
        console.log('Stopping the tractor...');
        clearInterval(this.run_interval);
    }
}

export default Tractor;
