import { QTH } from '../types/types';

export default function validate_qth(qth: QTH) {
    const [lat, long, elev] = qth;

    if (lat > 90 || lat < -90) {
        throw new Error(`Received QTH in unexpected format: expected latitude between -90 and 90 but got ${lat}`);
    }

    if (long > 180 || long < -180) {
        throw new Error(`Received QTH in unexpected format: expected longitude between -180 and 180 but got ${long}`);
    }

    return qth;
}
