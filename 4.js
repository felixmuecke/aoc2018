const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
  input: fs.createReadStream('./4a_data.txt'),
  crlfDelay: Infinity
})

let events = []

rl.on('line', (line) => {
  // console.log(line);
  let dateString = line.slice(1, 17)
  // change year so unix times don't act strange
  dateString = dateString.replace('1518', '2000')
  const minute = Number.parseInt(dateString.slice(-2))
  const timestamp = new Date(dateString).getTime()
  const action = line.substring(19)
  events.push({
    dateString,
    timestamp,
    minute,
    action
  })
})

// Plan: generate sleeping pattern array (index 0 to 59) for each guard


let guards = {}
let guardId = null
let sleepMinute = null

rl.on("close", () => {
  events.sort((a,b) => a.timestamp - b.timestamp)
  events.forEach(event => {
    if (event.action.charAt(0) === 'G') {
      guardId = event.action.slice(event.action.indexOf('#') + 1, event.action.indexOf(' b'))
      if (!guards[guardId]) {
        guards[guardId] = {
          guardId,
          sleepingPattern: new Array(60).fill(0)
        }
      }
    } else if (event.action.charAt(0) === 'f') {
      sleepMinute = event.minute
    } else {
      for (let i = sleepMinute; i < event.minute; i++) {
        guards[guardId].sleepingPattern[i]++
      }
      // if (guardId === '149') {
      // //   console.log(event.minute, event.action, 'after falling asleep in minute ', sleepMinute,  guards[guardId])
      // }
    }
    // if (guardId === '149') {
      // console.log(event.minute, event.action)
    // }
  })

  // console.log(guards['149'])

  // Sleepinh patterns are calucalted now, calc and sort by sum of sleeping minutes
  guards = Object.values(guards)
  guards.sort((a, b) => {
    const sumA = a.sleepingPattern.reduce ((a,b) => a+b)
    const sumB = b.sleepingPattern.reduce ((a,b) => a+b)
    return sumA - sumB
  })
  const sleepyGuard = guards[guards.length - 1]
  let likelyMinute = sleepyGuard.sleepingPattern.indexOf(sleepyGuard.sleepingPattern.reduce((a,b) => a >= b ? a : b))
  console.log('Answer to a: ', sleepyGuard.guardId * likelyMinute)

  guards.sort((a, b) => {
    const maxA = a.sleepingPattern.reduce ((a,b) => a >= b ? a : b)
    const maxB = b.sleepingPattern.reduce ((a,b) => a >= b ? a : b)
    return maxA - maxB
  })
  const predictableGuard = guards[guards.length - 1]
  likelyMinute = predictableGuard.sleepingPattern.indexOf(predictableGuard.sleepingPattern.reduce((a,b) => a >= b ? a : b))
  console.log('Answer to b: ', predictableGuard.guardId * likelyMinute)
})

