class IndicatorControl {
    turn_on(value: number) {
        console.log(`indicator is ${value > 0 ? 'ON' : 'OFF'}`);
    }

    turn_off() {
        console.log('indicator is OFF');
    }
}

export default IndicatorControl;
