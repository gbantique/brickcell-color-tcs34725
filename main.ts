input.onButtonPressed(Button.A, function () {
    POLL = false
    basic.showIcon(IconNames.No)
    Red = -1
    Green = -1
    Blue = -1
})
input.onButtonPressed(Button.B, function () {
    POLL = true
    basic.showIcon(IconNames.Yes)
})
let Blue = 0
let Green = 0
let Red = 0
let POLL = false
POLL = false
Red = -1
Green = -1
Blue = -1
basic.forever(function () {
    while (POLL) {
        basic.showIcon(IconNames.Heart)
        Red = envirobit.getRed()
        Green = envirobit.getGreen()
        Blue = envirobit.getBlue()
        serial.writeLine("Red: " + Red)
        serial.writeLine("Blue: " + Blue)
        serial.writeLine("Green: " + Green)
        Red = 0
        Green = 0
        Blue = 0
        basic.pause(1000)
    }
})
