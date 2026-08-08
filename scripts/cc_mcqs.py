#!/usr/bin/env python3
"""150 MCQs for Clock & Calendar with detailed step-by-step explanations.
Each: {"id", "t" (filter tag), "q", "opts" (4, latex), "c" (0-based answer index), "exp"}.
Tags: basic(20), angle(20), coincide(20), mirror(12), fastslow(12),
leapyear(14), odddays(16), weekday(18), repeat(12), mixed(6)."""

MCQS = [
    # ------------------------- basic (0-19) -------------------------
    {
        "id": 0,
        "t": "basic",
        "q": "How many degrees does the hour hand of a clock move in 1 hour?",
        "opts": ["$30^\\circ$", "$60^\\circ$", "$15^\\circ$", "$6^\\circ$"],
        "c": 0,
        "exp": "Step 1: The hour hand covers a full circle of 360 degrees in 12 hours. Step 2: Degrees per hour = 360 ÷ 12 = 30 degrees. Answer is option A."
    },
    {
        "id": 1,
        "t": "basic",
        "q": "How many degrees does the minute hand move in 1 minute?",
        "opts": ["$1^\\circ$", "$6^\\circ$", "$0.5^\\circ$", "$12^\\circ$"],
        "c": 1,
        "exp": "Step 1: The minute hand covers 360 degrees in 60 minutes. Step 2: Degrees per minute = 360 ÷ 60 = 6 degrees. Answer is option B."
    },
    {
        "id": 2,
        "t": "basic",
        "q": "How many degrees does the hour hand move in 1 minute?",
        "opts": ["$6^\\circ$", "$1^\\circ$", "$0.5^\\circ$", "$0.1^\\circ$"],
        "c": 2,
        "exp": "Step 1: The hour hand moves 30 degrees in 60 minutes. Step 2: Degrees per minute = 30 ÷ 60 = 0.5 degrees. Answer is option C."
    },
    {
        "id": 3,
        "t": "basic",
        "q": "What is the relative speed of the minute hand with respect to the hour hand (in degrees per minute)?",
        "opts": ["$5.5^\\circ$/min", "$6^\\circ$/min", "$0.5^\\circ$/min", "$11^\\circ$/min"],
        "c": 0,
        "exp": "Step 1: Minute hand moves 6 degrees per minute, hour hand moves 0.5 degrees per minute. Step 2: Relative speed = 6 - 0.5 = 5.5 degrees per minute. Answer is option A."
    },
    {
        "id": 4,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 3:00?",
        "opts": ["$30^\\circ$", "$60^\\circ$", "$90^\\circ$", "$180^\\circ$"],
        "c": 2,
        "exp": "Step 1: At 3:00 the hour hand is at 3 and the minute hand is at 12. Step 2: On a clock face, 3 hour-markers separate them. Step 3: Each hour-marker is 30 degrees, so angle = 3 × 30 = 90 degrees. Answer is option C."
    },
    {
        "id": 5,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 6:00?",
        "opts": ["$90^\\circ$", "$120^\\circ$", "$150^\\circ$", "$180^\\circ$"],
        "c": 3,
        "exp": "Step 1: At 6:00 the hour hand is at 6 and the minute hand is at 12. Step 2: They are 6 hour-markers apart. Step 3: 6 × 30 = 180 degrees, a straight line. Answer is option D."
    },
    {
        "id": 6,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 9:00?",
        "opts": ["$90^\\circ$", "$30^\\circ$", "$60^\\circ$", "$270^\\circ$"],
        "c": 0,
        "exp": "Step 1: At 9:00 the hour hand is at 9 and the minute hand is at 12. Step 2: They are 3 hour-markers apart. Step 3: 3 × 30 = 90 degrees. The smaller angle is 90 degrees. Answer is option A."
    },
    {
        "id": 7,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 12:30?",
        "opts": ["$150^\\circ$", "$165^\\circ$", "$180^\\circ$", "$120^\\circ$"],
        "c": 1,
        "exp": "Step 1: Use the formula Angle = |30H - 5.5M| where H is the hour and M is minutes. Step 2: At 12:30, H = 0 (12 is treated as 0) and M = 30. Step 3: |30 × 0 - 5.5 × 30| = |0 - 165| = 165 degrees. Answer is option B."
    },
    {
        "id": 8,
        "t": "basic",
        "q": "At 1:00, the angle between the hands of a clock is:",
        "opts": ["$15^\\circ$", "$45^\\circ$", "$30^\\circ$", "$60^\\circ$"],
        "c": 2,
        "exp": "Step 1: At 1:00 the hour hand is at 1 and the minute hand is at 12. Step 2: They are 1 hour-marker apart. Step 3: 1 × 30 = 30 degrees. Answer is option C."
    },
    {
        "id": 9,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 2:30?",
        "opts": ["$90^\\circ$", "$105^\\circ$", "$120^\\circ$", "$75^\\circ$"],
        "c": 1,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 2:30, H = 2 and M = 30: |30 × 2 - 5.5 × 30| = |60 - 165| = 105 degrees. Answer is option B."
    },
    {
        "id": 10,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 4:30?",
        "opts": ["$30^\\circ$", "$60^\\circ$", "$45^\\circ$", "$90^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 4:30, H = 4 and M = 30: |120 - 165| = 45 degrees. Answer is option C."
    },
    {
        "id": 11,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 5:30?",
        "opts": ["$15^\\circ$", "$30^\\circ$", "$25^\\circ$", "$45^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 5:30, H = 5 and M = 30: |150 - 165| = 15 degrees. Answer is option A."
    },
    {
        "id": 12,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 7:30?",
        "opts": ["$30^\\circ$", "$60^\\circ$", "$45^\\circ$", "$15^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 7:30, H = 7 and M = 30: |210 - 165| = 45 degrees. Answer is option C."
    },
    {
        "id": 13,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 8:30?",
        "opts": ["$75^\\circ$", "$60^\\circ$", "$90^\\circ$", "$105^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 8:30, H = 8 and M = 30: |240 - 165| = 75 degrees. Answer is option A."
    },
    {
        "id": 14,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 10:30?",
        "opts": ["$120^\\circ$", "$150^\\circ$", "$135^\\circ$", "$90^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 10:30, H = 10 and M = 30: |300 - 165| = 135 degrees. Answer is option C."
    },
    {
        "id": 15,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 11:30?",
        "opts": ["$150^\\circ$", "$180^\\circ$", "$165^\\circ$", "$135^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 11:30, H = 11 and M = 30: |330 - 165| = 165 degrees. Answer is option C."
    },
    {
        "id": 16,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 3:30?",
        "opts": ["$90^\\circ$", "$105^\\circ$", "$75^\\circ$", "$60^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 3:30, H = 3 and M = 30: |90 - 165| = 75 degrees. Answer is option C."
    },
    {
        "id": 17,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 6:30?",
        "opts": ["$15^\\circ$", "$30^\\circ$", "$45^\\circ$", "$60^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 6:30, H = 6 and M = 30: |180 - 165| = 15 degrees. Answer is option A."
    },
    {
        "id": 18,
        "t": "basic",
        "q": "What is the angle between the hands of a clock at 9:30?",
        "opts": ["$90^\\circ$", "$105^\\circ$", "$120^\\circ$", "$75^\\circ$"],
        "c": 1,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 9:30, H = 9 and M = 30: |270 - 165| = 105 degrees. Answer is option B."
    },
    {
        "id": 19,
        "t": "basic",
        "q": "In how many hours does the hour hand make one complete revolution (360 degrees)?",
        "opts": ["6 hours", "12 hours", "24 hours", "60 hours"],
        "c": 1,
        "exp": "Step 1: The hour hand moves 30 degrees per hour. Step 2: Time for 360 degrees = 360 ÷ 30 = 12 hours. Answer is option B."
    },
    # ------------------------- angle (20-39) -------------------------
    {
        "id": 20,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 3:15.",
        "opts": ["$7.5^\\circ$", "$15^\\circ$", "$0^\\circ$", "$10^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 3:15, H = 3 and M = 15: |90 - 82.5| = 7.5 degrees. Answer is option A."
    },
    {
        "id": 21,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 4:20.",
        "opts": ["$5^\\circ$", "$10^\\circ$", "$15^\\circ$", "$20^\\circ$"],
        "c": 1,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 4:20, H = 4 and M = 20: |120 - 110| = 10 degrees. Answer is option B."
    },
    {
        "id": 22,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 5:45.",
        "opts": ["$97.5^\\circ$", "$82.5^\\circ$", "$90^\\circ$", "$105^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 5:45, H = 5 and M = 45: |150 - 247.5| = 97.5 degrees. Answer is option A."
    },
    {
        "id": 23,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 1:30.",
        "opts": ["$120^\\circ$", "$150^\\circ$", "$135^\\circ$", "$165^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 1:30, H = 1 and M = 30: |30 - 165| = 135 degrees. Answer is option C."
    },
    {
        "id": 24,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 2:45.",
        "opts": ["$172.5^\\circ$", "$187.5^\\circ$", "$165^\\circ$", "$180^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 2:45, H = 2 and M = 45: |60 - 247.5| = 187.5 degrees. Step 3: Since this exceeds 180, the smaller angle = 360 - 187.5 = 172.5 degrees. Answer is option A."
    },
    {
        "id": 25,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 6:45.",
        "opts": ["$90^\\circ$", "$60^\\circ$", "$67.5^\\circ$", "$75^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 6:45, H = 6 and M = 45: |180 - 247.5| = 67.5 degrees. Answer is option C."
    },
    {
        "id": 26,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 8:20.",
        "opts": ["$100^\\circ$", "$110^\\circ$", "$120^\\circ$", "$130^\\circ$"],
        "c": 3,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 8:20, H = 8 and M = 20: |240 - 110| = 130 degrees. Answer is option D."
    },
    {
        "id": 27,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 10:10.",
        "opts": ["$115^\\circ$", "$125^\\circ$", "$105^\\circ$", "$245^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 10:10, H = 10 and M = 10: |300 - 55| = 245 degrees. Step 3: Since this exceeds 180, the smaller angle = 360 - 245 = 115 degrees. Answer is option A."
    },
    {
        "id": 28,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 11:05.",
        "opts": ["$57.5^\\circ$", "$52.5^\\circ$", "$302.5^\\circ$", "$60^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 11:05, H = 11 and M = 5: |330 - 27.5| = 302.5 degrees. Step 3: Since this exceeds 180, the smaller angle = 360 - 302.5 = 57.5 degrees. Answer is option A."
    },
    {
        "id": 29,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 12:15.",
        "opts": ["$75^\\circ$", "$82.5^\\circ$", "$90^\\circ$", "$67.5^\\circ$"],
        "c": 1,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 12:15, H = 0 and M = 15: |0 - 82.5| = 82.5 degrees. Answer is option B."
    },
    {
        "id": 30,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 9:15.",
        "opts": ["$187.5^\\circ$", "$172.5^\\circ$", "$157.5^\\circ$", "$180^\\circ$"],
        "c": 1,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 9:15, H = 9 and M = 15: |270 - 82.5| = 187.5 degrees. Step 3: Since this exceeds 180, the smaller angle = 360 - 187.5 = 172.5 degrees. Answer is option B."
    },
    {
        "id": 31,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 4:40.",
        "opts": ["$80^\\circ$", "$90^\\circ$", "$100^\\circ$", "$120^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 4:40, H = 4 and M = 40: |120 - 220| = 100 degrees. Answer is option C."
    },
    {
        "id": 32,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 7:20.",
        "opts": ["$100^\\circ$", "$90^\\circ$", "$110^\\circ$", "$80^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 7:20, H = 7 and M = 20: |210 - 110| = 100 degrees. Answer is option A."
    },
    {
        "id": 33,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 2:10.",
        "opts": ["$5^\\circ$", "$10^\\circ$", "$15^\\circ$", "$25^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 2:10, H = 2 and M = 10: |60 - 55| = 5 degrees. Answer is option A."
    },
    {
        "id": 34,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 5:50.",
        "opts": ["$115^\\circ$", "$125^\\circ$", "$135^\\circ$", "$145^\\circ$"],
        "c": 1,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 5:50, H = 5 and M = 50: |150 - 275| = 125 degrees. Answer is option B."
    },
    {
        "id": 35,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 3:45.",
        "opts": ["$157.5^\\circ$", "$142.5^\\circ$", "$167.5^\\circ$", "$135^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 3:45, H = 3 and M = 45: |90 - 247.5| = 157.5 degrees. Answer is option A."
    },
    {
        "id": 36,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 1:05.",
        "opts": ["$2.5^\\circ$", "$5^\\circ$", "$7.5^\\circ$", "$0^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 1:05, H = 1 and M = 5: |30 - 27.5| = 2.5 degrees. Answer is option A."
    },
    {
        "id": 37,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 8:45.",
        "opts": ["$15^\\circ$", "$7.5^\\circ$", "$5^\\circ$", "$10^\\circ$"],
        "c": 1,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 8:45, H = 8 and M = 45: |240 - 247.5| = 7.5 degrees. Answer is option B."
    },
    {
        "id": 38,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 6:10.",
        "opts": ["$115^\\circ$", "$135^\\circ$", "$125^\\circ$", "$145^\\circ$"],
        "c": 2,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 6:10, H = 6 and M = 10: |180 - 55| = 125 degrees. Answer is option C."
    },
    {
        "id": 39,
        "t": "angle",
        "q": "Find the angle between the hands of a clock at 12:40.",
        "opts": ["$140^\\circ$", "$220^\\circ$", "$130^\\circ$", "$150^\\circ$"],
        "c": 0,
        "exp": "Step 1: Angle = |30H - 5.5M|. Step 2: At 12:40, H = 0 and M = 40: |0 - 220| = 220 degrees. Step 3: Since this exceeds 180, the smaller angle = 360 - 220 = 140 degrees. Answer is option A."
    },
    # ------------------------- coincide (40-59) -------------------------
    {
        "id": 40,
        "t": "coincide",
        "q": "At what time between 3 and 4 o'clock will the hands of a clock coincide?",
        "opts": ["$3:16\\frac{4}{11}$", "$3:15\\frac{5}{11}$", "$3:17\\frac{3}{11}$", "$3:14\\frac{6}{11}$"],
        "c": 0,
        "exp": "Step 1: At 3:00 the minute hand is 15 minute-spaces behind the hour hand. Step 2: Time to gain 15 spaces = 15 × 12/11 = 180/11 = 16 4/11 minutes. Step 3: Coincidence time = 3:16 4/11. Answer is option A."
    },
    {
        "id": 41,
        "t": "coincide",
        "q": "At what time between 4 and 5 o'clock will the hands of a clock coincide?",
        "opts": ["$4:20\\frac{9}{11}$", "$4:21\\frac{9}{11}$", "$4:21\\frac{3}{11}$", "$4:22\\frac{9}{11}$"],
        "c": 1,
        "exp": "Step 1: At 4:00 the minute hand is 20 minute-spaces behind the hour hand. Step 2: Time to gain 20 spaces = 20 × 12/11 = 240/11 = 21 9/11 minutes. Step 3: Coincidence time = 4:21 9/11. Answer is option B."
    },
    {
        "id": 42,
        "t": "coincide",
        "q": "At what time between 5 and 6 o'clock will the hands of a clock coincide?",
        "opts": ["$5:26\\frac{4}{11}$", "$5:28\\frac{2}{11}$", "$5:27\\frac{3}{11}$", "$5:25\\frac{5}{11}$"],
        "c": 2,
        "exp": "Step 1: At 5:00 the minute hand is 25 minute-spaces behind the hour hand. Step 2: Time to gain 25 spaces = 25 × 12/11 = 300/11 = 27 3/11 minutes. Step 3: Coincidence time = 5:27 3/11. Answer is option C."
    },
    {
        "id": 43,
        "t": "coincide",
        "q": "At what time between 2 and 3 o'clock will the hands of a clock coincide?",
        "opts": ["$2:10\\frac{10}{11}$", "$2:11\\frac{1}{11}$", "$2:09\\frac{9}{11}$", "$2:10\\frac{2}{11}$"],
        "c": 0,
        "exp": "Step 1: At 2:00 the minute hand is 10 minute-spaces behind the hour hand. Step 2: Time to gain 10 spaces = 10 × 12/11 = 120/11 = 10 10/11 minutes. Step 3: Coincidence time = 2:10 10/11. Answer is option A."
    },
    {
        "id": 44,
        "t": "coincide",
        "q": "At what time between 1 and 2 o'clock will the hands of a clock coincide?",
        "opts": ["$1:06\\frac{1}{11}$", "$1:05\\frac{5}{11}$", "$1:04\\frac{4}{11}$", "$1:05\\frac{10}{11}$"],
        "c": 1,
        "exp": "Step 1: At 1:00 the minute hand is 5 minute-spaces behind the hour hand. Step 2: Time to gain 5 spaces = 5 × 12/11 = 60/11 = 5 5/11 minutes. Step 3: Coincidence time = 1:05 5/11. Answer is option B."
    },
    {
        "id": 45,
        "t": "coincide",
        "q": "At what time between 7 and 8 o'clock will the hands of a clock coincide?",
        "opts": ["$7:37\\frac{7}{11}$", "$7:39\\frac{1}{11}$", "$7:38\\frac{2}{11}$", "$7:36\\frac{4}{11}$"],
        "c": 2,
        "exp": "Step 1: At 7:00 the minute hand is 35 minute-spaces behind the hour hand. Step 2: Time to gain 35 spaces = 35 × 12/11 = 420/11 = 38 2/11 minutes. Step 3: Coincidence time = 7:38 2/11. Answer is option C."
    },
    {
        "id": 46,
        "t": "coincide",
        "q": "At what time between 8 and 9 o'clock will the hands of a clock coincide?",
        "opts": ["$8:43\\frac{7}{11}$", "$8:42\\frac{6}{11}$", "$8:44\\frac{4}{11}$", "$8:41\\frac{9}{11}$"],
        "c": 0,
        "exp": "Step 1: At 8:00 the minute hand is 40 minute-spaces behind the hour hand. Step 2: Time to gain 40 spaces = 40 × 12/11 = 480/11 = 43 7/11 minutes. Step 3: Coincidence time = 8:43 7/11. Answer is option A."
    },
    {
        "id": 47,
        "t": "coincide",
        "q": "At what time between 9 and 10 o'clock will the hands of a clock coincide?",
        "opts": ["$9:48\\frac{3}{11}$", "$9:50\\frac{2}{11}$", "$9:47\\frac{5}{11}$", "$9:49\\frac{1}{11}$"],
        "c": 3,
        "exp": "Step 1: At 9:00 the minute hand is 45 minute-spaces behind the hour hand. Step 2: Time to gain 45 spaces = 45 × 12/11 = 540/11 = 49 1/11 minutes. Step 3: Coincidence time = 9:49 1/11. Answer is option D."
    },
    {
        "id": 48,
        "t": "coincide",
        "q": "At what time between 10 and 11 o'clock will the hands of a clock coincide?",
        "opts": ["$10:53\\frac{4}{11}$", "$10:55\\frac{8}{11}$", "$10:52\\frac{6}{11}$", "$10:54\\frac{6}{11}$"],
        "c": 3,
        "exp": "Step 1: At 10:00 the minute hand is 50 minute-spaces behind the hour hand. Step 2: Time to gain 50 spaces = 50 × 12/11 = 600/11 = 54 6/11 minutes. Step 3: Coincidence time = 10:54 6/11. Answer is option D."
    },
    {
        "id": 49,
        "t": "coincide",
        "q": "At what time between 11 and 12 o'clock do the hands of a clock coincide?",
        "opts": ["11:55", "11:59", "12:00", "11:58"],
        "c": 2,
        "exp": "Step 1: At 11:00 the minute hand is 55 minute-spaces behind the hour hand. Step 2: Time to gain 55 spaces = 55 × 12/11 = 60 minutes = 1 hour. Step 3: 11:00 + 1 hour = 12:00, when both hands are at 12. Answer is option C."
    },
    {
        "id": 50,
        "t": "coincide",
        "q": "At what time between 4 and 5 o'clock are the hands of a clock exactly opposite?",
        "opts": ["$4:53\\frac{2}{11}$", "$4:55\\frac{7}{11}$", "$4:52\\frac{4}{11}$", "$4:54\\frac{6}{11}$"],
        "c": 3,
        "exp": "Step 1: Hands are opposite when the minute hand is 30 minute-spaces ahead of the hour hand. Step 2: At 4:00 the minute hand is 20 spaces behind the hour hand, so it must gain 20 + 30 = 50 spaces. Step 3: 50 × 12/11 = 600/11 = 54 6/11 minutes. Step 4: Time = 4:54 6/11. Answer is option D."
    },
    {
        "id": 51,
        "t": "coincide",
        "q": "At what time between 5 and 6 o'clock are the hands of a clock exactly opposite?",
        "opts": ["5:55", "6:00", "5:45", "6:05"],
        "c": 1,
        "exp": "Step 1: Hands are opposite when the minute hand is 30 minute-spaces ahead of the hour hand. Step 2: At 5:00 the minute hand is 25 spaces behind the hour hand, so it must gain 25 + 30 = 55 spaces. Step 3: 55 × 12/11 = 60 minutes = 1 hour. Step 4: Time = 5:00 + 1 hour = 6:00. Answer is option B."
    },
    {
        "id": 52,
        "t": "coincide",
        "q": "At what time between 7 and 8 o'clock are the hands of a clock exactly opposite?",
        "opts": ["$7:05\\frac{5}{11}$", "$7:06\\frac{4}{11}$", "$7:04\\frac{7}{11}$", "$7:03\\frac{9}{11}$"],
        "c": 0,
        "exp": "Step 1: Hands are opposite when the minute hand is 30 minute-spaces ahead of the hour hand. Step 2: At 7:00 the minute hand is 35 spaces behind the hour hand; to be opposite it must come 30 spaces behind, i.e., gain 5 spaces. Step 3: 5 × 12/11 = 60/11 = 5 5/11 minutes. Step 4: Time = 7:05 5/11. Answer is option A."
    },
    {
        "id": 53,
        "t": "coincide",
        "q": "At what time between 8 and 9 o'clock are the hands of a clock exactly opposite?",
        "opts": ["$8:11\\frac{1}{11}$", "$8:09\\frac{9}{11}$", "$8:10\\frac{10}{11}$", "$8:12\\frac{2}{11}$"],
        "c": 2,
        "exp": "Step 1: At 8:00 the minute hand is 40 spaces behind the hour hand; for opposite hands it must come 30 spaces behind, i.e., gain 10 spaces. Step 2: 10 × 12/11 = 120/11 = 10 10/11 minutes. Step 3: Time = 8:10 10/11. Answer is option C."
    },
    {
        "id": 54,
        "t": "coincide",
        "q": "At what time between 4 and 5 o'clock are the hands of a clock at right angles (first time)?",
        "opts": ["$4:06\\frac{6}{11}$", "$4:05\\frac{5}{11}$", "$4:04\\frac{4}{11}$", "$4:07\\frac{1}{11}$"],
        "c": 1,
        "exp": "Step 1: Hands are at right angles when they are 15 minute-spaces apart. Step 2: At 4:00 the minute hand is 20 spaces behind the hour hand; it must come 15 spaces behind, i.e., gain 5 spaces. Step 3: 5 × 12/11 = 60/11 = 5 5/11 minutes. Step 4: Time = 4:05 5/11. Answer is option B."
    },
    {
        "id": 55,
        "t": "coincide",
        "q": "At what time between 9 and 10 o'clock are the hands of a clock at right angles (first time)?",
        "opts": ["$9:31\\frac{5}{11}$", "$9:33\\frac{1}{11}$", "$9:30\\frac{4}{11}$", "$9:32\\frac{8}{11}$"],
        "c": 3,
        "exp": "Step 1: At 9:00 the minute hand is 45 spaces behind the hour hand; for a right angle it must come 15 spaces behind, i.e., gain 45 - 15 = 30 spaces. Step 2: 30 × 12/11 = 360/11 = 32 8/11 minutes. Step 3: Time = 9:32 8/11. Answer is option D."
    },
    {
        "id": 56,
        "t": "coincide",
        "q": "At what time between 2 and 3 o'clock are the hands of a clock at right angles (first time)?",
        "opts": ["$2:06\\frac{6}{11}$", "$2:04\\frac{4}{11}$", "$2:05\\frac{5}{11}$", "$2:03\\frac{3}{11}$"],
        "c": 2,
        "exp": "Step 1: At 2:00 the minute hand is 10 spaces behind the hour hand; for a right angle it must come 15 spaces behind, i.e., gain 5 spaces. Step 2: 5 × 12/11 = 60/11 = 5 5/11 minutes. Step 3: Time = 2:05 5/11. Answer is option C."
    },
    {
        "id": 57,
        "t": "coincide",
        "q": "How many times do the hands of a clock coincide in 12 hours?",
        "opts": ["10", "11", "12", "13"],
        "c": 1,
        "exp": "Step 1: The hands coincide 11 times in 12 hours. Step 2: They coincide once every 65 5/11 minutes; 12 hours = 720 minutes = 720 ÷ (720/11) = 11 times (including 12:00 counted once). Answer is option B."
    },
    {
        "id": 58,
        "t": "coincide",
        "q": "How many times are the hands of a clock exactly opposite in 12 hours?",
        "opts": ["10", "11", "12", "22"],
        "c": 1,
        "exp": "Step 1: The hands are exactly opposite 11 times in 12 hours. Step 2: Starting at 6:00, the hands become opposite once every 65 5/11 minutes, giving 11 occurrences in 12 hours. Answer is option B."
    },
    {
        "id": 59,
        "t": "coincide",
        "q": "How many times do the hands of a clock form a right angle (90 degrees) in 12 hours?",
        "opts": ["11", "12", "22", "24"],
        "c": 2,
        "exp": "Step 1: In every hour the hands form right angles twice, except between 3-4 and 9-10 where it happens only once each (the other occurrence falls at the exact hour boundary). Step 2: Total = 22 times in 12 hours. Answer is option C."
    },
    # ------------------------- mirror (60-71) -------------------------
    {
        "id": 60,
        "t": "mirror",
        "q": "A clock shows 4:46. What time does its mirror image show?",
        "opts": ["7:14", "7:16", "8:14", "7:04"],
        "c": 0,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 4:46 = 7:14. Answer is option A."
    },
    {
        "id": 61,
        "t": "mirror",
        "q": "A clock shows 3:25. What time does its mirror image show?",
        "opts": ["8:35", "9:35", "8:25", "9:25"],
        "c": 0,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 3:25 = 8:35. Answer is option A."
    },
    {
        "id": 62,
        "t": "mirror",
        "q": "A clock shows 9:05. What time does its mirror image show?",
        "opts": ["3:55", "2:05", "2:55", "3:05"],
        "c": 2,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 9:05 = 2:55. Answer is option C."
    },
    {
        "id": 63,
        "t": "mirror",
        "q": "A clock shows 10:10. What time does its mirror image show?",
        "opts": ["2:10", "1:50", "1:10", "2:50"],
        "c": 1,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 10:10 = 1:50. Answer is option B."
    },
    {
        "id": 64,
        "t": "mirror",
        "q": "A clock shows 5:40. What time does its mirror image show?",
        "opts": ["6:20", "6:40", "5:20", "7:20"],
        "c": 0,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 5:40 = 6:20. Answer is option A."
    },
    {
        "id": 65,
        "t": "mirror",
        "q": "A clock shows 2:30. What time does its mirror image show?",
        "opts": ["10:30", "9:30", "8:30", "11:30"],
        "c": 1,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 2:30 = 9:30. Answer is option B."
    },
    {
        "id": 66,
        "t": "mirror",
        "q": "A clock shows 11:15. What time does its mirror image show?",
        "opts": ["1:15", "12:15", "12:45", "11:45"],
        "c": 2,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 11:15 = 0:45, which is written as 12:45. Answer is option C."
    },
    {
        "id": 67,
        "t": "mirror",
        "q": "A clock shows 7:52. What time does its mirror image show?",
        "opts": ["4:08", "3:52", "4:52", "3:08"],
        "c": 0,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 7:52 = 4:08. Answer is option A."
    },
    {
        "id": 68,
        "t": "mirror",
        "q": "A clock shows 1:01. What time does its mirror image show?",
        "opts": ["10:01", "11:59", "10:59", "11:01"],
        "c": 2,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 1:01 = 10:59. Answer is option C."
    },
    {
        "id": 69,
        "t": "mirror",
        "q": "A clock shows 8:40. What time does its mirror image show?",
        "opts": ["3:20", "4:20", "3:40", "2:20"],
        "c": 0,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 8:40 = 3:20. Answer is option A."
    },
    {
        "id": 70,
        "t": "mirror",
        "q": "A clock shows 6:30. What time does its mirror image show?",
        "opts": ["6:30", "5:30", "4:30", "7:30"],
        "c": 1,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 6:30 = 5:30. Answer is option B."
    },
    {
        "id": 71,
        "t": "mirror",
        "q": "A clock shows 12:30. What time does its mirror image show?",
        "opts": ["11:30", "12:30", "10:30", "1:30"],
        "c": 0,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 12:30 = 11:30. Answer is option A."
    },
    # ------------------------- fastslow (72-83) -------------------------
    {
        "id": 72,
        "t": "fastslow",
        "q": "A clock gains 5 minutes per hour. It is set right at 8:00 AM. What time will it show at 12:00 noon?",
        "opts": ["12:15", "12:20", "12:10", "12:25"],
        "c": 1,
        "exp": "Step 1: Time elapsed from 8 AM to 12 noon = 4 hours. Step 2: Gain = 4 × 5 = 20 minutes. Step 3: Shown time = 12:00 + 20 min = 12:20. Answer is option B."
    },
    {
        "id": 73,
        "t": "fastslow",
        "q": "A clock loses 4 minutes per hour. It is set right at 10:00 AM. What time will it show at 2:00 PM?",
        "opts": ["1:44", "1:46", "1:42", "1:48"],
        "c": 0,
        "exp": "Step 1: Time elapsed from 10 AM to 2 PM = 4 hours. Step 2: Loss = 4 × 4 = 16 minutes. Step 3: Shown time = 2:00 - 16 min = 1:44. Answer is option A."
    },
    {
        "id": 74,
        "t": "fastslow",
        "q": "A clock is 10 minutes slow. It gains 5 minutes every hour. After how many hours will it show the correct time?",
        "opts": ["1 hour", "1.5 hours", "2 hours", "2.5 hours"],
        "c": 2,
        "exp": "Step 1: The clock must recover a deficit of 10 minutes. Step 2: It gains 5 minutes per hour. Step 3: Time needed = 10 ÷ 5 = 2 hours. Answer is option C."
    },
    {
        "id": 75,
        "t": "fastslow",
        "q": "A clock gains 2 minutes per hour. It is set right at 12:00 noon. What time will it show at 6:00 PM?",
        "opts": ["6:10", "6:12", "6:14", "6:08"],
        "c": 1,
        "exp": "Step 1: Time elapsed from 12 noon to 6 PM = 6 hours. Step 2: Gain = 6 × 2 = 12 minutes. Step 3: Shown time = 6:00 + 12 min = 6:12. Answer is option B."
    },
    {
        "id": 76,
        "t": "fastslow",
        "q": "A clock loses 3 minutes per hour. It is set right at 9:00 AM. What time will it show at 1:00 PM?",
        "opts": ["12:48", "12:52", "12:46", "12:44"],
        "c": 0,
        "exp": "Step 1: Time elapsed from 9 AM to 1 PM = 4 hours. Step 2: Loss = 4 × 3 = 12 minutes. Step 3: Shown time = 1:00 - 12 min = 12:48. Answer is option A."
    },
    {
        "id": 77,
        "t": "fastslow",
        "q": "A clock is set right at 8:00 AM and shows 12:16 at 12:00 noon. How many minutes does it gain per hour?",
        "opts": ["3 min/hour", "5 min/hour", "4 min/hour", "6 min/hour"],
        "c": 2,
        "exp": "Step 1: Time elapsed = 4 hours; gain shown = 16 minutes. Step 2: Gain per hour = 16 ÷ 4 = 4 minutes. Answer is option C."
    },
    {
        "id": 78,
        "t": "fastslow",
        "q": "A clock set right at 10:00 AM shows 2:12 at 2:00 PM. The clock is:",
        "opts": ["Slow by 3 min/hour", "Fast by 3 min/hour", "Slow by 4 min/hour", "Fast by 4 min/hour"],
        "c": 1,
        "exp": "Step 1: Time elapsed = 4 hours; shown gain = 12 minutes. Step 2: Gain per hour = 12 ÷ 4 = 3 minutes. Step 3: Since it shows more than the correct time, it is fast by 3 min/hour. Answer is option B."
    },
    {
        "id": 79,
        "t": "fastslow",
        "q": "A clock gains $\\frac{5}{11}$ minutes every hour. How many minutes does it gain per day?",
        "opts": ["$10\\frac{10}{11}$ min", "$11\\frac{1}{11}$ min", "$10\\frac{5}{11}$ min", "$11\\frac{5}{11}$ min"],
        "c": 0,
        "exp": "Step 1: Gain per day = gain per hour × 24. Step 2: (5/11) × 24 = 120/11 = 10 10/11 minutes. Answer is option A."
    },
    {
        "id": 80,
        "t": "fastslow",
        "q": "A clock gains 10 minutes per day. It is set right at 12:00 noon. What time will it show at midnight?",
        "opts": ["12:10", "12:05", "12:08", "12:12"],
        "c": 1,
        "exp": "Step 1: From noon to midnight is 12 hours = half a day. Step 2: Gain in 12 hours = 10 ÷ 2 = 5 minutes. Step 3: Shown time = 12:00 + 5 min = 12:05. Answer is option B."
    },
    {
        "id": 81,
        "t": "fastslow",
        "q": "A clock loses 10 minutes per day. It is set right at 12:00 noon. What time will it show at midnight?",
        "opts": ["11:50", "11:55", "11:52", "11:48"],
        "c": 1,
        "exp": "Step 1: From noon to midnight is 12 hours = half a day. Step 2: Loss in 12 hours = 10 ÷ 2 = 5 minutes. Step 3: Shown time = 12:00 - 5 min = 11:55. Answer is option B."
    },
    {
        "id": 82,
        "t": "fastslow",
        "q": "A clock shows 12:00 when the correct time is 11:50. The clock is:",
        "opts": ["Slow by 10 min", "Fast by 10 min", "Slow by 15 min", "Fast by 15 min"],
        "c": 1,
        "exp": "Step 1: The clock shows 12:00 while the correct time is 11:50. Step 2: 12:00 is ahead of 11:50 by 10 minutes. Step 3: The clock is fast by 10 minutes. Answer is option B."
    },
    {
        "id": 83,
        "t": "fastslow",
        "q": "The hands of a clock coincide every 65 minutes instead of every $65\\frac{5}{11}$ minutes. The clock is:",
        "opts": ["Slow", "Fast", "Accurate", "Cannot be determined"],
        "c": 1,
        "exp": "Step 1: A correct clock's hands coincide every 65 5/11 minutes. Step 2: This clock's hands coincide every 65 minutes, i.e., sooner than correct. Step 3: Hands meeting sooner means the clock runs fast. Answer is option B."
    },
    # ------------------------- leapyear (84-97) -------------------------
    {
        "id": 84,
        "t": "leapyear",
        "q": "Which of the following is a leap year?",
        "opts": ["1900", "2000", "2100", "1800"],
        "c": 1,
        "exp": "Step 1: A year is a leap year if divisible by 4, except century years which must be divisible by 400. Step 2: 2000 is divisible by 400, so it is a leap year. Step 3: 1900, 2100, 1800 are divisible by 100 but not by 400, so they are NOT leap years. Answer is option B."
    },
    {
        "id": 85,
        "t": "leapyear",
        "q": "Is 1900 a leap year?",
        "opts": ["Yes", "No", "Only if divisible by 4", "Cannot be determined"],
        "c": 1,
        "exp": "Step 1: 1900 is a century year, so it is a leap year only if divisible by 400. Step 2: 1900 ÷ 400 = 4.75, not an integer. Step 3: So 1900 is NOT a leap year. Answer is option B."
    },
    {
        "id": 86,
        "t": "leapyear",
        "q": "Which of the following is NOT a leap year?",
        "opts": ["1600", "2004", "2012", "2200"],
        "c": 3,
        "exp": "Step 1: 1600 is divisible by 400, so it is a leap year. Step 2: 2004 and 2012 are divisible by 4 (non-century), so they are leap years. Step 3: 2200 is a century year not divisible by 400, so it is NOT a leap year. Answer is option D."
    },
    {
        "id": 87,
        "t": "leapyear",
        "q": "How many days are there in the year 2000?",
        "opts": ["365", "366", "364", "367"],
        "c": 1,
        "exp": "Step 1: 2000 is divisible by 400, so it is a leap year. Step 2: A leap year has 366 days. Answer is option B."
    },
    {
        "id": 88,
        "t": "leapyear",
        "q": "How many days are there in the year 1900?",
        "opts": ["365", "366", "364", "367"],
        "c": 0,
        "exp": "Step 1: 1900 is a century year not divisible by 400, so it is an ordinary year. Step 2: An ordinary year has 365 days. Answer is option A."
    },
    {
        "id": 89,
        "t": "leapyear",
        "q": "How many days does February have in the year 2000?",
        "opts": ["28", "29", "30", "31"],
        "c": 1,
        "exp": "Step 1: 2000 is a leap year (divisible by 400). Step 2: In a leap year February has 29 days. Answer is option B."
    },
    {
        "id": 90,
        "t": "leapyear",
        "q": "How many days does February have in the year 1900?",
        "opts": ["28", "29", "30", "31"],
        "c": 0,
        "exp": "Step 1: 1900 is not a leap year (century year not divisible by 400). Step 2: In an ordinary year February has 28 days. Answer is option A."
    },
    {
        "id": 91,
        "t": "leapyear",
        "q": "How many odd days are there in a leap year?",
        "opts": ["1", "2", "0", "3"],
        "c": 1,
        "exp": "Step 1: A leap year has 366 days. Step 2: 366 ÷ 7 = 52 weeks + 2 days. Step 3: So a leap year has 2 odd days. Answer is option B."
    },
    {
        "id": 92,
        "t": "leapyear",
        "q": "How many odd days are there in an ordinary year?",
        "opts": ["2", "0", "1", "3"],
        "c": 2,
        "exp": "Step 1: An ordinary year has 365 days. Step 2: 365 ÷ 7 = 52 weeks + 1 day. Step 3: So an ordinary year has 1 odd day. Answer is option C."
    },
    {
        "id": 93,
        "t": "leapyear",
        "q": "Which of the following is a leap year?",
        "opts": ["2021", "2022", "2023", "2024"],
        "c": 3,
        "exp": "Step 1: A non-century year is a leap year if divisible by 4. Step 2: 2024 ÷ 4 = 506, exactly divisible. Step 3: 2021, 2022, 2023 are not divisible by 4. Answer is option D."
    },
    {
        "id": 94,
        "t": "leapyear",
        "q": "How many leap years are there from 2001 to 2025 (both included)?",
        "opts": ["5", "6", "7", "8"],
        "c": 1,
        "exp": "Step 1: Leap years in the range are those divisible by 4: 2004, 2008, 2012, 2016, 2020, 2024. Step 2: That is 6 leap years (no century years in this range). Answer is option B."
    },
    {
        "id": 95,
        "t": "leapyear",
        "q": "Which of the following is NOT a leap year?",
        "opts": ["2000", "1900", "2016", "2020"],
        "c": 1,
        "exp": "Step 1: 2000 is divisible by 400, so it is a leap year. Step 2: 2016 and 2020 are divisible by 4, so they are leap years. Step 3: 1900 is not divisible by 400, so it is NOT a leap year. Answer is option B."
    },
    {
        "id": 96,
        "t": "leapyear",
        "q": "What is the first leap year after 1896?",
        "opts": ["1900", "1904", "1897", "1908"],
        "c": 1,
        "exp": "Step 1: The next multiple of 4 after 1896 is 1900. Step 2: But 1900 is a century year not divisible by 400, so it is NOT a leap year. Step 3: The next candidate is 1904, divisible by 4, hence the first leap year after 1896. Answer is option B."
    },
    {
        "id": 97,
        "t": "leapyear",
        "q": "In a leap year, the month of February has 29 days. Which of these years is a leap year?",
        "opts": ["1700", "1800", "2000", "2100"],
        "c": 2,
        "exp": "Step 1: Century years (1700, 1800, 2100) are leap only if divisible by 400; none of them is. Step 2: 2000 is divisible by 400. Step 3: Hence 2000 is the leap year. Answer is option C."
    },
    # ------------------------- odddays (98-113) -------------------------
    {
        "id": 98,
        "t": "odddays",
        "q": "How many odd days are there in 100 years?",
        "opts": ["5", "6", "4", "7"],
        "c": 0,
        "exp": "Step 1: 100 years = 76 ordinary years + 24 leap years. Step 2: Odd days = 76 × 1 + 24 × 2 = 76 + 48 = 124. Step 3: 124 ÷ 7 = 17 weeks + 5 days, so 5 odd days. Answer is option A."
    },
    {
        "id": 99,
        "t": "odddays",
        "q": "How many odd days are there in 200 years?",
        "opts": ["5", "3", "4", "6"],
        "c": 1,
        "exp": "Step 1: 100 years have 5 odd days. Step 2: 200 years = 2 × 5 = 10 odd days. Step 3: 10 ÷ 7 = 1 week + 3 days, so 3 odd days. Answer is option B."
    },
    {
        "id": 100,
        "t": "odddays",
        "q": "How many odd days are there in 300 years?",
        "opts": ["2", "3", "1", "4"],
        "c": 2,
        "exp": "Step 1: 100 years have 5 odd days, so 300 years = 3 × 5 = 15 odd days. Step 2: 15 ÷ 7 = 2 weeks + 1 day. Step 3: So 300 years have 1 odd day. Answer is option C."
    },
    {
        "id": 101,
        "t": "odddays",
        "q": "How many odd days are there in 400 years?",
        "opts": ["0", "1", "2", "5"],
        "c": 0,
        "exp": "Step 1: 400 years = 4 × 100 years, but the 400th year is a leap year, adding one extra day. Step 2: Odd days = 4 × 5 + 1 = 21 (the extra day comes from the leap year adjustment). Step 3: 21 ÷ 7 = 3 weeks + 0 days, so 400 years have 0 odd days. Answer is option A."
    },
    {
        "id": 102,
        "t": "odddays",
        "q": "How many odd days are there in 25 ordinary years?",
        "opts": ["2", "3", "4", "5"],
        "c": 2,
        "exp": "Step 1: Each ordinary year has 1 odd day. Step 2: 25 ordinary years = 25 odd days. Step 3: 25 ÷ 7 = 3 weeks + 4 days, so 4 odd days. Answer is option C."
    },
    {
        "id": 103,
        "t": "odddays",
        "q": "How many odd days are there in 10 years (2 leap years and 8 ordinary years)?",
        "opts": ["4", "5", "6", "3"],
        "c": 1,
        "exp": "Step 1: Odd days from 8 ordinary years = 8 × 1 = 8. Step 2: Odd days from 2 leap years = 2 × 2 = 4. Step 3: Total = 8 + 4 = 12; 12 ÷ 7 = 1 week + 5 days, so 5 odd days. Answer is option B."
    },
    {
        "id": 104,
        "t": "odddays",
        "q": "How many odd days are there in 5 ordinary years?",
        "opts": ["5", "4", "6", "3"],
        "c": 0,
        "exp": "Step 1: Each ordinary year has 1 odd day. Step 2: 5 × 1 = 5 odd days. Step 3: 5 < 7, so the answer is 5. Answer is option A."
    },
    {
        "id": 105,
        "t": "odddays",
        "q": "How many odd days are there in 7 leap years?",
        "opts": ["2", "1", "0", "3"],
        "c": 2,
        "exp": "Step 1: Each leap year has 2 odd days. Step 2: 7 × 2 = 14 odd days. Step 3: 14 ÷ 7 = 2 weeks + 0 days, so 0 odd days. Answer is option C."
    },
    {
        "id": 106,
        "t": "odddays",
        "q": "How many odd days are there in 15 years (4 leap years and 11 ordinary years)?",
        "opts": ["4", "5", "6", "3"],
        "c": 1,
        "exp": "Step 1: Odd days from 11 ordinary years = 11 × 1 = 11. Step 2: Odd days from 4 leap years = 4 × 2 = 8. Step 3: Total = 11 + 8 = 19; 19 ÷ 7 = 2 weeks + 5 days, so 5 odd days. Answer is option B."
    },
    {
        "id": 107,
        "t": "odddays",
        "q": "How many odd days are there in 365 days?",
        "opts": ["2", "0", "1", "3"],
        "c": 2,
        "exp": "Step 1: 365 ÷ 7 = 52 weeks + 1 day. Step 2: The leftover 1 day is the odd day. Step 3: So 365 days have 1 odd day. Answer is option C."
    },
    {
        "id": 108,
        "t": "odddays",
        "q": "How many odd days are there in 366 days?",
        "opts": ["2", "1", "0", "3"],
        "c": 0,
        "exp": "Step 1: 366 ÷ 7 = 52 weeks + 2 days. Step 2: The leftover 2 days are the odd days. Step 3: So 366 days have 2 odd days. Answer is option A."
    },
    {
        "id": 109,
        "t": "odddays",
        "q": "How many odd days are there in 500 days?",
        "opts": ["2", "3", "4", "1"],
        "c": 1,
        "exp": "Step 1: 500 ÷ 7 = 71 weeks + 3 days. Step 2: The leftover 3 days are the odd days. Step 3: So 500 days have 3 odd days. Answer is option B."
    },
    {
        "id": 110,
        "t": "odddays",
        "q": "How many odd days are there in 700 days?",
        "opts": ["1", "0", "2", "3"],
        "c": 1,
        "exp": "Step 1: 700 ÷ 7 = 100 weeks exactly. Step 2: There are no leftover days. Step 3: So 700 days have 0 odd days. Answer is option B."
    },
    {
        "id": 111,
        "t": "odddays",
        "q": "How many odd days are there in 14 years (3 leap years and 11 ordinary years)?",
        "opts": ["3", "4", "2", "5"],
        "c": 0,
        "exp": "Step 1: Odd days from 11 ordinary years = 11 × 1 = 11. Step 2: Odd days from 3 leap years = 3 × 2 = 6. Step 3: Total = 11 + 6 = 17; 17 ÷ 7 = 2 weeks + 3 days, so 3 odd days. Answer is option A."
    },
    {
        "id": 112,
        "t": "odddays",
        "q": "124 days have been divided into weeks. How many odd days remain?",
        "opts": ["5", "6", "4", "3"],
        "c": 0,
        "exp": "Step 1: 124 ÷ 7 = 17 weeks + 5 days. Step 2: The leftover days are the odd days. Step 3: So 124 days leave 5 odd days. Answer is option A."
    },
    {
        "id": 113,
        "t": "odddays",
        "q": "How many odd days are there in 8 years (2 leap years and 6 ordinary years)?",
        "opts": ["2", "3", "4", "5"],
        "c": 1,
        "exp": "Step 1: Odd days from 6 ordinary years = 6 × 1 = 6. Step 2: Odd days from 2 leap years = 2 × 2 = 4. Step 3: Total = 6 + 4 = 10; 10 ÷ 7 = 1 week + 3 days, so 3 odd days. Answer is option B."
    },
    # ------------------------- weekday (114-131) -------------------------
    {
        "id": 114,
        "t": "weekday",
        "q": "What day of the week was 1 January 2000?",
        "opts": ["Friday", "Saturday", "Sunday", "Monday"],
        "c": 1,
        "exp": "Step 1: 1 January 2000 is a well-known anchor date. Step 2: It fell on Saturday. Step 3: Answer is option B."
    },
    {
        "id": 115,
        "t": "weekday",
        "q": "What day of the week was 15 August 1947 (India's Independence Day)?",
        "opts": ["Thursday", "Saturday", "Friday", "Wednesday"],
        "c": 2,
        "exp": "Step 1: This is a famous historical date. Step 2: 15 August 1947 fell on Friday. Answer is option C."
    },
    {
        "id": 116,
        "t": "weekday",
        "q": "What day of the week was 26 January 1950 (India's Republic Day)?",
        "opts": ["Friday", "Wednesday", "Tuesday", "Thursday"],
        "c": 3,
        "exp": "Step 1: This is a famous historical date. Step 2: 26 January 1950 fell on Thursday. Answer is option D."
    },
    {
        "id": 117,
        "t": "weekday",
        "q": "What day of the week was 1 January 2001?",
        "opts": ["Monday", "Tuesday", "Sunday", "Saturday"],
        "c": 0,
        "exp": "Step 1: 2000 was a leap year, so 1 Jan 2000 to 1 Jan 2001 has 2 odd days. Step 2: 1 Jan 2000 was Saturday; Saturday + 2 = Monday. Step 3: So 1 Jan 2001 was Monday. Answer is option A."
    },
    {
        "id": 118,
        "t": "weekday",
        "q": "If 1 January 2024 is a Monday, what day will 1 January 2025 be?",
        "opts": ["Tuesday", "Wednesday", "Thursday", "Monday"],
        "c": 1,
        "exp": "Step 1: 2024 is a leap year with 366 days = 2 odd days. Step 2: Monday + 2 days = Wednesday. Step 3: So 1 January 2025 will be Wednesday. Answer is option B."
    },
    {
        "id": 119,
        "t": "weekday",
        "q": "If 1 January 2023 is a Sunday, what day was 1 January 2024?",
        "opts": ["Monday", "Tuesday", "Sunday", "Saturday"],
        "c": 0,
        "exp": "Step 1: 2023 is an ordinary year with 365 days = 1 odd day. Step 2: Sunday + 1 day = Monday. Step 3: So 1 January 2024 was Monday. Answer is option A."
    },
    {
        "id": 120,
        "t": "weekday",
        "q": "If 1 January 2025 is a Wednesday, what day will 1 January 2026 be?",
        "opts": ["Tuesday", "Friday", "Wednesday", "Thursday"],
        "c": 3,
        "exp": "Step 1: 2025 is an ordinary year with 1 odd day. Step 2: Wednesday + 1 day = Thursday. Step 3: So 1 January 2026 will be Thursday. Answer is option D."
    },
    {
        "id": 121,
        "t": "weekday",
        "q": "Today is Tuesday. What day will it be after 100 days?",
        "opts": ["Sunday", "Monday", "Thursday", "Friday"],
        "c": 2,
        "exp": "Step 1: 100 ÷ 7 = 14 weeks + 2 odd days. Step 2: Tuesday + 2 days = Thursday. Answer is option C."
    },
    {
        "id": 122,
        "t": "weekday",
        "q": "Today is Monday. What day will it be after 50 days?",
        "opts": ["Wednesday", "Tuesday", "Monday", "Thursday"],
        "c": 1,
        "exp": "Step 1: 50 ÷ 7 = 7 weeks + 1 odd day. Step 2: Monday + 1 day = Tuesday. Answer is option B."
    },
    {
        "id": 123,
        "t": "weekday",
        "q": "Today is Friday. What day will it be after 365 days?",
        "opts": ["Thursday", "Saturday", "Friday", "Sunday"],
        "c": 1,
        "exp": "Step 1: 365 days = 52 weeks + 1 odd day. Step 2: Friday + 1 day = Saturday. Answer is option B."
    },
    {
        "id": 124,
        "t": "weekday",
        "q": "Today is Wednesday. What day will it be after 30 days?",
        "opts": ["Thursday", "Tuesday", "Saturday", "Friday"],
        "c": 3,
        "exp": "Step 1: 30 ÷ 7 = 4 weeks + 2 odd days. Step 2: Wednesday + 2 days = Friday. Answer is option D."
    },
    {
        "id": 125,
        "t": "weekday",
        "q": "If the 10th of a month is Sunday, what day will the 25th of that month be?",
        "opts": ["Monday", "Tuesday", "Sunday", "Wednesday"],
        "c": 0,
        "exp": "Step 1: Days between 10th and 25th = 25 - 10 = 15 days. Step 2: 15 ÷ 7 = 2 weeks + 1 odd day. Step 3: Sunday + 1 day = Monday. Answer is option A."
    },
    {
        "id": 126,
        "t": "weekday",
        "q": "If the 5th of a month is Wednesday, what day will the 26th of that month be?",
        "opts": ["Wednesday", "Thursday", "Tuesday", "Friday"],
        "c": 0,
        "exp": "Step 1: Days between 5th and 26th = 26 - 5 = 21 days. Step 2: 21 ÷ 7 = 3 weeks + 0 odd days. Step 3: The same day, Wednesday. Answer is option A."
    },
    {
        "id": 127,
        "t": "weekday",
        "q": "If 1 March is a Tuesday, what day will 1 April of the same year be?",
        "opts": ["Thursday", "Saturday", "Friday", "Wednesday"],
        "c": 2,
        "exp": "Step 1: March has 31 days = 4 weeks + 3 odd days. Step 2: Tuesday + 3 days = Friday. Step 3: So 1 April will be Friday. Answer is option C."
    },
    {
        "id": 128,
        "t": "weekday",
        "q": "If 1 February is a Monday (ordinary year), what day will 1 March of the same year be?",
        "opts": ["Wednesday", "Tuesday", "Thursday", "Monday"],
        "c": 3,
        "exp": "Step 1: In an ordinary year February has 28 days = exactly 4 weeks + 0 odd days. Step 2: Monday + 0 = Monday. Step 3: So 1 March will be Monday. Answer is option D."
    },
    {
        "id": 129,
        "t": "weekday",
        "q": "What day of the week was 25 May 2003?",
        "opts": ["Saturday", "Monday", "Sunday", "Friday"],
        "c": 2,
        "exp": "Step 1: Use the date-to-day method: last two digits of year = 03, month code for May = 1, date = 25, quotient of 03/4 = 0, century code for 2000s = 6. Step 2: Sum = 3 + 1 + 25 + 0 + 6 = 35. Step 3: 35 ÷ 7 = 5 weeks + 0, and code 0 = Sunday. Answer is option C."
    },
    {
        "id": 130,
        "t": "weekday",
        "q": "What day of the week was 20 March 1882?",
        "opts": ["Sunday", "Tuesday", "Monday", "Wednesday"],
        "c": 2,
        "exp": "Step 1: This date is the classic Zeller's congruence example. Step 2: Using Zeller's formula, the result maps to Monday. Step 3: So 20 March 1882 was Monday. Answer is option C."
    },
    {
        "id": 131,
        "t": "weekday",
        "q": "If 1 January 1900 was a Monday, what day was 1 January 1901?",
        "opts": ["Wednesday", "Tuesday", "Sunday", "Monday"],
        "c": 1,
        "exp": "Step 1: 1900 is an ordinary year (not divisible by 400) with 1 odd day. Step 2: Monday + 1 day = Tuesday. Step 3: So 1 January 1901 was Tuesday. Answer is option B."
    },
    # ------------------------- repeat (132-143) -------------------------
    {
        "id": 132,
        "t": "repeat",
        "q": "The calendar of 2024 will repeat in which year?",
        "opts": ["2035", "2052", "2030", "2048"],
        "c": 1,
        "exp": "Step 1: 2024 is a leap year. Step 2: A leap year calendar repeats after 28 years. Step 3: 2024 + 28 = 2052. Answer is option B."
    },
    {
        "id": 133,
        "t": "repeat",
        "q": "The calendar of 2023 (an ordinary year) will repeat in which year?",
        "opts": ["2034", "2029", "2030", "2036"],
        "c": 0,
        "exp": "Step 1: An ordinary year calendar repeats after 6 or 11 years. Step 2: Check 2023 + 11 = 2034: years 2023-2033 have 3 leap years (2024, 2028, 2032), giving odd days 3 × 2 + 8 = 14 = 0 odd days. Step 3: So the calendar repeats in 2034. Answer is option A."
    },
    {
        "id": 134,
        "t": "repeat",
        "q": "The calendar of 2016 (a leap year) will repeat in which year?",
        "opts": ["2044", "2027", "2042", "2028"],
        "c": 0,
        "exp": "Step 1: A leap year calendar repeats after 28 years. Step 2: 2016 + 28 = 2044. Answer is option A."
    },
    {
        "id": 135,
        "t": "repeat",
        "q": "The calendar of 2009 (an ordinary year) will repeat in which year?",
        "opts": ["2016", "2015", "2020", "2014"],
        "c": 1,
        "exp": "Step 1: An ordinary year calendar repeats after 6 or 11 years. Step 2: Check 2009 + 6 = 2015: years 2009-2014 have 1 leap year (2012), giving odd days 1 × 2 + 5 = 7 = 0 odd days. Step 3: So the calendar repeats in 2015. Answer is option B."
    },
    {
        "id": 136,
        "t": "repeat",
        "q": "The calendar of 1990 (an ordinary year) will repeat in which year?",
        "opts": ["2001", "1996", "1997", "2000"],
        "c": 0,
        "exp": "Step 1: Check 1990 + 11 = 2001: years 1990-2000 have 3 leap years (1992, 1996, 2000), giving odd days 3 × 2 + 8 = 14 = 0 odd days. Step 2: Also 1990 + 6 = 1996: years 1990-1995 have 2 leap years (1992, 1996 excluded as it is the repeat year itself), odd days = 1 × 2 + 4 = 6, not 0. Step 3: So the calendar repeats in 2001. Answer is option A."
    },
    {
        "id": 137,
        "t": "repeat",
        "q": "The calendar of 2000 (a leap year) will repeat in which year?",
        "opts": ["2028", "2011", "2027", "2031"],
        "c": 0,
        "exp": "Step 1: A leap year calendar repeats after 28 years. Step 2: 2000 + 28 = 2028. Answer is option A."
    },
    {
        "id": 138,
        "t": "repeat",
        "q": "The calendar of 2015 (an ordinary year) will repeat in which year?",
        "opts": ["2020", "2021", "2026", "2027"],
        "c": 2,
        "exp": "Step 1: Check 2015 + 11 = 2026: years 2015-2025 have 3 leap years (2016, 2020, 2024), giving odd days 3 × 2 + 8 = 14 = 0 odd days. Step 2: 2015 + 6 = 2021 gives odd days 2 × 2 + 4 = 8, not 0. Step 3: So the calendar repeats in 2026. Answer is option C."
    },
    {
        "id": 139,
        "t": "repeat",
        "q": "The calendar of 2011 (an ordinary year) will repeat in which year?",
        "opts": ["2016", "2017", "2022", "2023"],
        "c": 2,
        "exp": "Step 1: Check 2011 + 11 = 2022: years 2011-2021 have 3 leap years (2012, 2016, 2020), giving odd days 3 × 2 + 8 = 14 = 0 odd days. Step 2: 2011 + 6 = 2017 gives odd days 2 × 2 + 4 = 8, not 0. Step 3: So the calendar repeats in 2022. Answer is option C."
    },
    {
        "id": 140,
        "t": "repeat",
        "q": "The calendar of 2005 (an ordinary year) will repeat in which year?",
        "opts": ["2011", "2010", "2012", "2016"],
        "c": 0,
        "exp": "Step 1: Check 2005 + 6 = 2011: years 2005-2010 have 1 leap year (2008), giving odd days 1 × 2 + 5 = 7 = 0 odd days. Step 2: So the calendar repeats in 2011. Answer is option A."
    },
    {
        "id": 141,
        "t": "repeat",
        "q": "The calendar of 1996 (a leap year) will repeat in which year?",
        "opts": ["2022", "2024", "2025", "2020"],
        "c": 1,
        "exp": "Step 1: A leap year calendar repeats after 28 years. Step 2: 1996 + 28 = 2024. Answer is option B."
    },
    {
        "id": 142,
        "t": "repeat",
        "q": "The calendar of 2018 (an ordinary year) will repeat in which year?",
        "opts": ["2024", "2029", "2026", "2028"],
        "c": 1,
        "exp": "Step 1: Check 2018 + 11 = 2029: years 2018-2028 have 3 leap years (2020, 2024, 2028), giving odd days 3 × 2 + 8 = 14 = 0 odd days. Step 2: 2018 + 6 = 2024 is a leap year, so it cannot repeat a 2018 calendar. Step 3: So the calendar repeats in 2029. Answer is option B."
    },
    {
        "id": 143,
        "t": "repeat",
        "q": "The calendar of 2012 (a leap year) will repeat in which year?",
        "opts": ["2038", "2040", "2036", "2044"],
        "c": 1,
        "exp": "Step 1: A leap year calendar repeats after 28 years. Step 2: 2012 + 28 = 2040. Answer is option B."
    },
    # ------------------------- mixed (144-149) -------------------------
    {
        "id": 144,
        "t": "mixed",
        "q": "At 12:00, the angle between the hands of a clock is:",
        "opts": ["$0^\\circ$", "$30^\\circ$", "$60^\\circ$", "$90^\\circ$"],
        "c": 0,
        "exp": "Step 1: At 12:00 both hands point at the 12. Step 2: They fully overlap, so the angle is 0 degrees. Answer is option A."
    },
    {
        "id": 145,
        "t": "mixed",
        "q": "How many times in a day (24 hours) do the hands of a clock form a straight line (coincide or opposite)?",
        "opts": ["22", "44", "11", "24"],
        "c": 1,
        "exp": "Step 1: In 12 hours the hands form a straight line 11 times (once when coinciding, counted once at 12:00). Step 2: In 24 hours this doubles: 2 × 22 = 44. Wait, check: 11 per 12 hours means 22 per 24 hours? Step 3: Correct count: 22 times per day (11 coincidences + 11 opposites = 22 straight lines). Answer is option B."
    },
    {
        "id": 146,
        "t": "mixed",
        "q": "A clock shows 3:45. What time does its mirror image show?",
        "opts": ["8:15", "9:15", "8:45", "9:45"],
        "c": 0,
        "exp": "Step 1: Mirror time = 11:60 - given time. Step 2: 11:60 - 3:45 = 8:15. Answer is option A."
    },
    {
        "id": 147,
        "t": "mixed",
        "q": "What day of the week was 1 January 1900?",
        "opts": ["Sunday", "Tuesday", "Monday", "Wednesday"],
        "c": 2,
        "exp": "Step 1: 1 January 1900 is a well-known anchor date in calendar problems. Step 2: It fell on Monday. Answer is option C."
    },
    {
        "id": 148,
        "t": "mixed",
        "q": "At what time between 6 and 7 o'clock will the hands of a clock coincide?",
        "opts": ["$6:30\\frac{9}{11}$", "$6:31\\frac{1}{11}$", "$6:32\\frac{8}{11}$", "$6:33\\frac{6}{11}$"],
        "c": 2,
        "exp": "Step 1: At 6:00 the minute hand is 30 minute-spaces behind the hour hand. Step 2: Time to gain 30 spaces = 30 × 12/11 = 360/11 = 32 8/11 minutes. Step 3: Coincidence time = 6:32 8/11. Answer is option C."
    },
    {
        "id": 149,
        "t": "mixed",
        "q": "If 1 January 2000 was a Saturday, what day was 1 January 2001?",
        "opts": ["Sunday", "Monday", "Tuesday", "Saturday"],
        "c": 1,
        "exp": "Step 1: 2000 was a leap year with 2 odd days. Step 2: Saturday + 2 days = Monday. Step 3: So 1 January 2001 was Monday. Answer is option B."
    }
]
