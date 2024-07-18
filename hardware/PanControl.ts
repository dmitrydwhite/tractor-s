// import { Gpio } from 'pigpio';

class PanControl {
    static ANGLE_VAL = 2.776;

    private last_pw: number;
    // private pin: Gpio;

    constructor(data_pin: number) {
        this.last_pw = null;
        // this.pin = new Gpio(data_pin, {mode: Gpio.OUTPUT });
    }

    private angle_is_valid(angle: number) {
        return angle >= 0 && angle < 360;
    }

    private calculate_pw_for_angle(angle: number) {
        return Math.round(1000 + (angle * PanControl.ANGLE_VAL));
    }

    move(angle: number) {
        if (this.angle_is_valid(angle)) {
            const next_pw = this.calculate_pw_for_angle(angle);

            if (next_pw !== this.last_pw) {
                console.info(`Pan adjust:\tPAN PW: ${next_pw}\tPAN ANG: ${angle}`);
            }
        } else {
            console.error(`Invalid angle for pan control: ${angle}`);
        }
    }
}

export default PanControl;
