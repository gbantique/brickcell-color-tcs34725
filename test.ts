basic.forever(function () {
    serial.writeLine("R: " + Brickcell.getRed())
    serial.writeLine("G: " + Brickcell.getGreen())
    serial.writeLine("B: " + Brickcell.getBlue())
    serial.writeLine("")
    basic.pause(1000)
})
