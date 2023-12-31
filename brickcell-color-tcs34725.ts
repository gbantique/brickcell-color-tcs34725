//% color="#FFBF00" icon="\uf12e" weight=70
namespace Brickcell {
    class tcs3472 {
        is_setup: boolean
        addr: number
        leds: DigitalPin

        constructor(addr: number) {
            this.is_setup = false
            this.addr = addr
        }

        setup(): void {
            if (this.is_setup) return
            this.is_setup = true
            smbus.writeByte(this.addr, 0x80, 0x03)
            smbus.writeByte(this.addr, 0x81, 0x2b)
        }

        setIntegrationTime(time: number): void {
            this.setup()
            time = Math.clamp(0, 255, time * 10 / 24)
            smbus.writeByte(this.addr, 0x81, 255 - time)
        }

        light(): number {
            return this.raw()[0]
        }

        rgb(): number[] {
            let result: number[] = this.raw()
            let clear: number = result.shift()
            for (let x: number = 0; x < result.length; x++) {
                result[x] = result[x] * 255 / clear
            }
            return result
        }

        raw(): number[] {
            this.setup()
            let result: Buffer = smbus.readBuffer(this.addr, 0xb4, pins.sizeOf(NumberFormat.UInt16LE) * 4)
            return smbus.unpack("HHHH", result)
        }
    }

    let _tcs3472: tcs3472 = new tcs3472(0x29)

    /**
     * Get the light level
     */
    //% blockId=brickcell_color_tcs34725_get_light
    //% block="Get light"
    //% subcategory="color tcs34725"
    export function getLight(): number {
        return Math.round(_tcs3472.light())
    }

    /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=brickcell_color_tcs34725__get_red
    //% block="Get red"
    //% subcategory="color tcs34725"
    export function getRed(): number {
        return Math.round(_tcs3472.rgb()[0])
    }

    /**
     * Get the amount of green the colour sensor sees
     */
    //% blockId=brickcell_color_tcs34725_get_green
    //% block="Get green"
    //% subcategory="color tcs34725"
    export function getGreen(): number {
        return Math.round(_tcs3472.rgb()[1])
    }

    /**
     * Get the amount of blue the colour sensor sees
     */
    //% blockId=brickcell_color_tcs34725_get_blue
    //% block="Get blue"
    //% subcategory="color tcs34725"
    export function getBlue(): number {
        return Math.round(_tcs3472.rgb()[2])
    }

    /**
     * Set the integration time of the colour sensor in ms
     */
    //% blockId=brickcell_color_tcs34725_set_integration_time
    //% block="Set colour integration time %time ms"
    //% time.min=0 time.max=612 value.defl=500
    //% subcategory="color tcs34725"
    export function setColourIntegrationTime(time: number): void {
        return _tcs3472.setIntegrationTime(time)
    }
}

namespace smbus {
    export function writeByte(addr: number, register: number, value: number): void {
        let temp = pins.createBuffer(2);
        temp[0] = register;
        temp[1] = value;
        pins.i2cWriteBuffer(addr, temp, false);
    }
    export function writeBuffer(addr: number, register: number, value: Buffer): void {
        let temp = pins.createBuffer(value.length + 1);
        temp[0] = register;
        for (let x = 0; x < value.length; x++) {
            temp[x + 1] = value[x];
        }
        pins.i2cWriteBuffer(addr, temp, false);
    }
    export function readBuffer(addr: number, register: number, len: number): Buffer {
        let temp = pins.createBuffer(1);
        temp[0] = register;
        pins.i2cWriteBuffer(addr, temp, false);
        return pins.i2cReadBuffer(addr, len, false);
    }
    function readNumber(addr: number, register: number, fmt: NumberFormat = NumberFormat.UInt8LE): number {
        let temp = pins.createBuffer(1);
        temp[0] = register;
        pins.i2cWriteBuffer(addr, temp, false);
        return pins.i2cReadNumber(addr, fmt, false);
    }
    export function unpack(fmt: string, buf: Buffer): number[] {
        let le: boolean = true;
        let offset: number = 0;
        let result: number[] = [];
        let num_format: NumberFormat = 0;
        for (let c = 0; c < fmt.length; c++) {
            switch (fmt.charAt(c)) {
                case '<':
                    le = true;
                    continue;
                case '>':
                    le = false;
                    continue;
                case 'c':
                case 'B':
                    num_format = le ? NumberFormat.UInt8LE : NumberFormat.UInt8BE; break;
                case 'b':
                    num_format = le ? NumberFormat.Int8LE : NumberFormat.Int8BE; break;
                case 'H':
                    num_format = le ? NumberFormat.UInt16LE : NumberFormat.UInt16BE; break;
                case 'h':
                    num_format = le ? NumberFormat.Int16LE : NumberFormat.Int16BE; break;
            }
            result.push(buf.getNumber(num_format, offset));
            offset += pins.sizeOf(num_format);
        }
        return result;
    }
}

// Code copied from: https://github.com/pimoroni/pxt-envirobit/