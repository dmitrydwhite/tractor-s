import fs from 'fs';
import { MultiTasksResult } from '../../forecasting/Forecasting';
import { DS_FILE } from './const';
import { StoredDataType } from '../StoredDataType';
import PointingTask from '../../tasking/PointingTask';
import TaskData, { is_expired } from '../../tasking/TaskData';

export async function update_replace_new_tasks(replacement_tasks: MultiTasksResult) {
    const buf = fs.readFileSync(DS_FILE);
    const data_obj: StoredDataType = JSON.parse(buf.toString());
    const { tasks } = data_obj;

    const cleaned_tasks = tasks.filter(t => {
        return !replacement_tasks[t.traveller];
    });

    const new_tasks = cleaned_tasks.concat(replacement_tasks.all_tasks).sort((a, b) => a.start - b.start);

    fs.writeFileSync(DS_FILE, JSON.stringify({ ...data_obj, tasks: new_tasks }, null, 4));
}

export async function get_next_task(): Promise<TaskData | null> {
    const buf = fs.readFileSync(DS_FILE);
    const data_obj: StoredDataType = JSON.parse(buf.toString());

    const { tasks } = data_obj;
    let result = tasks.shift();
    
    while (result && is_expired(result)) {
        result = tasks.shift();
    }

    fs.writeFileSync(DS_FILE, JSON.stringify({ ...data_obj, tasks }, null, 4));

    return result || null;
}