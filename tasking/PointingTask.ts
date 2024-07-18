import CalculatedPoints from './CalculatedPoints';
import TaskData from './TaskData';

class PointingTask extends TaskData {
    private calculated: CalculatedPoints;

    constructor(task: TaskData) {
        super(task.id, task.traveller, task.tle, task.qth, task.start, task.duration, task.interval);

        this.calculated = new CalculatedPoints(this.tle, this.qth, this.start, this.duration, this.interval);
    }

    update() {
        return this.calculated.mark();
    }
}

export default PointingTask;