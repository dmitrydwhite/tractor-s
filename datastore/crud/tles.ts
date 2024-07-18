import fs from 'fs';
import { DS_FILE } from './const';
import { StoredDataType, TLE } from '../StoredDataType';

const TLE_LIFE = 2 * 24 * 60 * 60 * 1000; // 2 days

export function get_expired_tles(): Promise<TLE[]> {
    return new Promise((resolve, reject) => {
        fs.readFile(DS_FILE, (err, buf) => {
            if (err) {
                return reject(err);
            }

            const age_cutoff = Date.now() - TLE_LIFE;
            const data_obj = JSON.parse(buf.toString());
            const { tles } = data_obj as StoredDataType;

            const expired_tles = tles.filter(tle_d => {
                return tle_d.retrieved_at < age_cutoff;
            });

            resolve(expired_tles);
        });
    })
}

export function update_tles(update: TLE[]): Promise<TLE[]> {
    return new Promise((resolve, reject) => {
        const update_map = new Map(update.map(update_obj => [update_obj.norad_id, update_obj]));
        const buf = fs.readFileSync(DS_FILE);
        
        try {
            const data_obj: StoredDataType = JSON.parse(buf.toString());
            const { tles } = data_obj;

            const next_tles = tles.map(tle => {
                const updated = update_map.get(tle.norad_id);

                if (updated) {
                    update_map.delete(tle.norad_id);

                    return updated;
                }

                return tle;
            });

            if (update_map.size) {
                next_tles.concat([...update_map.values()]);
            }

            data_obj.tles = next_tles;

            fs.writeFileSync(DS_FILE, JSON.stringify(data_obj, null, 4));

            resolve(next_tles);
        } catch (err) {
            return reject(err);
        }
    });
}