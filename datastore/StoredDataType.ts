import PointingTask from '../tasking/PointingTask';
import TaskData from '../tasking/TaskData';

export interface TLE {
    norad_id: string;
    tle: string;
    retrieved_at: number;
}

export interface StoredPointingTask {
    
}

export interface StoredDataType {
    tles: TLE[];
    tasks: TaskData[];
}