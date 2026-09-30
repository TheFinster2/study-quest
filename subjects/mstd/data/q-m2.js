/* ============================================================================
   q-m2.js — MS-M2 Working with Time (Year 11). 20 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'm2-001', mod: 'MS-M2', topic: '12 and 24-hour time', diff: 1,
    q: 'Write 7:45 pm in 24-hour time.',
    choices: ['1945', '0745', '1745', '2045'], a: 0,
    why: 'For pm times other than 12-something, add 12 hours: 7 + 12 = 19, giving 1945.' },

  { id: 'm2-002', mod: 'MS-M2', topic: '12 and 24-hour time', diff: 2,
    q: 'Write 12:20 am in 24-hour time.',
    choices: ['0020', '1220', '2420', '0120'], a: 0,
    why: 'Midnight is 0000, so 12:20 am is 0020. Only 12-something am maps back to hour 00 — this is the case people get wrong.' },

  { id: 'm2-003', mod: 'MS-M2', topic: '12 and 24-hour time', diff: 2,
    q: 'Write 12:20 pm in 24-hour time.',
    choices: ['1220', '0020', '2420', '2020'], a: 0,
    why: 'Noon is 1200, so 12:20 pm is 1220 — you do NOT add 12 to a 12-something pm time.' },

  { id: 'm2-004', mod: 'MS-M2', topic: '12 and 24-hour time', diff: 1,
    q: 'Write 2308 in 12-hour time.',
    choices: ['11:08 pm', '11:08 am', '1:08 am', '10:08 pm'], a: 0,
    why: '23 − 12 = 11, and the hour is past noon, so it is 11:08 pm.' },

  { id: 'm2-005', mod: 'MS-M2', topic: 'Elapsed time', diff: 1,
    q: 'A film starts at 6:40 pm and runs for 2 hours 35 minutes. When does it finish?',
    choices: ['9:15 pm', '8:15 pm', '9:75 pm', '8:75 pm'], a: 0,
    why: '6:40 + 2 h = 8:40, then + 35 min = 9:15 pm. Minutes carry at 60, so 8:75 is not a time.' },

  { id: 'm2-006', mod: 'MS-M2', topic: 'Elapsed time', diff: 2,
    q: 'A shift runs from 2245 to 0630 the next day. How long is it?',
    choices: ['7 hours 45 minutes', '16 hours 15 minutes', '8 hours 15 minutes', '7 hours 15 minutes'], a: 0,
    why: '2245 to 2400 is 1 h 15 min, then 0000 to 0630 is 6 h 30 min. Total 7 h 45 min. Across midnight, count up to 2400 first.' },

  { id: 'm2-007', mod: 'MS-M2', topic: 'Elapsed time', diff: 2,
    q: 'Write 3 hours 24 minutes as a decimal number of hours.',
    choices: ['3.4 h', '3.24 h', '3.42 h', '3.04 h'], a: 0,
    why: '24 min = \\frac{24}{60} = 0.4 h, so the total is 3.4 hours. Writing 3.24 treats minutes as hundredths.' },

  { id: 'm2-008', mod: 'MS-M2', topic: 'Elapsed time', diff: 2,
    q: 'A worker is paid $28.40 per hour and works 6 hours 45 minutes. What is the pay?',
    choices: ['$191.70', '$184.60', '$127.80', '$198.80'], a: 0,
    why: '6 h 45 min = 6.75 hours. Pay = 28.40 × 6.75 = $191.70. Using 6.45 hours gives $183.18.' },

  { id: 'm2-009', mod: 'MS-M2', topic: 'Time zones', diff: 2,
    stem: 'Sydney is UTC+10 and Perth is UTC+8.',
    q: 'When it is 3:30 pm in Sydney, what time is it in Perth?',
    choices: ['1:30 pm', '5:30 pm', '11:30 am', '3:30 pm'], a: 0,
    why: 'Perth is 2 hours behind Sydney (8 − 10 = −2), so subtract 2 hours: 1:30 pm.' },

  { id: 'm2-010', mod: 'MS-M2', topic: 'Time zones', diff: 2,
    stem: 'Sydney is UTC+10 and London is UTC+0.',
    q: 'When it is 8:00 am Tuesday in Sydney, what is the time and day in London?',
    choices: ['10:00 pm Monday', '6:00 pm Monday', '10:00 pm Tuesday', '6:00 pm Tuesday'], a: 0,
    why: 'London is 10 hours behind. 8:00 am Tuesday minus 10 hours crosses back past midnight to 10:00 pm Monday.' },

  { id: 'm2-011', mod: 'MS-M2', topic: 'Time zones', diff: 3,
    stem: 'Sydney is UTC+10 and New York is UTC−5.',
    q: 'What is the time difference between Sydney and New York?',
    choices: ['15 hours, Sydney ahead', '5 hours, Sydney ahead', '15 hours, New York ahead', '10 hours, Sydney ahead'], a: 0,
    why: 'Subtract the offsets: 10 − (−5) = 15 hours, and the larger positive offset is ahead, so Sydney leads by 15 hours.' },

  { id: 'm2-012', mod: 'MS-M2', topic: 'Time zones', diff: 3,
    stem: 'Adelaide is UTC+9:30 and Auckland is UTC+12.',
    q: 'When it is 11:15 am in Adelaide, what time is it in Auckland?',
    choices: ['1:45 pm', '8:45 am', '2:15 pm', '1:15 pm'], a: 0,
    why: 'Auckland is 2 hours 30 minutes ahead (12 − 9.5 = 2.5), so 11:15 am + 2 h 30 min = 1:45 pm.' },

  { id: 'm2-013', mod: 'MS-M2', topic: 'Time zones', diff: 3,
    q: 'A flight leaves Sydney (UTC+10) at 1000 and takes 9 hours to reach Singapore (UTC+8). What is the local arrival time?',
    choices: ['1700', '1900', '2100', '1500'], a: 0,
    why: 'Arrival in Sydney time is 1000 + 9 h = 1900. Singapore is 2 hours behind, so local time is 1700. Flight time is added first, THEN the zone shift.' },

  { id: 'm2-014', mod: 'MS-M2', topic: 'Timetables', diff: 2,
    stem: 'Bus timetable (departure times): Central 0742, Newtown 0756, Stanmore 0803, Ashfield 0819.',
    q: 'How long does the bus take from Central to Ashfield?',
    choices: ['37 minutes', '27 minutes', '77 minutes', '17 minutes'], a: 0,
    why: '0742 to 0819 is 18 minutes to 0800 plus 19 minutes, which is 37 minutes.' },

  { id: 'm2-015', mod: 'MS-M2', topic: 'Timetables', diff: 2,
    stem: 'Trains leave every 12 minutes from 0605.',
    q: 'What is the departure time of the fifth train of the day?',
    choices: ['0653', '0705', '0641', '0665'], a: 0,
    why: 'The fifth train is 4 intervals after the first: 0605 + 4 × 12 min = 0605 + 48 min = 0653.' },

  { id: 'm2-016', mod: 'MS-M2', topic: 'Timetables', diff: 3,
    stem: 'A train leaves at 0917 and arrives at 1107. The distance is 165 km.',
    q: 'What is the average speed?',
    choices: ['90 km/h', '82.5 km/h', '96.4 km/h', '110 km/h'], a: 0,
    why: 'The journey takes 1 h 50 min = 1.8333 h, since 50 min = \\frac{50}{60} h. Speed = \\frac{165}{1.8333} = 90 km/h. Using 1.5 h — reading 1 h 50 min as 1.50 — gives 110 km/h, which is the trap.' },

  { id: 'm2-017', mod: 'MS-M2', topic: 'Elapsed time', diff: 2,
    q: 'How many minutes are there in 3.25 hours?',
    choices: ['195 minutes', '325 minutes', '185 minutes', '205 minutes'], a: 0,
    why: '3.25 × 60 = 195 minutes, which is 3 hours 15 minutes.' },

  { id: 'm2-018', mod: 'MS-M2', topic: '12 and 24-hour time', diff: 1,
    q: 'Which of these is a valid 24-hour time?',
    choices: ['0059', '2475', '1360', '2400 pm'], a: 0,
    why: 'Hours run 00–23 and minutes 00–59, so 0059 is valid. 2475 and 1360 exceed those limits, and am/pm is never used with 24-hour notation.' },

  { id: 'm2-019', mod: 'MS-M2', topic: 'Time zones', diff: 2,
    q: 'Travelling west across the International Date Line, what happens to the date?',
    choices: ['You add a day', 'You subtract a day', 'The date does not change', 'You add two days'], a: 0,
    why: 'Crossing the Date Line travelling west adds a day; travelling east subtracts one.' },

  { id: 'm2-020', mod: 'MS-M2', topic: 'Elapsed time', diff: 3,
    stem: 'A carer works 0730 to 1545 with a 45-minute unpaid break.',
    q: 'How many paid hours does the shift contain?',
    choices: ['7.5 hours', '8.25 hours', '7.25 hours', '8.75 hours'], a: 0,
    why: '0730 to 1545 is 8 h 15 min = 8.25 h. Less the 0.75 h unpaid break gives 7.5 paid hours.' }
]);
