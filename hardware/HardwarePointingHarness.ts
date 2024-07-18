import TiltControl from './TiltControl';
import PanControl from './PanControl';
import IndicatorControl from './IndicatorControl';

export interface HardwarePointingInput {
    indicator: number;
    tilt_pin: number;
    pan_pin: number;
}

class HardwarePointingHarness {
    static RESTING_AZ = 270;
    static RESTING_EL = 15;
    static LED_ON = 255;
    static LED_OFF = 0;

    private indicator: IndicatorControl;
    private tilt_ctl: TiltControl;
    private pan_ctl: PanControl;

    azimuth: number;
    elevation: number;
    active: boolean;

    constructor({ indicator, tilt_pin, pan_pin }: HardwarePointingInput) {
        this.indicator = new IndicatorControl();
        this.tilt_ctl = new TiltControl(tilt_pin);
        this.pan_ctl = new PanControl(pan_pin);
    }

    private set_inactive() {
        this.active = false;
        this.azimuth = HardwarePointingHarness.RESTING_AZ;
        this.elevation = HardwarePointingHarness.RESTING_EL;

        this.update_hardware();
    }

    private update_hardware() {
        // Here is where we'll write to the GPIO for pointing and illuminating the indicator LED.
        this.indicator.turn_on(this.active ? 1 : 0);
        this.tilt_ctl.move(this.elevation);
        this.pan_ctl.move(this.azimuth);
    }

    assign(next_data: { azimuth: number, elevation: number } | null) {
        if (!next_data) {
            this.set_inactive();

            return;
        }

        const azimuth = Math.round(next_data.azimuth);
        const elevation = Math.round(next_data.elevation);

        this.active = true;

        if (azimuth !== this.azimuth || elevation !== this.elevation) {
            this.azimuth = azimuth;
            this.elevation = elevation;

            this.update_hardware();
        }
    }
}

export default HardwarePointingHarness;
