#!/usr/bin/env python3
"""
Generate clock-calendar.json: reading sections, formulas, practice problems,
150 MCQs with step-by-step explanations. Content validated against
geeksforgeeks.org, byjus.com and pw.live.
"""
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cc_mcqs import MCQS

topic = {
    "id": "clock-calendar",
    "title": "Clock & Calendar",
    "icon": "🕐",
    "subtitle": "Angles between Hands, Mirror & Slow/Fast Clocks, Leap Years, Odd Days & Day of Week",
    "category": "reasoning",
    "days": "2-3",
    "color": "#0D9488",
    "subtopics": [
        "Clock Basics (Hand Speeds & Angles)",
        "Angle Between the Hands",
        "Coincidence, Opposite & Right-Angle Positions",
        "Mirror Image of a Clock",
        "Fast & Slow Clocks (Gain/Loss)",
        "Leap Year Rules & Odd Days",
        "Odd Days in Years & Centuries",
        "Day of the Week Calculation",
        "Calendar Repetition (6/11/28 Years)",
        "Month Codes & Date Tricks"
    ],
    "estimatedHours": 20,
    "companyPatterns": {
        "TCS NQT": {
            "frequency": "2-3 questions",
            "style": "Angle between hands, mirror image, day of week after n days",
            "timePerQuestion": "45-60 seconds"
        },
        "Infosys": {
            "frequency": "2-3 questions",
            "style": "Odd days and century cycle questions, calendar repetition",
            "timePerQuestion": "60-75 seconds"
        },
        "Wipro": {
            "frequency": "1-2 questions",
            "style": "Leap year rules and basic odd-day counts",
            "timePerQuestion": "30-45 seconds"
        },
        "Accenture": {
            "frequency": "2-3 questions",
            "style": "Fast/slow clock gain-loss and coincidence times",
            "timePerQuestion": "60-75 seconds"
        }
    },
    "readingSections": [
        {
            "id": "clock-basics",
            "title": "How a Clock Moves: Hand Speeds",
            "content": "A clock face is a full circle of 360 degrees divided into 12 hours. Every problem about the clock is just about two hands moving at steady speeds and the angle between them. If you memorise the three speeds below, every other formula in this topic follows from them.",
            "subsections": [
                {
                    "title": "The Three Speeds to Memorise",
                    "content": "Minute hand: 360 degrees in 60 minutes = 6 degrees per minute. Hour hand: 360 degrees in 12 hours = 30 degrees per hour = 0.5 degrees per minute. Relative speed of minute hand over hour hand = 6 - 0.5 = 5.5 degrees per minute."
                },
                {
                    "title": "1 Hour-Marker = 30 Degrees",
                    "content": "There are 12 markers around the circle, so each hour-marker is 360/12 = 30 degrees apart. At 3:00 the hands are 3 markers apart, so the angle is 3 x 30 = 90 degrees. Exact hour times never need the formula."
                }
            ],
            "type": "concept"
        },
        {
            "id": "angle-between-hands",
            "title": "The Angle Formula",
            "content": "For ANY time, the angle between the hands is given by |30H - 5.5M|, where H is the hour and M is the minutes. This single formula solves every 'find the angle' question. If the result is greater than 180, subtract it from 360 to get the smaller angle.",
            "subsections": [
                {
                    "title": "Where the Formula Comes From",
                    "content": "At H o'clock the hour hand has moved 30H degrees. In M extra minutes it adds 0.5M more, so its position is 30H + 0.5M. The minute hand is at 6M degrees. Difference = 30H + 0.5M - 6M = 30H - 5.5M. Take absolute value."
                },
                {
                    "title": "When to Take 360 - Angle",
                    "content": "At times like 1:45 the formula gives 187.5 degrees, which is larger than 180. A clock can never show an angle bigger than 180, so the actual angle is 360 - 187.5 = 172.5 degrees."
                }
            ],
            "type": "concept"
        },
        {
            "id": "coincide-opposite",
            "title": "Coinciding & Opposite Hands",
            "content": "The hands overlap 11 times in 12 hours, not 12. That is because the hour hand also moves. The minute hand needs 65 5/11 minutes to lap the hour hand. These follow questions are answered with the 12/11 trick.",
            "subsections": [
                {
                    "title": "The 12/11 Trick",
                    "content": "To find when hands coincide between H and H+1: the minute hand starts 5H minute-spaces behind. Time to gain = 5H x (12/11) minutes. For 3 to 4: 15 x 12/11 = 180/11 = 16 4/11 min, so 3:16 4/11."
                },
                {
                    "title": "Opposite & Right-Angle Positions",
                    "content": "Opposite hands are 30 minute-spaces apart; right-angle hands are 15 spaces apart. Adjust the starting gap to the target gap, then apply x 12/11. Example between 4-5 opposite: gap must go from 20 to 30 ahead, gain 20 + 30 = 50 spaces."
                }
            ],
            "type": "concept"
        },
        {
            "id": "mirror-image",
            "title": "Mirror Image of a Clock",
            "content": "In a mirror, the clock's reflection swaps left and right. The reflected time is simply 11:60 - the given time. For example, the mirror image of 4:46 is 11:60 - 4:46 = 7:14. Answering is subtraction, no geometry needed.",
            "subsections": [
                {
                    "title": "The Formula 11:60 - Given Time",
                    "content": "Treat the given time as minutes and hours, then subtract from 11 hours 60 minutes (which equals 12:00). 11:60 - 3:25 = 8:35. For 0:45 results, write the answer as 12:45."
                },
                {
                    "title": "Alternate Method: 12:00 - Time",
                    "content": "Instead of 11:60, write 12:00 as 11 hr 60 min, then subtract normally. A mirror of 10:10 = 11:60 - 10:10 = 1:50. Double check by mental addition: 10:10 + 1:50 = 12:00, a full circle."
                }
            ],
            "type": "concept"
        },
        {
            "id": "fast-slow-clocks",
            "title": "Fast & Slow Clocks",
            "content": "Some clocks are not accurate: they gain or lose a fixed amount each hour or each day. The question gives the gain rate and a set-right time, and asks what the clock will show at another correct time. This is just a proportional multiplication.",
            "subsections": [
                {
                    "title": "The One-Line Method",
                    "content": "Gain (minutes) = rate per hour x hours elapsed. If a clock gains 5 min per hour and runs from 8 AM to noon (4 hours), it gains 4 x 5 = 20 minutes and shows 12:20. If it LOSES, subtract instead of add."
                },
                {
                    "title": "Finding the Rate",
                    "content": "If a clock is set right at 8 AM and shows 12:16 at 12 noon, it gained 16 minutes in 4 hours, so the rate is 16/4 = 4 min per hour. Always divide the total drift by the elapsed hours."
                }
            ],
            "type": "concept"
        },
        {
            "id": "calendar-leap",
            "title": "Leap Year Rules",
            "content": "The Gregorian calendar has two types of years. An ordinary year has 365 days and its February has 28 days. A leap year has 366 days and February has 29 days. Cannot every 4th year be leap: century years (ending in 00) have a stricter test.",
            "subsections": [
                {
                    "title": "The Divisibility Rule",
                    "content": "A year is leap if divisible by 4. EXCEPT: a century year (like 1900, 2100) is leap only if also divisible by 400. So 2000 is leap (divisible by 400) but 1900 and 2100 are ordinary years."
                },
                {
                    "title": "Counting Leap Years",
                    "content": "In a 100-year span (a century) there are 24 leap years, not 25, because one century year is excluded (e.g., 1900 in 18xx-19xx). From 2001 to 2025, the leap years are 2004, 2008, 2012, 2016, 2020 and 2024: six in total."
                }
            ],
            "type": "concept"
        },
        {
            "id": "odd-days",
            "title": "Odd Days: The Counting Unit",
            "content": "502 week the counting tool for calendars is the odd day. Divide any number of days by 7; the remainder is the odd-day count. An ordinary year of 365 days has 365 - 364 = 1 odd day. A leap year of 366 days has 2 odd days.",
            "subsections": [
                {
                    "title": "The Anchor Table",
                    "content": "100 years = 5 odd days; 200 years = 3; 300 years = 1; 400 years = 0. Verify: 100 years has 76 ordinary (76 odd) and 24 leap (48 odd) = 124 = 17 weeks and 5 days."
                },
                {
                    "title": "Adding Odd Days for the Weekday",
                    "content": "If 1 January is a Sunday, the same date 1 year later (ordinary year) has 1 odd day, so it is Monday. Adding 2 odd days moves the weekday forward by 2, adding 5 moves it forward by 5 (wrapping around the 7-day cycle)."
                }
            ],
            "type": "concept"
        },
        {
            "id": "day-of-week",
            "title": "Day of the Week for Any Date",
            "content": "To find the weekday of a given date, add (year last two digits) + (year quarter) + (month code) + (century code) + (day of month), divide by 7, and read the remainder using the day codes table.",
            "subsections": [
                {
                    "title": "The Codes to Memorise",
                    "content": "Day codes: Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6. Month codes (ordinary): Jan 0, Feb 3, Mar 3, Apr 6, May 1, Jun 4, Jul 6, Aug 2, Sep 5, Oct 0, Nov 3, Dec 5. Century codes: 1600s = 6, 1700s = 4, 1800s = 2, 1900s = 0, 2000s = 6."
                },
                {
                    "title": "Worked Example: 25 May 2003",
                    "content": "Year digits 03 = 3; 03/4 = 0 (quotient); month code May = 1; century code = 6; day = 25. Sum = 3 + 0 + 1 + 6 + 25 = 35. 35 / 7 = 5 weeks, remainder 0, code 0 = Sunday."
                }
            ],
            "type": "guided"
        },
        {
            "id": "calendar-repetition",
            "title": "When Does a Calendar Repeat?",
            "content": "Two years have identical calendars (every date falls on the same weekday, and February matches) when the odd days between their January 1st dates total a multiple of 7, and both years are of the same leap/ordinary type.",
            "subsections": [
                {
                    "title": "The 6/11/28 Rule",
                    "content": "An ordinary year repeats after 6 or 11 years (whichever first gives 0 odd days). A leap year repeats after 28 years. Check 2009+6 = 2015 has 2012 leap, giving 1x2 + 5 = 7 odd days, so 2015 repeats 2009."
                },
                {
                    "title": "Quick Exam Shortcut",
                    "content": "For leap years always add 28. For ordinary years, try +6 first, and if the total is not a multiple of 7, use +11. Repeating calendars keep their type the same: an ordinary year's calendar only repeats onto an ordinary year."
                }
            ],
            "type": "guided"
        },
        {
            "id": "month-day-count",
            "title": "Days in Months Trick",
            "content": "Fast counting of days between dates and month grouping is a giant time-saver in calendar MCQs. Knowing the exact day count of each month and the identical-start months lets you move between month-boundaries in seconds.",
            "subsections": [
                {
                    "title": "Days in Each Month (knuckle trick)",
                    "content": "Memorise with knuckles: Jan 31, Feb 28/29, Mar 31, Apr 30, May 31, Jun 30, Jul 31, Aug 31, Sep 30, Oct 31, Nov 30, Dec 31. Month boundaries: the day added equals the number of days in the starting month (mod 7)."
                },
                {
                    "title": "Months That Start Alike",
                    "content": "In an ordinary year April and July start on the same weekday, and September and December too. In a leap year, January, April and July start alike; March and November also start alike. Use these to check day-of-week answers quickly."
                }
            ],
            "type": "guided"
        }
    ],
    "formulas": [
        {
            "id": "clock-angle-formula",
            "title": "Angle Between the Hands",
            "formula": {
                "latex": "\\text{Angle} = |30H - 5.5M|",
                "text": "Angle between hour and minute hand at time H hours and M minutes."
            },
            "whenToUse": "Any question asking for the angle at a time that is not an exact hour.",
            "explanation": [
                "Hour hand moves 0.5 degrees per minute.",
                "Minute hand moves 6 degrees per minute.",
                "Their difference is |30H - 5.5M|.",
                "If the result is above 180, subtract it from 360 for the smaller angle."
            ],
            "example": {
                "prompt": "Find the angle between the hands at 4:20.",
                "steps": [
                    "Angle = |30 x 4 - 5.5 x 20|.",
                    "30 x 4 = 120 and 5.5 x 20 = 110.",
                    "|120 - 110| = 10 degrees."
                ],
                "answer": "10 degrees."
            },
            "memoryTip": "30 H minus 5.5 M, always take the positive value.",
            "commonMistake": "Forgetting to subtract the smaller angle from 360 when the formula gives more than 180."
        },
        {
            "id": "hands-coincide-formula",
            "title": "Coinciding / Opposite / Right-Angle Times",
            "formula": {
                "latex": "\\text{time} = 5H \\times \\frac{12}{11} \\text{ min}",
                "text": "Time (minutes) after H o'clock for the hands to meet."
            },
            "whenToUse": "Between questions of the form 'between H and H+1, at what time do the hands coincide / are opposite / at right angles'.",
            "explanation": [
                "At H o'clock the minute hand is 5H minute-spaces behind.",
                "The minute hand gains 5.5 minute-spaces per minute on the hour hand.",
                "Time to close the gap = gap x (60/55) = gap x (12/11).",
                "For opposite: gap must become 30 spaces. For right angle: gap must become 15 spaces."
            ],
            "example": {
                "prompt": "At what time between 3 and 4 will the hands coincide?",
                "steps": [
                    "Gap at 3:00 is 15 minute-spaces.",
                    "Time = 15 x 12/11 = 180/11 = 16 4/11 minutes.",
                    "So 3:16 4/11."
                ],
                "answer": "3:16 4/11."
            },
            "memoryTip": "Multiply the gap by 12/11: it converts minute-spaces into real minutes.",
            "commonMistake": "For opposite hands, adding 30 spaces to the gap instead of reading the gap correctly when the minute hand starts behind."
        },
        {
            "id": "mirror-image-formula",
            "title": "Mirror Image of a Clock",
            "formula": {
                "latex": "\\text{mirror} = 11:60 - \\text{given time}",
                "text": "Subtract the given time from 11 hours 60 minutes."
            },
            "whenToUse": "Any mirror image of clock question in which a time is given on the dial.",
            "explanation": [
                "A mirror reflects left and right across the vertical axis.",
                "The mirror time always sums with the given time to 12 hours.",
                "So reflected time = 12:00 - given time = 11:60 - given time.",
                "For lt between 1 to 11 o'clock use 11:60 minus; for 12 write the answer as 12:xx."
            ],
            "example": {
                "prompt": "Clock shows 4:46. What is its mirror image?",
                "steps": [
                    "Mirror = 11:60 - 4:46.",
                    "Subtract minutes: 60 - 46 = 14, borrow 1 hour: 60 - 46 = 14 with hours 11 - 4 - 1 = 7.",
                    "Result 7:14."
                ],
                "answer": "7:14."
            },
            "memoryTip": "Mirror + original always = 12:00.",
            "commonMistake": "Subtracting the minutes without borrowing the hour, giving something like 7:16."
        },
        {
            "id": "fast-slow-formula",
            "title": "Settings of a Fast / Slow Clock",
            "formula": {
                "latex": "\\text{shown} = \\text{correct} \\pm (\\text{rate} \\times \\text{elapsed hours})",
                "text": "Add gain minutes, subtract loss minutes."
            },
            "whenToUse": "When the clock gains or loses a fixed amount per hour and you know its start time.",
            "explanation": [
                "Compute the elapsed hours from the time it was set right.",
                "Multiply the rate per hour (or per day) by the elapsed fraction.",
                "A gaining clock shows MORE, a losing clock shows LESS.",
                "To verify, answer should stay a plausible clock time."
            ],
            "example": {
                "prompt": "A clock gains 5 min/hour, set right at 8:00. What shows at 12 noon?",
                "steps": [
                    "Elapsed = 4 hours.",
                    "Gain = 4 x 5 = 20 minutes.",
                    "Shown time = 12:00 + 20 = 12:20."
                ],
                "answer": "12:20."
            },
            "memoryTip": "Gain adds up, loss subtracts down.",
            "commonMistake": "Mixing up min per hour with min per day when computing the elapsed gain."
        },
        {
            "id": "leap-year-rule",
            "title": "Leap Year Test",
            "formula": {
                "latex": "\\text{leap iff } Y \\mid 4 \\text{ and } (Y \\nmid 100 \\text{ or } Y \\mid 400)",
                "text": "Divisible by 4, but century years need to be divisible by 400."
            },
            "whenToUse": "Identifying leap year plus February 29 days, plus 366-day years.",
            "explanation": [
                "A leap year is divisible by 4.",
                "Century years like 1600, 2000 are leap only if divisible by 400.",
                "So 1900 and 2100 are NOT leap years.",
                "A leap year has 366 days, ordinary has 365."
            ],
            "example": {
                "prompt": "Is 1900 a leap year?",
                "steps": [
                    "1900 ends in 00, century year.",
                    "Must be divisible by 400, but 1900 isn't.",
                    "So 1900 is NOT a leap year."
                ],
                "answer": "No."
            },
            "memoryTip": "Four, but hundred only if four hundred.",
            "commonMistake": "Marking every 4th year like 1900 as leap because it divides by 4."
        },
        {
            "id": "odd-days-year",
            "title": "Odd Days in Ordinary/Leap Year",
            "formula": {
                "latex": "\\text{ordinary} = 1, \\quad \\text{leap} = 2\\text{ odd days}",
                "text": "365 days = 52 weeks + 1; 366 days = 52 weeks + 2."
            },
            "whenToUse": "Counting total odd days across a span of years to find weekdays.",
            "explanation": [
                "365 = 52 x 7 + 1, so 1 odd day per ordinary year.",
                "366 = 52 x 7 + 2, so 2 odd days per leap year.",
                "Odd days tell you how many weekdays to shift by.",
                "Divide the total by 7 to track the leftover."
            ],
            "example": {
                "prompt": "How many odd days in 4 years of which 1 is a leap?",
                "steps": [
                    "3 ordinary years = 3 x 1 = 3 odd days.",
                    "1 leap year = 2 odd days.",
                    "Total = 5 odd days mod 7."
                ],
                "answer": "5 odd days."
            },
            "memoryTip": "Ordinary leaves 1, leap leaves 2.",
            "commonMistake": "Giving up the weekday shift without the mod 7 cleanup."
        },
        {
            "id": "century-odd-days",
            "title": "Odd Days of Centuries",
            "formula": {
                "latex": "100=5,\\ 200=3,\\ 300=1,\\ 400=0\\ (\\text{odd days})",
                "text": "Century odd days: 100 years 5, 200 3, 300 1, 400 0."
            },
            "whenToUse": "Finding weekday of old dates, especially 1800s / 1900s calendar questions.",
            "explanation": [
                "100 years = 76 ordinary and 24 leap = 76 + 48 = 124 days.",
                "124 mod 7 = 5 odd days.",
                "200 years = 10 mod 7 = 3; 300 = 15 mod 7 = 1.",
                "400 years add 1 extras because the 400th is leap -> 21 mod 7 = 0."
            ],
            "example": {
                "prompt": "How many odd days in 300 years?",
                "steps": [
                    "100 years give 5 odd days.",
                    "300 = 3 x 5 = 15 odd days.",
                    "15 mod 7 = 1 odd day."
                ],
                "answer": "1."
            },
            "memoryTip": "Pair 5,3,1,0 up to 4 centuries.",
            "commonMistake": "Treating all centuries as 24 leap years; forgetting the one excluded (like 1900)."
        },
        {
            "id": "day-of-week-codes",
            "title": "Day of the Week from a Date",
            "formula": {
                "latex": "(\\text{last2} + \\lfloor\\frac{\\text{last2}}{4}\\rfloor + \\text{mon} + \\text{cent} + \\text{day}) \\bmod 7",
                "text": "Adding the codes gives a number; modulo 7 is the weekday."
            },
            "whenToUse": "Given a month, date and year to find the weekday.",
            "explanation": [
                "Add last two digits of the year.",
                "Add floor(last two / 4) for leaps inside the year.",
                "Add the month code and the century code.",
                "Add the month date, divide by 7; remainder is the weekday code."
            ],
            "example": {
                "prompt": "Day on 25 May 2003?",
                "steps": [
                    "Last2=03 => 3; year quarter 3/4 = 0.",
                    "Month May = 1; century code 2000s = 6.",
                    "Sum = 3 + 0 + 1 + 6 + 25 = 35 => 35 mod 7 = 0 = Sunday."
                ],
                "answer": "Sunday."
            },
            "memoryTip": "Year, Leap, Month, Century, Date - then modulo make ticket.",
            "commonMistake": "Mixing up the century code of 1900s (0) with 2000s (6)."
        },
        {
            "id": "calendar-repeat-formula",
            "title": "Calendar Repetition",
            "formula": {
                "latex": "\\text{ordinary: } +6 \\text{ or } +11,\\qquad \\text{leap: } +28",
                "text": "Ordinary calendars repeat after 6 or 11 years, leap after 28 years."
            },
            "whenToUse": "Find the year with the identical calendar as a given year.",
            "explanation": [
                "The gap must add 0 odd days total.",
                "For ordinary year try +6 (1 leap in between) or +11 (3 leaps in between).",
                "For leap year the only closed cycle is 28 years.",
                "If the repeated calendar's year type changes, reject it."
            ],
            "example": {
                "prompt": "Calendar of 2016 repeats in which year?",
                "steps": [
                    "2016 is a leap year.",
                    "Leap cycle = 28 years.",
                    "2016 + 28 = 2044."
                ],
                "answer": "2044."
            },
            "memoryTip": "Leap spans twenty-eight; then everything old is new again.",
            "commonMistake": "Adding 28 to an ordinary calendar or 6 to a leap one."
        },
        {
            "id": "month-days-table",
            "title": "Days in Each Month",
            "formula": {
                "latex": "31,28/29,31,30,31,30,31,31,30,31,30,31",
                "text": "Month-day counts from January to December."
            },
            "whenToUse": "Moving between dates in consecutive months, or calendar-grouping months.",
            "explanation": [
                "Thirty days hath Knuckle months: Jan, Mar, May, Jul, Aug, Oct, Dec have 31.",
                "Feb has 28 or 29.",
                "The remaining four (Apr, Jun, Sep, Nov) have 30.",
                "Moving from 1st of a month to 1st of next shifts by month-length mod 7."
            ],
            "example": {
                "prompt": "If 1 March is Tuesday, what is 1 April?",
                "steps": [
                    "March has 31 days = 4 weeks + 3 days.",
                    "Tuesday + 3 = Friday.",
                    "So 1 April is Friday."
                ],
                "answer": "Friday."
            },
            "memoryTip": "Jun asleep 30, 30 30 are the short ribs.",
            "commonMistake": "Forgetting February's leap year special case."
        }
    ],
    "practiceProblems": {
        "clock-angle-formula": [
            {"q": "Find the angle between the hands at 5:30.", "s": ["Angle = |30 x 5 - 5.5 x 30|", "150 - 165 = -15", "Abs value = 15 degrees"], "a": "15 degrees"},
            {"q": "Find the angle at 8:15.", "s": ["Angle = |30 x 8 - 5.5 x 15|", "240 - 82.5 = 157.5", "Smaller = 157.5 degrees"], "a": "157.5 degrees"}
        ],
        "hands-coincide-formula": [
            {"q": "When will the hands coincide between 5 and 6?", "s": ["Gap at 5:00 = 25 spaces", "25 x 12/11 = 300/11 = 27 3/11", "Time = 5:27 3/11"], "a": "5:27 3/11"},
            {"q": "When will the hands be opposite between 3 and 4?", "s": ["Need 30 spaces gap; at 3 gap=15", "Must gain 15 + 30 = 45 spaces", "45 x 12/11 = 49 1/11 -> 3:49 1/11"], "a": "3:49 1/11"}
        ],
        "mirror-image-formula": [
            {"q": "Mirror image of 2:28?", "s": ["11:60 - 2:28", "60 - 28 = 32, 11 - 2 - 1 = 8", "8:32"], "a": "8:32"},
            {"q": "Mirror image of 11:40?", "s": ["11:60 - 11:40", "= 0:20", "Write as 12:20"], "a": "12:20"}
        ],
        "fast-slow-formula": [
            {"q": "Clock gains 3 min/hour, set 9:00, shown at 1:00 PM?", "s": ["Elapsed = 4 hours", "Gain = 4 x 3 = 12", "Shown = 1:00 + 12 = 1:12"], "a": "1:12"},
            {"q": "Clock loses 6 min/hour, set 12:00, shown at 2:00 PM?", "s": ["Elapsed = 2 hours", "Loss = 2 x 6 = 12", "Shown = 2:00 - 12 = 1:48"], "a": "1:48"}
        ],
        "leap-year-rule": [
            {"q": "Is 1600 a leap year?", "s": ["Divisible by 4", "Century also divisible by 400", "1600/400 = 4 so leap"], "a": "Yes"},
            {"q": "Is 2100 a leap year?", "s": ["Divisible by 4", "Century NOT divisible by 400", "Not a leap year"], "a": "No"}
        ],
        "odd-days-year": [
            {"q": "Odd days in 10 ordinary + 2 leap years?", "s": ["10 x 1 = 10", "2 x 2 = 4", "Total 14 mod 7 = 0"], "a": "0 odd days"},
            {"q": "Odd days in 6 ordinary + 3 leap years?", "s": ["6 x 1 = 6", "3 x 2 = 6", "12 mod 7 = 5 odd days"], "a": "5 odd days"}
        ],
        "century-odd-days": [
            {"q": "How many odd days in 200 years?", "s": ["100 yrs = 5", "200 = 2 x 5 = 10", "10 mod 7 = 3"], "a": "3"},
            {"q": "How many odd days in 400 years?", "s": ["4 centuries = 4 x 5 + 1", "= 21 mod 7 = 0"], "a": "0"}
        ],
        "day-of-week-codes": [
            {"q": "1 January 2005 was which day?", "s": ["1 Jan 2000 Saturday + 5 ordinary/leap", "2000-2004 = how many odd days: 2 + 1 + 1 + 1 + 1 = 6", "Saturday + 6 = Friday"], "a": "Friday"},
            {"q": "1 March 2024 is Friday; 1 April 2024?", "s": ["March 31 days = 3 odd", "Friday + 3 = Monday"], "a": "Monday"}
        ],
        "calendar-repeat-formula": [
            {"q": "Calendar of 2020 repeats in?", "s": ["2020 is leap", "Leap repeats after 28 years", "2020 + 28 = 2048"], "a": "2048"},
            {"q": "Calendar of 2013 repeats in?", "s": ["2013 ordinary; try +6 = 2019", "2013-2018: leaps 2016 only, odd days 2 + 5 = 7 = 0", "2019 is ordinary so the calendar repeats"], "a": "2019"}
        ],
        "month-days-table": [
            {"q": "If 1 July is Monday, what is 1 August?", "s": ["July has 31 days = 3 odd", "Monday + 3 = Thursday"], "a": "Thursday"},
            {"q": "If 1 Nov is Friday, what is 1 Dec?", "s": ["Nov has 30 days = 2 odd", "Friday + 2 = Sunday"], "a": "Sunday"}
        ]
    },
    "learningPath": [
        {"type": "concept", "sectionId": "clock-basics"},
        {"type": "concept", "sectionId": "angle-between-hands"},
        {"type": "concept", "sectionId": "coincide-opposite"},
        {"type": "concept", "sectionId": "mirror-image"},
        {"type": "concept", "sectionId": "fast-slow-clocks"},
        {"type": "concept", "sectionId": "calendar-leap"},
        {"type": "concept", "sectionId": "odd-days"},
        {"type": "guided", "sectionId": "day-of-week"},
        {"type": "guided", "sectionId": "calendar-repetition"},
        {"type": "guided", "sectionId": "month-day-count"}
    ]
}

topic["mcqs"] = MCQS

target = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "topics", "clock-calendar.json")
with open(target, "w") as f:
    json.dump(topic, f, ensure_ascii=False, indent=2)
    f.write("\n")
print("Wrote clock-calendar.json with", len(MCQS), "MCQs")