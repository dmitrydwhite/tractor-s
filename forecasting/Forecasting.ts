import https from 'https';
import jspredict from 'jspredict';
import { TLE } from '../datastore/StoredDataType';
import PointingTask from '../tasking/PointingTask';
import { QTH } from '../types/types';
import validate_tle from '../utils/validate-tle';
import TaskData from '../tasking/TaskData';

const API_KEY = '2HKN5G-K23GSP-ATZ47K-4BUP';

interface TaskResult {
    all_tasks: TaskData[];
}

export interface MultiTasksResult extends TaskResult {
    [norad_id: string]: TaskData[];
}

class Forecasting {
    private get_one_tle(norad_id: string): Promise<TLE> {
        return new Promise((resolve, reject) => {
            const target_url = `https://api.n2yo.com/rest/v1/satellite/tle/${norad_id}&apiKey=${API_KEY}`;

            https.get(
                target_url,
                { headers: { 'Accept': 'application/json' } },
                res => {
                    const { statusCode, statusMessage } = res;

                    if (statusCode >= 400) {
                        return reject(new Error(`n2yo: Error ${statusCode}: ${statusMessage}`));
                    }

                    let received = '';

                    res.setEncoding('utf8');
                    
                    res.on('data', chunk => received += chunk);
                    res.on('end', () => {
                        try {
                            const { info, tle } = JSON.parse(received);

                            resolve({ tle: validate_tle(tle), norad_id: `${info.satid}`, retrieved_at: Date.now() });
                        } catch (err) {
                            console.error('JSON Error: ' + received);
                            return reject(err);
                        }
                    })
                }
            ).on('error', err => { return reject(err); })
        });
    }

    async get_tle(norad_id: string) {
        return this.get_one_tle(norad_id);
    }

    get_tles(travellers: { norad_id: string }[]): Promise<TLE[]> {
        return new Promise((resolve, reject) => {
            if (!travellers.length) {
                return resolve([]);
            }

            Promise.all(travellers.map(({ norad_id }) => this.get_one_tle(norad_id)))
                .then(tles => resolve(tles))
                .catch(err => reject(err));
        });
    }

    get_task_list(qth: QTH, travellers: TLE[], task_count?: number): MultiTasksResult {
        const result: MultiTasksResult = { all_tasks: [] };
        const now = Date.now();
        const two_days = now + (2 * 24 * 60 * 60 * 1000);

        travellers.forEach(t => {
            const jsp_results = jspredict.transits(t.tle, qth, now, two_days, null, task_count || 5) as { start: number, duration: number }[];
            const traveller_tasks = jsp_results.map(jspr => {
                return new TaskData(
                    `${t.norad_id}_${jspr.start}`, t.norad_id, t.tle, qth, jspr.start, jspr.duration
                );
            });

            result.all_tasks = result.all_tasks.concat(traveller_tasks);
            result[t.norad_id] = traveller_tasks;
        });

        return result;
    }
}

export default Forecasting;
