// import { Gpio } from 'pigpio';

class TiltControl {
    static ANGLE_VAL = 5 + (5/9);

    // private pin: Gpio;
    private last_pw: number | null;

    constructor(data_pin: number) {
        this.last_pw = null;
        // this.pin = new Gpio(data_pin, { mode: Gpio.OUTPUT });
    }

    private angle_is_valid(angle: number) {
        return angle >= -5 && angle <= 90;
    }

    private calculate_pw_for_angle(angle: number) {
        return Math.round(1500 + (angle * TiltControl.ANGLE_VAL));
    }

    move(angle: number) {
        if (this.angle_is_valid(angle)) {
            const next_pw = this.calculate_pw_for_angle(angle);

            if (next_pw !== this.last_pw) {
                console.info(`Tilt adjust:\tTLT PW: ${next_pw}\tTLT ANG: ${angle}`);
                // this.pin.servoWrite(next_pw);
                this.last_pw = next_pw;
            }
        } else {
            console.error(`Invalid angle for tilt control: ${angle}`);
        }
    }
}

export default TiltControl;
