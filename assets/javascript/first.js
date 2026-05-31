// My first JavaScript milestone: the cuttlefish riddle — 11:13PM, 5/30/2026
let riddle = "I change colors and I hover like a UFO. I also have a skirt that lets me swim and various tentacles on my face. What am I?"
let answer = "cuttlefish"

console.log(riddle)
const input = prompt("Answer: ");
if (input.toLowerCase().includes(answer.toLowerCase())) { // what the fuck
    console.log("You are correct!")
} else {
    console.log("You are incorrect!");
}
// JS sorcery
