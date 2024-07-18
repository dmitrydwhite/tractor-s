export default function validate_tle(tle: string) {
    const split_tle = tle.split('\n');

    if (split_tle.length === 3) {
        return tle;
    }

    if (split_tle.length === 2) {
        return `\n${tle}`;
    }

    throw new Error(`Received TLE in unexpected format; expected 2-3 lines delimited by \\n`);
}
