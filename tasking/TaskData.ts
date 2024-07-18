import { QTH } from '../types/types';
import validate_qth from '../utils/validate-qth';
import validate_tle from '../utils/validate-tle';
import PointingTask from './PointingTask';

class TaskData {
    id: string;
    traveller: string;
    tle: string;
    qth: QTH;
    start: number;
    duration: number;
    interval: number;

    constructor(
        task_id: string,
        traveller_id: string,
        tle: string,
        qth: QTH,
        start: number,
        duration: number,
        interval?: number,
    ) {
        this.id = task_id;
        this.traveller = traveller_id;
        this.tle = validate_tle(tle);
        this.qth = validate_qth(qth);
        this.start = start;
        this.duration = duration;
        this.interval = interval || 500;
    }
}

export function is_expired(task: TaskData | PointingTask) {
    const stamp = Date.now();
    const end_time = task.start + task.duration;

    return stamp >= end_time;
}

export function is_active(task: TaskData | PointingTask) {
    const stamp = Date.now();
    const end_time = task.start + task.duration;

    return stamp >= task.start && stamp <= end_time;
}

export default TaskData;
