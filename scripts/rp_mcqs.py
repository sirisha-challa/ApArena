#!/usr/bin/env python3
"""150 MCQs for Ratio & Proportion with detailed step-by-step explanations.
Each: {"id", "t" (filter tag), "q", "opts" (4, latex), "c" (0-based answer index), "exp"}."""

MCQS = [
    {
        "id": 0,
        "t": "basic",
        "q": "Find the ratio between 12 m and 800 cm.",
        "opts": [
            "$2 : 3$",
            "$3 : 2$",
            "$4 : 3$",
            "$3 : 4$"
        ],
        "c": 1,
        "exp": "Step 1: Convert 12 m to cm. 12 m = 1200 cm. Step 2: Ratio = 1200 : 800. Step 3: Divide both terms by 400. Ratio = 3 : 2. Answer is option B."
    },
    {
        "id": 1,
        "t": "basic",
        "q": "Simplify the ratio 45 : 75.",
        "opts": [
            "$3 : 5$",
            "$5 : 3$",
            "$9 : 25$",
            "$3 : 4$"
        ],
        "c": 0,
        "exp": "Step 1: Find the HCF of 45 and 75, which is 15. Step 2: 45 ÷ 15 = 3 and 75 ÷ 15 = 5. Step 3: Simplified ratio = 3 : 5. Answer is option A."
    },
    {
        "id": 2,
        "t": "basic",
        "q": "Find the ratio of 1.5 to 0.75.",
        "opts": [
            "$1 : 2$",
            "$2 : 1$",
            "$3 : 1$",
            "$3 : 2$"
        ],
        "c": 1,
        "exp": "Step 1: Multiply both terms by 100 to remove decimals: 150 : 75. Step 2: Divide both by 75. Ratio = 2 : 1. Answer is option B."
    },
    {
        "id": 3,
        "t": "basic",
        "q": "If a : b = 2 : 3 and a = 40, find b.",
        "opts": [
            "45",
            "50",
            "60",
            "80"
        ],
        "c": 2,
        "exp": "Step 1: a : b = 2 : 3 means a/b = 2/3. Step 2: 40/b = 2/3. Step 3: Cross-multiply: 2b = 120, so b = 60. Answer is option C."
    },
    {
        "id": 4,
        "t": "basic",
        "q": "4 notebooks cost Rs 80. How much will 7 notebooks cost?",
        "opts": [
            "Rs 120",
            "Rs 130",
            "Rs 140",
            "Rs 160"
        ],
        "c": 2,
        "exp": "Step 1: Cost of 1 notebook = 80 ÷ 4 = Rs 20. Step 2: Cost of 7 notebooks = 7 × 20 = Rs 140. Answer is option C."
    },
    {
        "id": 5,
        "t": "basic",
        "q": "If x : y = 3 : 4 and x + y = 28, find x.",
        "opts": [
            "9",
            "12",
            "16",
            "21"
        ],
        "c": 1,
        "exp": "Step 1: Let x = 3k and y = 4k. Step 2: 3k + 4k = 28, so 7k = 28 and k = 4. Step 3: x = 3 × 4 = 12. Answer is option B."
    },
    {
        "id": 6,
        "t": "basic",
        "q": "Reduce 60 paise to Rs 3 to its simplest ratio.",
        "opts": [
            "$1 : 5$",
            "$5 : 1$",
            "$1 : 3$",
            "$3 : 5$"
        ],
        "c": 0,
        "exp": "Step 1: Convert Rs 3 to paise = 300 paise. Step 2: Ratio = 60 : 300. Step 3: Divide both by 60, ratio = 1 : 5. Answer is option A."
    },
    {
        "id": 7,
        "t": "basic",
        "q": "Two numbers are in the ratio 4 : 7 and their difference is 24. Find the numbers.",
        "opts": [
            "24, 42",
            "28, 52",
            "32, 56",
            "36, 63"
        ],
        "c": 2,
        "exp": "Step 1: Let the numbers be 4k and 7k. Step 2: 7k − 4k = 3k = 24, so k = 8. Step 3: Numbers = 4 × 8 = 32 and 7 × 8 = 56. Answer is option C."
    },
    {
        "id": 8,
        "t": "basic",
        "q": "Simplify the ratio 1/2 : 1/3.",
        "opts": [
            "$2 : 3$",
            "$3 : 2$",
            "$1 : 6$",
            "$6 : 1$"
        ],
        "c": 1,
        "exp": "Step 1: Multiply both fractions by the LCM of denominators, 6. Step 2: (1/2 × 6) : (1/3 × 6) = 3 : 2. Answer is option B."
    },
    {
        "id": 9,
        "t": "basic",
        "q": "If a : b = 5 : 6 and b = 18, find a.",
        "opts": [
            "12",
            "15",
            "20",
            "21"
        ],
        "c": 1,
        "exp": "Step 1: a/b = 5/6. Step 2: a/18 = 5/6. Step 3: Cross-multiply: 6a = 90, so a = 15. Answer is option B."
    },
    {
        "id": 10,
        "t": "basic",
        "q": "The angles of a triangle are in the ratio 1 : 2 : 3. Find the largest angle.",
        "opts": [
            "60°",
            "90°",
            "120°",
            "30°"
        ],
        "c": 1,
        "exp": "Step 1: Let angles be k, 2k, 3k. Sum = 6k = 180°, so k = 30°. Step 2: Largest angle = 3k = 90°. Answer is option B."
    },
    {
        "id": 11,
        "t": "basic",
        "q": "Divide 84 in the ratio 5 : 7.",
        "opts": [
            "30, 54",
            "35, 49",
            "40, 44",
            "28, 56"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 5 + 7 = 12. Step 2: Each part = 84 ÷ 12 = 7. Step 3: Parts = 5 × 7 = 35 and 7 × 7 = 49. Answer is option B."
    },
    {
        "id": 12,
        "t": "basic",
        "q": "Simplify 12 : 18 : 24.",
        "opts": [
            "$2 : 3 : 4$",
            "$3 : 2 : 4$",
            "$2 : 4 : 3$",
            "$1 : 2 : 3$"
        ],
        "c": 0,
        "exp": "Step 1: Find the HCF of 12, 18 and 24, which is 6. Step 2: Divide each term by 6: 2 : 3 : 4. Answer is option A."
    },
    {
        "id": 13,
        "t": "basic",
        "q": "If a : b = 7 : 9 and a + b = 64, find b.",
        "opts": [
            "28",
            "32",
            "36",
            "45"
        ],
        "c": 2,
        "exp": "Step 1: Let a = 7k, b = 9k. Sum = 16k = 64, so k = 4. Step 2: b = 9 × 4 = 36. Answer is option C."
    },
    {
        "id": 14,
        "t": "basic",
        "q": "The ratio of speeds of two cars is 60 km/h : 80 km/h. Simplify it.",
        "opts": [
            "$2 : 3$",
            "$3 : 4$",
            "$4 : 5$",
            "$6 : 8$"
        ],
        "c": 1,
        "exp": "Step 1: Ratio = 60 : 80. Step 2: Divide both by 20. Ratio = 3 : 4. Answer is option B."
    },
    {
        "id": 15,
        "t": "basic",
        "q": "A sum of Rs 250 is split such that A gets 2/5 of it. What does A get?",
        "opts": [
            "Rs 50",
            "Rs 75",
            "Rs 100",
            "Rs 150"
        ],
        "c": 2,
        "exp": "Step 1: A's share = (2/5) × 250. Step 2: 250 ÷ 5 = 50, then 50 × 2 = Rs 100. Answer is option C."
    },
    {
        "id": 16,
        "t": "basic",
        "q": "Find the ratio of 25 minutes to 1 hour 40 minutes.",
        "opts": [
            "$1 : 4$",
            "$4 : 1$",
            "$1 : 3$",
            "$3 : 1$"
        ],
        "c": 0,
        "exp": "Step 1: Convert 1 hr 40 min = 100 minutes. Step 2: Ratio = 25 : 100 = 1 : 4. Answer is option A."
    },
    {
        "id": 17,
        "t": "basic",
        "q": "If x : y = 3 : 5 and x + y = 56, find y.",
        "opts": [
            "21",
            "30",
            "35",
            "45"
        ],
        "c": 2,
        "exp": "Step 1: x = 3k, y = 5k. Sum = 8k = 56, so k = 7. Step 2: y = 5 × 7 = 35. Answer is option C."
    },
    {
        "id": 18,
        "t": "basic",
        "q": "Express 3 : 5 as a fraction and as a percentage.",
        "opts": [
            "$3/5,\\ 60\\%$",
            "$5/3,\\ 60\\%$",
            "$3/5,\\ 40\\%$",
            "$3/5,\\ 66.6\\%$"
        ],
        "c": 0,
        "exp": "Step 1: Ratio 3 : 5 is the fraction 3/5. Step 2: Percentage = (3/5) × 100 = 60%. Answer is option A."
    },
    {
        "id": 19,
        "t": "basic",
        "q": "Two numbers are in the ratio 2 : 3. If 8 is added to each, the new numbers are in the ratio 3 : 4. Find the smaller number.",
        "opts": [
            "12",
            "16",
            "18",
            "24"
        ],
        "c": 1,
        "exp": "Step 1: Let numbers be 2k and 3k. Step 2: (2k+8)/(3k+8) = 3/4. Step 3: 4(2k+8) = 3(3k+8), so 8k+32 = 9k+24, giving k = 8. Step 4: Smaller number = 2 × 8 = 16. Answer is option B."
    },
    {
        "id": 20,
        "t": "types",
        "q": "Find the duplicate ratio of 3 : 5.",
        "opts": [
            "$6 : 10$",
            "$9 : 25$",
            "$9 : 15$",
            "$27 : 125$"
        ],
        "c": 1,
        "exp": "Step 1: Duplicate ratio means squaring both terms. Step 2: 3² : 5² = 9 : 25. Answer is option B."
    },
    {
        "id": 21,
        "t": "types",
        "q": "Find the sub-duplicate ratio of 16 : 25.",
        "opts": [
            "$4 : 5$",
            "$256 : 625$",
            "$2 : 5$",
            "$4 : 25$"
        ],
        "c": 0,
        "exp": "Step 1: Sub-duplicate ratio means taking the square root of both terms. Step 2: √16 : √25 = 4 : 5. Answer is option A."
    },
    {
        "id": 22,
        "t": "types",
        "q": "Find the triplicate ratio of 2 : 3.",
        "opts": [
            "$4 : 9$",
            "$8 : 27$",
            "$6 : 9$",
            "$8 : 9$"
        ],
        "c": 1,
        "exp": "Step 1: Triplicate ratio means cubing both terms. Step 2: 2³ : 3³ = 8 : 27. Answer is option B."
    },
    {
        "id": 23,
        "t": "types",
        "q": "Find the sub-triplicate ratio of 27 : 64.",
        "opts": [
            "$9 : 16$",
            "$3 : 4$",
            "$81 : 256$",
            "$27 : 8$"
        ],
        "c": 1,
        "exp": "Step 1: Sub-triplicate means taking the cube root of both terms. Step 2: ³√27 : ³√64 = 3 : 4. Answer is option B."
    },
    {
        "id": 24,
        "t": "types",
        "q": "Find the inverse ratio of 7 : 9.",
        "opts": [
            "$7 : 9$",
            "$9 : 7$",
            "$49 : 81$",
            "$7 : 2$"
        ],
        "c": 1,
        "exp": "Step 1: Inverse ratio is obtained by swapping the terms. Step 2: Inverse of 7 : 9 = 9 : 7. Answer is option B."
    },
    {
        "id": 25,
        "t": "types",
        "q": "Find the compound ratio of (2 : 3), (4 : 5) and (6 : 7).",
        "opts": [
            "$16 : 35$",
            "$12 : 15$",
            "$48 : 105$",
            "$2 : 7$"
        ],
        "c": 0,
        "exp": "Step 1: Multiply the first terms: 2 × 4 × 6 = 48. Step 2: Multiply the second terms: 3 × 5 × 7 = 105. Step 3: Compound ratio = 48 : 105. Step 4: Divide both by 3, ratio = 16 : 35. Answer is option A."
    },
    {
        "id": 26,
        "t": "types",
        "q": "The duplicate ratio of 5 : 6 is:",
        "opts": [
            "$25 : 36$",
            "$10 : 12$",
            "$125 : 216$",
            "$5 : 6$"
        ],
        "c": 0,
        "exp": "Step 1: Square both terms. Step 2: 5² : 6² = 25 : 36. Answer is option A."
    },
    {
        "id": 27,
        "t": "types",
        "q": "The sub-duplicate ratio of 9 : 16 is:",
        "opts": [
            "$81 : 256$",
            "$3 : 4$",
            "$9 : 4$",
            "$18 : 32$"
        ],
        "c": 1,
        "exp": "Step 1: Take the square root of each term. Step 2: √9 : √16 = 3 : 4. Answer is option B."
    },
    {
        "id": 28,
        "t": "types",
        "q": "Find the triplicate ratio of 1 : 2.",
        "opts": [
            "$1 : 4$",
            "$1 : 8$",
            "$1 : 6$",
            "$2 : 1$"
        ],
        "c": 1,
        "exp": "Step 1: Cube both terms. Step 2: 1³ : 2³ = 1 : 8. Answer is option B."
    },
    {
        "id": 29,
        "t": "types",
        "q": "Find the compound ratio of (5 : 6) and (8 : 9).",
        "opts": [
            "$40 : 54$",
            "$20 : 27$",
            "$13 : 15$",
            "$5 : 9$"
        ],
        "c": 1,
        "exp": "Step 1: Multiply first terms: 5 × 8 = 40. Step 2: Multiply second terms: 6 × 9 = 54. Step 3: Ratio = 40 : 54. Step 4: Divide both by 2, ratio = 20 : 27. Answer is option B."
    },
    {
        "id": 30,
        "t": "types",
        "q": "Find the duplicate of the inverse of 2 : 3.",
        "opts": [
            "$4 : 9$",
            "$9 : 4$",
            "$2 : 3$",
            "$3 : 2$"
        ],
        "c": 1,
        "exp": "Step 1: Inverse of 2 : 3 = 3 : 2. Step 2: Duplicate means squaring: 3² : 2² = 9 : 4. Answer is option B."
    },
    {
        "id": 31,
        "t": "types",
        "q": "The ratio of the squares of 4 and 9 is called the ___ of 4 : 9.",
        "opts": [
            "Triplicate",
            "Duplicate",
            "Inverse",
            "Compound"
        ],
        "c": 1,
        "exp": "Step 1: The ratio of squares of two numbers is called the duplicate ratio. Step 2: Here it is 16 : 81. Answer is option B."
    },
    {
        "id": 32,
        "t": "proportion",
        "q": "Find x if x : 5 = 10 : 25.",
        "opts": [
            "1",
            "2",
            "5",
            "10"
        ],
        "c": 1,
        "exp": "Step 1: In a proportion, product of extremes = product of means. Step 2: x × 25 = 5 × 10 = 50. Step 3: x = 50/25 = 2. Answer is option B."
    },
    {
        "id": 33,
        "t": "proportion",
        "q": "Are 3 : 5 and 9 : 15 in proportion?",
        "opts": [
            "Yes",
            "No",
            "Cannot say",
            "Only if reversed"
        ],
        "c": 0,
        "exp": "Step 1: Check 3 × 15 = 45 and 5 × 9 = 45. Step 2: Products are equal, so yes, they are in proportion. Answer is option A."
    },
    {
        "id": 34,
        "t": "proportion",
        "q": "Find x if 4 : 9 = 12 : x.",
        "opts": [
            "24",
            "27",
            "30",
            "36"
        ],
        "c": 1,
        "exp": "Step 1: 4/9 = 12/x. Step 2: Cross-multiply: 4x = 9 × 12 = 108. Step 3: x = 108/4 = 27. Answer is option B."
    },
    {
        "id": 35,
        "t": "proportion",
        "q": "Which pair is in proportion: 2 : 4 :: ?",
        "opts": [
            "$3 : 7$",
            "$5 : 10$",
            "$4 : 6$",
            "$6 : 9$"
        ],
        "c": 1,
        "exp": "Step 1: 2 : 4 simplifies to 1 : 2. Step 2: Check options: 5 : 10 also simplifies to 1 : 2. Step 3: So 2 : 4 :: 5 : 10. Answer is option B."
    },
    {
        "id": 36,
        "t": "proportion",
        "q": "Find x if x : 6 = 8 : 12.",
        "opts": [
            "3",
            "4",
            "5",
            "6"
        ],
        "c": 1,
        "exp": "Step 1: x/6 = 8/12. Step 2: Simplify 8/12 = 2/3. Step 3: x = 6 × (2/3) = 4. Answer is option B."
    },
    {
        "id": 37,
        "t": "proportion",
        "q": "Are 5 : 8 and 10 : 16 in proportion?",
        "opts": [
            "Yes",
            "No",
            "Cannot say",
            "Only 10 : 16"
        ],
        "c": 0,
        "exp": "Step 1: Check 5 × 16 = 80 and 8 × 10 = 80. Step 2: Products are equal, so yes. Answer is option A."
    },
    {
        "id": 38,
        "t": "proportion",
        "q": "Find x if 7 : 14 = x : 8.",
        "opts": [
            "2",
            "3",
            "4",
            "6"
        ],
        "c": 2,
        "exp": "Step 1: 7/14 = x/8, simplify 7/14 = 1/2. Step 2: x = 8 × (1/2) = 4. Answer is option C."
    },
    {
        "id": 39,
        "t": "proportion",
        "q": "Check if 3 : 5 :: 12 : 20 holds.",
        "opts": [
            "Yes",
            "No",
            "Cannot say",
            "Needs 15"
        ],
        "c": 0,
        "exp": "Step 1: Check extremes: 3 × 20 = 60. Step 2: Check means: 5 × 12 = 60. Step 3: Equal, so yes. Answer is option A."
    },
    {
        "id": 40,
        "t": "proportion",
        "q": "Find x if 3 : 7 = 9 : x.",
        "opts": [
            "18",
            "21",
            "24",
            "27"
        ],
        "c": 1,
        "exp": "Step 1: 3/7 = 9/x. Step 2: Cross-multiply: 3x = 63. Step 3: x = 63/3 = 21. Answer is option B."
    },
    {
        "id": 41,
        "t": "proportion",
        "q": "Find x if 2 : 3 = x : 18.",
        "opts": [
            "9",
            "10",
            "12",
            "14"
        ],
        "c": 2,
        "exp": "Step 1: 2/3 = x/18. Step 2: Cross-multiply: 3x = 36. Step 3: x = 12. Answer is option C."
    },
    {
        "id": 42,
        "t": "proportion",
        "q": "Find the mean proportional between 4 and 9.",
        "opts": [
            "5",
            "6",
            "6.5",
            "7"
        ],
        "c": 1,
        "exp": "Step 1: Mean proportional = √(a × b). Step 2: √(4 × 9) = √36 = 6. Answer is option B."
    },
    {
        "id": 43,
        "t": "proportion",
        "q": "Find the third proportional to 4 and 12.",
        "opts": [
            "28",
            "32",
            "36",
            "48"
        ],
        "c": 2,
        "exp": "Step 1: Third proportional s satisfies 4 : 12 = 12 : s. Step 2: 4s = 12 × 12 = 144. Step 3: s = 144/4 = 36. Answer is option C."
    },
    {
        "id": 44,
        "t": "proportion",
        "q": "Find the fourth proportional to 3, 5 and 6.",
        "opts": [
            "8",
            "10",
            "12",
            "15"
        ],
        "c": 1,
        "exp": "Step 1: Let it be y: 3 : 5 = 6 : y. Step 2: 3y = 5 × 6 = 30. Step 3: y = 30/3 = 10. Answer is option B."
    },
    {
        "id": 45,
        "t": "proportion",
        "q": "Find the mean proportional between 8 and 18.",
        "opts": [
            "10",
            "12",
            "13",
            "14"
        ],
        "c": 1,
        "exp": "Step 1: Mean proportional = √(a × b) = √(8 × 18). Step 2: √144 = 12. Answer is option B."
    },
    {
        "id": 46,
        "t": "proportion",
        "q": "Find the third proportional to 2 and 8.",
        "opts": [
            "16",
            "24",
            "32",
            "40"
        ],
        "c": 2,
        "exp": "Step 1: Third proportional s satisfies 2 : 8 = 8 : s. Step 2: 2s = 64. Step 3: s = 32. Answer is option C."
    },
    {
        "id": 47,
        "t": "proportion",
        "q": "Find the fourth proportional to 2, 3 and 8.",
        "opts": [
            "10",
            "12",
            "14",
            "16"
        ],
        "c": 1,
        "exp": "Step 1: Let it be y: 2 : 3 = 8 : y. Step 2: 2y = 3 × 8 = 24. Step 3: y = 12. Answer is option B."
    },
    {
        "id": 48,
        "t": "proportion",
        "q": "Find the mean proportional between 0.5 and 2.",
        "opts": [
            "0.75",
            "1",
            "1.25",
            "1.5"
        ],
        "c": 1,
        "exp": "Step 1: Mean proportional = √(0.5 × 2) = √1. Step 2: = 1. Answer is option B."
    },
    {
        "id": 49,
        "t": "proportion",
        "q": "Find the third proportional to 9 and 15.",
        "opts": [
            "21",
            "24",
            "25",
            "27"
        ],
        "c": 2,
        "exp": "Step 1: Third proportional s: 9 : 15 = 15 : s. Step 2: 9s = 225. Step 3: s = 25. Answer is option C."
    },
    {
        "id": 50,
        "t": "proportion",
        "q": "Find the fourth proportional to 5, 6 and 10.",
        "opts": [
            "10",
            "11",
            "12",
            "13"
        ],
        "c": 2,
        "exp": "Step 1: Let it be y: 5 : 6 = 10 : y. Step 2: 5y = 6 × 10 = 60. Step 3: y = 60/5 = 12. Answer is option C."
    },
    {
        "id": 51,
        "t": "proportion",
        "q": "The mean proportional between two numbers is 12 and their product is 144. The numbers are:",
        "opts": [
            "8, 18",
            "9, 16",
            "6, 24",
            "10, 14.4"
        ],
        "c": 1,
        "exp": "Step 1: Mean proportional m satisfies m² = a × b. Step 2: 12² = 144 = a × b. Step 3: Among options, 9 × 16 = 144. Answer is option B."
    },
    {
        "id": 52,
        "t": "division",
        "q": "Divide Rs 981 in the ratio 5 : 4.",
        "opts": [
            "545, 436",
            "540, 441",
            "550, 431",
            "535, 446"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 5 + 4 = 9. Step 2: One part = 981/9 = 109. Step 3: Shares = 5 × 109 = 545 and 4 × 109 = 436. Answer is option A."
    },
    {
        "id": 53,
        "t": "division",
        "q": "Divide Rs 1040 in the ratio 5 : 8.",
        "opts": [
            "400, 640",
            "440, 600",
            "390, 650",
            "500, 540"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 13. Step 2: One part = 1040/13 = 80. Step 3: Shares = 5 × 80 = 400 and 8 × 80 = 640. Answer is option A."
    },
    {
        "id": 54,
        "t": "division",
        "q": "Divide Rs 300 among A, B, C in the ratio 1 : 2 : 3.",
        "opts": [
            "40, 80, 180",
            "50, 100, 150",
            "60, 90, 150",
            "45, 105, 150"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 1 + 2 + 3 = 6. Step 2: One part = 300/6 = 50. Step 3: Shares = 50, 100, 150. Answer is option B."
    },
    {
        "id": 55,
        "t": "division",
        "q": "Divide Rs 600 in the ratio 2 : 3.",
        "opts": [
            "200, 400",
            "240, 360",
            "250, 350",
            "220, 380"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 5. Step 2: One part = 600/5 = 120. Step 3: Shares = 2 × 120 = 240 and 3 × 120 = 360. Answer is option B."
    },
    {
        "id": 56,
        "t": "division",
        "q": "Divide 100 into two parts proportional to 3 : 5.",
        "opts": [
            "37.5, 62.5",
            "40, 60",
            "35, 65",
            "30, 70"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 8. Step 2: One part = 100/8 = 12.5. Step 3: Shares = 3 × 12.5 = 37.5 and 5 × 12.5 = 62.5. Answer is option A."
    },
    {
        "id": 57,
        "t": "division",
        "q": "A and B share Rs 900 in the ratio 4 : 5. What is A's share?",
        "opts": [
            "400",
            "450",
            "500",
            "360"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 9. Step 2: One part = 900/9 = 100. Step 3: A's share = 4 × 100 = Rs 400. Answer is option A."
    },
    {
        "id": 58,
        "t": "division",
        "q": "Divide Rs 72 in the ratio 5 : 3.",
        "opts": [
            "42, 30",
            "45, 27",
            "40, 32",
            "50, 22"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 8. Step 2: One part = 72/8 = 9. Step 3: Shares = 5 × 9 = 45 and 3 × 9 = 27. Answer is option B."
    },
    {
        "id": 59,
        "t": "division",
        "q": "Divide Rs 8000 in the ratio 3 : 5.",
        "opts": [
            "3000, 5000",
            "3200, 4800",
            "2800, 5200",
            "4000, 4000"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 8. Step 2: One part = 8000/8 = 1000. Step 3: Shares = 3 × 1000 = 3000 and 5 × 1000 = 5000. Answer is option A."
    },
    {
        "id": 60,
        "t": "division",
        "q": "Divide Rs 240 in the ratio 7 : 5.",
        "opts": [
            "130, 110",
            "140, 100",
            "150, 90",
            "120, 120"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 12. Step 2: One part = 240/12 = 20. Step 3: Shares = 7 × 20 = 140 and 5 × 20 = 100. Answer is option B."
    },
    {
        "id": 61,
        "t": "division",
        "q": "Divide Rs 4500 in the ratio 2 : 3 : 4.",
        "opts": [
            "900, 1350, 2250",
            "1000, 1500, 2000",
            "800, 1700, 2000",
            "1200, 1500, 1800"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 9. Step 2: One part = 4500/9 = 500. Step 3: Shares = 2 × 500 = 1000, 3 × 500 = 1500, 4 × 500 = 2000. Answer is option B."
    },
    {
        "id": 62,
        "t": "division",
        "q": "Divide Rs 360 in the ratio 5 : 7.",
        "opts": [
            "150, 210",
            "160, 200",
            "140, 220",
            "130, 230"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 12. Step 2: One part = 360/12 = 30. Step 3: Shares = 5 × 30 = 150 and 7 × 30 = 210. Answer is option A."
    },
    {
        "id": 63,
        "t": "division",
        "q": "Two parts of 88 are in the ratio 3 : 5. Find the parts.",
        "opts": [
            "30, 58",
            "33, 55",
            "36, 52",
            "24, 64"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 8. Step 2: One part = 88/8 = 11. Step 3: Parts = 3 × 11 = 33 and 5 × 11 = 55. Answer is option B."
    },
    {
        "id": 64,
        "t": "division",
        "q": "Rs 1500 is divided among A, B, C in 2 : 3 : 5. Find B's share.",
        "opts": [
            "300",
            "400",
            "450",
            "500"
        ],
        "c": 2,
        "exp": "Step 1: Total parts = 10. Step 2: One part = 1500/10 = 150. Step 3: B's share = 3 × 150 = Rs 450. Answer is option C."
    },
    {
        "id": 65,
        "t": "division",
        "q": "Divide Rs 120 in the ratio 1 : 2 : 3.",
        "opts": [
            "20, 40, 60",
            "15, 45, 60",
            "30, 30, 60",
            "10, 50, 60"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 6. Step 2: One part = 120/6 = 20. Step 3: Shares = 20, 40, 60. Answer is option A."
    },
    {
        "id": 66,
        "t": "division",
        "q": "Two numbers are in the ratio 2 : 3 and their sum is 60. Find the numbers.",
        "opts": [
            "20, 40",
            "24, 36",
            "18, 42",
            "30, 30"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 5. Step 2: One part = 60/5 = 12. Step 3: Numbers = 2 × 12 = 24 and 3 × 12 = 36. Answer is option B."
    },
    {
        "id": 67,
        "t": "division",
        "q": "Divide Rs 540 in the ratio 4 : 5.",
        "opts": [
            "240, 300",
            "250, 290",
            "220, 320",
            "260, 280"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 9. Step 2: One part = 540/9 = 60. Step 3: Shares = 4 × 60 = 240 and 5 × 60 = 300. Answer is option A."
    },
    {
        "id": 68,
        "t": "division",
        "q": "Divide Rs 720 in the ratio 7 : 9.",
        "opts": [
            "300, 420",
            "315, 405",
            "330, 390",
            "280, 440"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 16. Step 2: One part = 720/16 = 45. Step 3: Shares = 7 × 45 = 315 and 9 × 45 = 405. Answer is option B."
    },
    {
        "id": 69,
        "t": "division",
        "q": "Rs 900 is divided in the ratio 3 : 4 : 5. What is the middle share?",
        "opts": [
            "225",
            "300",
            "375",
            "450"
        ],
        "c": 1,
        "exp": "Step 1: Total parts = 12. Step 2: One part = 900/12 = 75. Step 3: Middle share = 4 × 75 = Rs 300. Answer is option B."
    },
    {
        "id": 70,
        "t": "division",
        "q": "Divide Rs 60 in the ratio 2 : 3 : 5.",
        "opts": [
            "12, 18, 30",
            "10, 20, 30",
            "15, 15, 30",
            "12, 24, 24"
        ],
        "c": 0,
        "exp": "Step 1: Total parts = 10. Step 2: One part = 60/10 = 6. Step 3: Shares = 2 × 6 = 12, 3 × 6 = 18, 5 × 6 = 30. Answer is option A."
    },
    {
        "id": 71,
        "t": "division",
        "q": "A sum of money is divided between P and Q in 3 : 2. P gets Rs 270. Find the total sum.",
        "opts": [
            "Rs 360",
            "Rs 405",
            "Rs 450",
            "Rs 480"
        ],
        "c": 2,
        "exp": "Step 1: P gets 3 parts = 270, so 1 part = 90. Step 2: Total parts = 5, so total = 5 × 90 = Rs 450. Answer is option C."
    },
    {
        "id": 72,
        "t": "combined",
        "q": "If a : b = 2 : 3 and b : c = 4 : 5, find a : b : c.",
        "opts": [
            "$8 : 12 : 15$",
            "$10 : 15 : 20$",
            "$6 : 8 : 10$",
            "$2 : 3 : 5$"
        ],
        "c": 0,
        "exp": "Step 1: b is 3 in the first and 4 in the second; LCM(3,4) = 12. Step 2: a : b = 8 : 12 and b : c = 12 : 15. Step 3: a : b : c = 8 : 12 : 15. Answer is option A."
    },
    {
        "id": 73,
        "t": "combined",
        "q": "If a : b = 3 : 4 and b : c = 6 : 7, find a : b : c.",
        "opts": [
            "$9 : 12 : 14$",
            "$18 : 24 : 28$",
            "$3 : 6 : 7$",
            "$9 : 12 : 7$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(4,6) = 12. Step 2: a : b = 9 : 12 and b : c = 12 : 14. Step 3: a : b : c = 9 : 12 : 14. Answer is option A."
    },
    {
        "id": 74,
        "t": "combined",
        "q": "If a : b = 1 : 2 and b : c = 2 : 3, find a : b : c.",
        "opts": [
            "$1 : 2 : 3$",
            "$1 : 2 : 6$",
            "$2 : 4 : 3$",
            "$1 : 4 : 3$"
        ],
        "c": 0,
        "exp": "Step 1: b already matches: b = 2 in both. Step 2: a : b : c = 1 : 2 : 3. Answer is option A."
    },
    {
        "id": 75,
        "t": "combined",
        "q": "If a : b = 5 : 7 and b : c = 8 : 9, find a : b : c.",
        "opts": [
            "$40 : 56 : 63$",
            "$35 : 56 : 63$",
            "$40 : 63 : 56$",
            "$5 : 8 : 9$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(7,8) = 56. Step 2: a : b = 40 : 56 and b : c = 56 : 63. Step 3: a : b : c = 40 : 56 : 63. Answer is option A."
    },
    {
        "id": 76,
        "t": "combined",
        "q": "If a : b = 2 : 3 and b : c = 4 : 9, find a : b : c.",
        "opts": [
            "$8 : 12 : 27$",
            "$8 : 12 : 36$",
            "$2 : 4 : 9$",
            "$6 : 12 : 27$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(3,4) = 12. Step 2: a : b = 8 : 12 and b : c = 12 : 27. Step 3: a : b : c = 8 : 12 : 27. Answer is option A."
    },
    {
        "id": 77,
        "t": "combined",
        "q": "If a : b : c = 4 : 5 : 6, find a : b and b : c.",
        "opts": [
            "$4:5,\\ 5:6$",
            "$5:4,\\ 6:5$",
            "$4:6,\\ 5:6$",
            "$4:5,\\ 6:5$"
        ],
        "c": 0,
        "exp": "Step 1: Read the combined ratio directly. Step 2: a : b = 4 : 5 and b : c = 5 : 6. Answer is option A."
    },
    {
        "id": 78,
        "t": "combined",
        "q": "If a : b = 3 : 5 and b : c = 5 : 7, find a : c.",
        "opts": [
            "$3 : 7$",
            "$5 : 7$",
            "$3 : 5$",
            "$9 : 25$"
        ],
        "c": 0,
        "exp": "Step 1: b is 5 in both ratios. Step 2: a : b : c = 3 : 5 : 7. Step 3: a : c = 3 : 7. Answer is option A."
    },
    {
        "id": 79,
        "t": "combined",
        "q": "If a : b = 2 : 3 and b : c = 3 : 4, find a : c.",
        "opts": [
            "$1 : 2$",
            "$2 : 4$",
            "$2 : 3$",
            "$1 : 4$"
        ],
        "c": 0,
        "exp": "Step 1: b = 3 in both ratios. Step 2: a : b : c = 2 : 3 : 4. Step 3: a : c = 2 : 4 = 1 : 2. Answer is option A."
    },
    {
        "id": 80,
        "t": "combined",
        "q": "If a : b = 6 : 7 and b : c = 14 : 15, find a : c.",
        "opts": [
            "$4 : 5$",
            "$6 : 15$",
            "$12 : 15$",
            "$3 : 4$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(7,14) = 14. Step 2: a : b = 12 : 14 and b : c = 14 : 15. Step 3: a : c = 12 : 15 = 4 : 5. Answer is option A."
    },
    {
        "id": 81,
        "t": "combined",
        "q": "If x : y = 4 : 5 and y : z = 10 : 13, find x : z.",
        "opts": [
            "$8 : 13$",
            "$4 : 13$",
            "$10 : 13$",
            "$8 : 15$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(5,10) = 10. Step 2: x : y = 8 : 10 and y : z = 10 : 13. Step 3: x : z = 8 : 13. Answer is option A."
    },
    {
        "id": 82,
        "t": "combined",
        "q": "If a : b = 7 : 9 and b : c = 6 : 11, find a : b : c.",
        "opts": [
            "$42 : 54 : 99$",
            "$14 : 18 : 33$",
            "$7 : 6 : 11$",
            "$49 : 54 : 99$"
        ],
        "c": 1,
        "exp": "Step 1: LCM(9,6) = 18. Step 2: a : b = 14 : 18 and b : c = 18 : 33. Step 3: a : b : c = 14 : 18 : 33. Answer is option B."
    },
    {
        "id": 83,
        "t": "combined",
        "q": "If a : b = 3 : 4 and b : c = 5 : 6, find a : b : c.",
        "opts": [
            "$15 : 20 : 24$",
            "$12 : 16 : 24$",
            "$3 : 5 : 6$",
            "$15 : 24 : 20$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(4,5) = 20. Step 2: a : b = 15 : 20 and b : c = 20 : 24. Step 3: a : b : c = 15 : 20 : 24. Answer is option A."
    },
    {
        "id": 84,
        "t": "combined",
        "q": "If a : b = 2 : 3 and b : c = 9 : 10, find a : b : c.",
        "opts": [
            "$6 : 9 : 10$",
            "$18 : 27 : 30$",
            "$2 : 9 : 10$",
            "$6 : 10 : 9$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(3,9) = 9. Step 2: a : b = 6 : 9 and b : c = 9 : 10. Step 3: a : b : c = 6 : 9 : 10. Answer is option A."
    },
    {
        "id": 85,
        "t": "combined",
        "q": "If a : b = 4 : 9 and b : c = 3 : 5, find a : b : c.",
        "opts": [
            "$4 : 9 : 15$",
            "$12 : 27 : 45$",
            "$4 : 3 : 5$",
            "$4 : 9 : 3$"
        ],
        "c": 1,
        "exp": "Step 1: LCM(9,3) = 9. Step 2: a : b = 4 : 9 and b : c = 9 : 15. Step 3: a : b : c = 4 : 9 : 15. Answer is option B."
    },
    {
        "id": 86,
        "t": "combined",
        "q": "If a : b = 5 : 6 and b : c = 4 : 7, find a : b : c.",
        "opts": [
            "$10 : 12 : 21$",
            "$20 : 24 : 42$",
            "$5 : 4 : 7$",
            "$10 : 21 : 12$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(6,4) = 12. Step 2: a : b = 10 : 12 and b : c = 12 : 21. Step 3: a : b : c = 10 : 12 : 21. Answer is option A."
    },
    {
        "id": 87,
        "t": "combined",
        "q": "If a : b : c = 3 : 4 : 5 and a + c = 40, find b.",
        "opts": [
            "16",
            "18",
            "20",
            "24"
        ],
        "c": 2,
        "exp": "Step 1: a = 3k, c = 5k, so a + c = 8k = 40, giving k = 5. Step 2: b = 4k = 4 × 5 = 20. Answer is option C."
    },
    {
        "id": 88,
        "t": "combined",
        "q": "If a : b = 8 : 15 and b : c = 5 : 8, find a : c.",
        "opts": [
            "$1 : 3$",
            "$3 : 1$",
            "$8 : 8$",
            "$8 : 5$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(15,5) = 15. Step 2: a : b = 8 : 15 and b : c = 15 : 24. Step 3: a : c = 8 : 24 = 1 : 3. Answer is option A."
    },
    {
        "id": 89,
        "t": "combined",
        "q": "If A : B = 2 : 3, B : C = 4 : 5, C : D = 6 : 7, find A : D.",
        "opts": [
            "$16 : 35$",
            "$48 : 105$",
            "$8 : 35$",
            "$24 : 35$"
        ],
        "c": 0,
        "exp": "Step 1: LCM(3,4,6) = 12. Step 2: A : B = 8 : 12, B : C = 12 : 15, C : D = 15 : 17.5 — instead scale directly: A=2×4×6=48 units, D=3×5×7=105. Step 3: A : D = 48 : 105 = 16 : 35. Answer is option A."
    },
    {
        "id": 90,
        "t": "coins",
        "q": "A bag contains 50p, 25p and 10p coins in the ratio 2 : 5 : 3, amounting to Rs 510. Find the number of 50p coins.",
        "opts": [
            "200",
            "400",
            "500",
            "600"
        ],
        "c": 1,
        "exp": "Step 1: Let counts be 2k, 5k, 3k. Step 2: Value = 0.5×2k + 0.25×5k + 0.1×3k = k + 1.25k + 0.3k = 2.55k. Step 3: 2.55k = 510, so k = 200. Step 4: 50p coins = 2k = 400. Answer is option B."
    },
    {
        "id": 91,
        "t": "coins",
        "q": "A bag contains an equal number of 25p, 50p and 1 rupee coins. The total value is Rs 105. How many coins of each type?",
        "opts": [
            "45",
            "50",
            "60",
            "75"
        ],
        "c": 2,
        "exp": "Step 1: Let the equal count be k. Step 2: Value = 0.25k + 0.5k + 1k = 1.75k = 105. Step 3: k = 105/1.75 = 60. Answer is option C."
    },
    {
        "id": 92,
        "t": "coins",
        "q": "The values of 50p and 25p coins in a purse are in the ratio 2 : 3. Find the ratio of their counts.",
        "opts": [
            "$2 : 3$",
            "$3 : 2$",
            "$1 : 3$",
            "$4 : 3$"
        ],
        "c": 2,
        "exp": "Step 1: Count = value ÷ coin size. Step 2: Counts = (2/0.5) : (3/0.25) = 4 : 12. Step 3: Simplify = 1 : 3. Answer is option C."
    },
    {
        "id": 93,
        "t": "coins",
        "q": "A purse has 1 rupee, 50p and 25p coins whose VALUES are in the ratio 11 : 9 : 5. The total number of coins is 490. Find the number of 50p coins.",
        "opts": [
            "150",
            "160",
            "180",
            "200"
        ],
        "c": 2,
        "exp": "Step 1: Counts = 11 : (9/0.5) : (5/0.25) = 11 : 18 : 20. Step 2: Total units = 49 = 490, so 1 unit = 10. Step 3: 50p coins = 18 × 10 = 180. Answer is option C."
    },
    {
        "id": 94,
        "t": "coins",
        "q": "A purse has 25p and 50p coins in the ratio 3 : 4 by count. Total value is Rs 55. Find the number of 25p coins.",
        "opts": [
            "40",
            "50",
            "60",
            "80"
        ],
        "c": 2,
        "exp": "Step 1: Let counts be 3k and 4k. Step 2: Value = 0.25×3k + 0.5×4k = 0.75k + 2k = 2.75k = 55. Step 3: k = 20. Step 4: 25p coins = 3 × 20 = 60. Answer is option C."
    },
    {
        "id": 95,
        "t": "coins",
        "q": "10p, 25p and 50p coins are in the ratio 5 : 4 : 3 by count. Total value is Rs 45. Find the number of 50p coins.",
        "opts": [
            "30",
            "45",
            "60",
            "75"
        ],
        "c": 1,
        "exp": "Step 1: Counts 5k, 4k, 3k. Step 2: Value = 0.1×5k + 0.25×4k + 0.5×3k = 0.5k + 1k + 1.5k = 3k = 45. Step 3: k = 15. Step 4: 50p coins = 3 × 15 = 45. Answer is option B."
    },
    {
        "id": 96,
        "t": "coins",
        "q": "A bag has 1 rupee and 50p coins, 500 coins in all, total value Rs 300. Find the number of 50p coins.",
        "opts": [
            "300",
            "350",
            "400",
            "450"
        ],
        "c": 2,
        "exp": "Step 1: Let x be 1 rupee coins, y be 50p coins. x + y = 500. Step 2: Value: x + 0.5y = 300. Step 3: Subtract: 0.5y = 200, so y = 400. Answer is option C."
    },
    {
        "id": 97,
        "t": "coins",
        "q": "25p and 1 rupee coins are in the ratio 4 : 3 by count. Total value is Rs 100. Find the number of 1 rupee coins.",
        "opts": [
            "60",
            "75",
            "80",
            "100"
        ],
        "c": 1,
        "exp": "Step 1: Counts 4k and 3k. Step 2: Value = 0.25×4k + 1×3k = k + 3k = 4k = 100. Step 3: k = 25. Step 4: 1 rupee coins = 3 × 25 = 75. Answer is option B."
    },
    {
        "id": 98,
        "t": "coins",
        "q": "50p, 25p and 10p coins are in the ratio 3 : 4 : 5 by count. Total value is Rs 120. Find the number of 25p coins.",
        "opts": [
            "120",
            "160",
            "180",
            "200"
        ],
        "c": 1,
        "exp": "Step 1: Counts 3k, 4k, 5k. Step 2: Value = 0.5×3k + 0.25×4k + 0.1×5k = 1.5k + k + 0.5k = 3k = 120. Step 3: k = 40. Step 4: 25p coins = 4 × 40 = 160. Answer is option B."
    },
    {
        "id": 99,
        "t": "coins",
        "q": "The values of 1 rupee, 50p and 25p coins are in the ratio 2 : 3 : 4. Find the ratio of their counts.",
        "opts": [
            "$2 : 6 : 16$",
            "$2 : 3 : 4$",
            "$1 : 3 : 8$",
            "$4 : 3 : 2$"
        ],
        "c": 0,
        "exp": "Step 1: Counts = (2/1) : (3/0.5) : (4/0.25). Step 2: = 2 : 6 : 16. Answer is option A."
    },
    {
        "id": 100,
        "t": "coins",
        "q": "A bag has coins of Rs 1, 50p and 25p in the ratio 1 : 2 : 4 by count. Total value is Rs 120. Find the number of 25p coins.",
        "opts": [
            "80",
            "120",
            "160",
            "200"
        ],
        "c": 2,
        "exp": "Step 1: Counts k, 2k, 4k. Step 2: Value = 1×k + 0.5×2k + 0.25×4k = k + k + k = 3k = 120. Step 3: k = 40. Step 4: 25p coins = 4 × 40 = 160. Answer is option C."
    },
    {
        "id": 101,
        "t": "coins",
        "q": "Coins of 50p and 25p are in the ratio 1 : 3 by value. If there are 200 coins of 50p, how many 25p coins are there?",
        "opts": [
            "400",
            "600",
            "800",
            "1200"
        ],
        "c": 3,
        "exp": "Step 1: Counts = (1/0.5) : (3/0.25) = 2 : 12 = 1 : 6. Step 2: For 200 50p coins (1 unit), 25p coins = 6 × 200 = 1200? No — 1 unit = 200, so 6 units = 1200. Recheck: ratio counts 2:12 means for every 2 50p coins there are 12 25p coins. 200 50p coins = 100 × 2, so 25p = 100 × 12 = 1200. Answer is option D."
    },
    {
        "id": 102,
        "t": "mixture",
        "q": "In a 13-litre mixture, milk : water = 3 : 2. If 3 litres is replaced by 3 litres of milk, find the new ratio.",
        "opts": [
            "$8 : 5$",
            "$9 : 4$",
            "$10 : 3$",
            "$7 : 6$"
        ],
        "c": 1,
        "exp": "Step 1: After removing 3 L, 10 L of mixture (3:2) remains: milk = 6 L, water = 4 L. Step 2: Add 3 L milk: milk = 9 L, water = 4 L. Step 3: New ratio = 9 : 4. Answer is option B."
    },
    {
        "id": 103,
        "t": "mixture",
        "q": "A mixture has alcohol and water in 7 : 5. Adding 8 litres of water makes it 7 : 9. Find the quantity of alcohol.",
        "opts": [
            "12 L",
            "14 L",
            "16 L",
            "21 L"
        ],
        "c": 1,
        "exp": "Step 1: Let alcohol = 7k, water = 5k. Step 2: 7k/(5k+8) = 7/9. Step 3: 63k = 35k + 56, so 28k = 56 and k = 2. Step 4: Alcohol = 7 × 2 = 14 L. Answer is option B."
    },
    {
        "id": 104,
        "t": "mixture",
        "q": "A mixture has sugar solution and water in 4 : 3. Adding 10 L of water makes it 4 : 5. Find the initial sugar solution.",
        "opts": [
            "16 L",
            "20 L",
            "24 L",
            "28 L"
        ],
        "c": 1,
        "exp": "Step 1: Let sugar = 4k, water = 3k. Step 2: 4k/(3k+10) = 4/5. Step 3: 20k = 12k + 40, so 8k = 40 and k = 5. Step 4: Sugar = 4 × 5 = 20 L. Answer is option B."
    },
    {
        "id": 105,
        "t": "mixture",
        "q": "Milk and water are in 5 : 3. Adding 6 L of water gives 5 : 4. Find the quantity of milk.",
        "opts": [
            "20 L",
            "25 L",
            "30 L",
            "35 L"
        ],
        "c": 2,
        "exp": "Step 1: Milk = 5k, water = 3k. Step 2: 5k/(3k+6) = 5/4. Step 3: 20k = 15k + 30, so k = 6. Step 4: Milk = 5 × 6 = 30 L. Answer is option C."
    },
    {
        "id": 106,
        "t": "mixture",
        "q": "Milk and water are in 5 : 2. Adding 10 L of water makes the ratio 5 : 3. Find the milk.",
        "opts": [
            "40 L",
            "45 L",
            "50 L",
            "60 L"
        ],
        "c": 2,
        "exp": "Step 1: Milk = 5k, water = 2k. Step 2: 5k/(2k+10) = 5/3. Step 3: 15k = 10k + 50, so 5k = 50 and k = 10. Step 4: Milk = 5 × 10 = 50 L. Answer is option C."
    },
    {
        "id": 107,
        "t": "mixture",
        "q": "A 60-litre mixture has milk : water = 2 : 1. How much water must be added to make it 8 : 5?",
        "opts": [
            "3 L",
            "4 L",
            "5 L",
            "6 L"
        ],
        "c": 2,
        "exp": "Step 1: Milk = 40 L, water = 20 L. Step 2: 40/(20+x) = 8/5. Step 3: 200 = 160 + 8x, so 8x = 40 and x = 5. Answer is option C."
    },
    {
        "id": 108,
        "t": "mixture",
        "q": "A 25-litre mixture has alcohol : water = 3 : 2. If 5 litres is removed and replaced by water, find the new ratio.",
        "opts": [
            "$12 : 13$",
            "$11 : 14$",
            "$10 : 15$",
            "$9 : 16$"
        ],
        "c": 0,
        "exp": "Step 1: Initially alcohol 15 L, water 10 L. Step 2: Remove 5 L of mixture: 3 L alcohol and 2 L water removed. Step 3: Left: alcohol 12 L, water 8 L. Step 4: Add 5 L water: water = 13 L. New ratio = 12 : 13. Answer is option A."
    },
    {
        "id": 109,
        "t": "mixture",
        "q": "A 45 kg alloy has copper : tin = 5 : 4. How much copper must be added so that the ratio becomes 10 : 7?",
        "opts": [
            "25/7 kg",
            "30/7 kg",
            "35/7 kg",
            "40/7 kg"
        ],
        "c": 0,
        "exp": "Step 1: Copper = 25 kg, tin = 20 kg. Step 2: (25+x)/20 = 10/7. Step 3: 7(25+x) = 200 → 175 + 7x = 200 → 7x = 25 → x = 25/7 kg. Answer is option A."
    },
    {
        "id": 110,
        "t": "mixture",
        "q": "A 35-litre mixture has milk : water = 4 : 3. How much water must be added to make it 2 : 3?",
        "opts": [
            "10 L",
            "12 L",
            "15 L",
            "18 L"
        ],
        "c": 2,
        "exp": "Step 1: Milk = 20 L, water = 15 L. Step 2: 20/(15+x) = 2/3. Step 3: 60 = 30 + 2x, so 2x = 30 and x = 15. Answer is option C."
    },
    {
        "id": 111,
        "t": "mixture",
        "q": "Vessel A has 80% milk, vessel B has 60% milk. They are mixed in 2 : 1. Find the milk percentage in the mixture.",
        "opts": [
            "66.67%",
            "70%",
            "73.33%",
            "75%"
        ],
        "c": 2,
        "exp": "Step 1: Milk in 2 parts A = 2 × 0.8 = 1.6 parts, in 1 part B = 0.6 parts. Step 2: Total milk = 2.2 out of 3 parts. Step 3: Percentage = (2.2/3) × 100 = 73.33%. Answer is option C."
    },
    {
        "id": 112,
        "t": "mixture",
        "q": "Milk and water are in 2 : 1. Adding 10 L of water makes the ratio 1 : 1. Find the milk.",
        "opts": [
            "10 L",
            "20 L",
            "30 L",
            "40 L"
        ],
        "c": 1,
        "exp": "Step 1: Milk = 2k, water = k. Step 2: 2k/(k+10) = 1/1. Step 3: 2k = k + 10, so k = 10. Step 4: Milk = 2 × 10 = 20 L. Answer is option B."
    },
    {
        "id": 113,
        "t": "mixture",
        "q": "An 8-litre mixture has milk : water = 5 : 3. Two litres is removed and replaced by milk. Find the new ratio.",
        "opts": [
            "$23 : 9$",
            "$5 : 3$",
            "$7 : 3$",
            "$11 : 5$"
        ],
        "c": 0,
        "exp": "Step 1: Initial milk 5 L, water 3 L. Step 2: Remove 2 L (ratio 5:3): milk 1.25 L, water 0.75 L removed. Step 3: Left: milk 3.75 L, water 2.25 L. Step 4: Add 2 L milk: milk 5.75 L. Ratio 5.75 : 2.25 = 23 : 9. Answer is option A."
    },
    {
        "id": 114,
        "t": "mixture",
        "q": "A 21-litre mixture has A : B = 4 : 3. How much B must be added to make it 2 : 3?",
        "opts": [
            "6 L",
            "9 L",
            "12 L",
            "15 L"
        ],
        "c": 1,
        "exp": "Step 1: A = 12 L, B = 9 L. Step 2: 12/(9+x) = 2/3. Step 3: 36 = 18 + 2x, so 2x = 18 and x = 9. Answer is option B."
    },
    {
        "id": 115,
        "t": "mixture",
        "q": "A 40-litre mixture has spirit : water = 17 : 3. How much water must be added to make it 17 : 5?",
        "opts": [
            "3 L",
            "4 L",
            "5 L",
            "6 L"
        ],
        "c": 1,
        "exp": "Step 1: Spirit = 34 L, water = 6 L. Step 2: 34/(6+x) = 17/5. Step 3: 170 = 102 + 17x, so 17x = 68 and x = 4. Answer is option B."
    },
    {
        "id": 116,
        "t": "mixture",
        "q": "Two vessels have milk : water = 2 : 3 and 5 : 1. They are mixed in 3 : 2. Find milk : water in the final mixture.",
        "opts": [
            "$43 : 32$",
            "$32 : 43$",
            "$7 : 4$",
            "$4 : 7$"
        ],
        "c": 0,
        "exp": "Step 1: Milk in 3 parts of A = 3 × (2/5) = 6/5. Milk in 2 parts of B = 2 × (5/6) = 5/3. Step 2: Total milk = 6/5 + 5/3 = (18+25)/15 = 43/15. Step 3: Total = 5 parts, water = 5 − 43/15 = 32/15. Step 4: Ratio = 43 : 32. Answer is option A."
    },
    {
        "id": 117,
        "t": "mixture",
        "q": "In what ratio must a 25% solution and a 50% solution be mixed to get a 40% solution?",
        "opts": [
            "$2 : 3$",
            "$3 : 2$",
            "$1 : 1$",
            "$2 : 1$"
        ],
        "c": 0,
        "exp": "Step 1: Alligation: 40 − 25 = 15 parts of the 50% solution, 50 − 40 = 10 parts of the 25% solution. Step 2: Ratio 25% : 50% = 10 : 15 = 2 : 3. Answer is option A."
    },
    {
        "id": 118,
        "t": "income",
        "q": "Incomes of P and Q are in 3 : 4. Each spends Rs 1000 and their savings are in 1 : 2. Find P's income.",
        "opts": [
            "Rs 1200",
            "Rs 1500",
            "Rs 1800",
            "Rs 2000"
        ],
        "c": 1,
        "exp": "Step 1: Let incomes be 3x and 4x. Savings = 3x−1000 and 4x−1000. Step 2: (3x−1000)/(4x−1000) = 1/2. Step 3: 6x − 2000 = 4x − 1000 → 2x = 1000 → x = 500. Step 4: P's income = 3 × 500 = Rs 1500. Answer is option B."
    },
    {
        "id": 119,
        "t": "income",
        "q": "Salaries of Ram and Sham are in 4 : 5. Each gets an increase of Rs 5000, making the ratio 50 : 60. Find Sham's present salary.",
        "opts": [
            "Rs 25000",
            "Rs 30000",
            "Rs 35000",
            "Rs 40000"
        ],
        "c": 1,
        "exp": "Step 1: Let salaries be 4x and 5x. Step 2: (4x+5000)/(5x+5000) = 50/60 = 5/6. Step 3: 6(4x+5000) = 5(5x+5000) → 24x + 30000 = 25x + 25000 → x = 5000. Step 4: Sham's present = 5 × 5000 + 5000 = Rs 30000. Answer is option B."
    },
    {
        "id": 120,
        "t": "income",
        "q": "A saves 30% of income, B saves 20%. Their savings are in 15 : 11. Find the ratio of their incomes.",
        "opts": [
            "$10 : 11$",
            "$11 : 10$",
            "$3 : 2$",
            "$2 : 3$"
        ],
        "c": 0,
        "exp": "Step 1: Income = saving ÷ saving rate. Step 2: A = 15/0.3 = 50, B = 11/0.2 = 55. Step 3: Ratio = 50 : 55 = 10 : 11. Answer is option A."
    },
    {
        "id": 121,
        "t": "income",
        "q": "Incomes of A and B are in 7 : 8. Each spends Rs 1000 and savings are in 3 : 4. Find A's income.",
        "opts": [
            "Rs 1750",
            "Rs 1800",
            "Rs 2000",
            "Rs 2100"
        ],
        "c": 0,
        "exp": "Step 1: Incomes 7x, 8x; savings 7x−1000, 8x−1000. Step 2: (7x−1000)/(8x−1000) = 3/4. Step 3: 28x − 4000 = 24x − 3000 → 4x = 1000 → x = 250. Step 4: A = 7 × 250 = Rs 1750. Answer is option A."
    },
    {
        "id": 122,
        "t": "income",
        "q": "Salaries of A and B are in 5 : 6. Each gets an increase of Rs 3000, making the ratio 6 : 7. Find A's old salary.",
        "opts": [
            "Rs 12000",
            "Rs 15000",
            "Rs 18000",
            "Rs 20000"
        ],
        "c": 1,
        "exp": "Step 1: Salaries 5x, 6x. Step 2: (5x+3000)/(6x+3000) = 6/7. Step 3: 35x + 21000 = 36x + 18000 → x = 3000. Step 4: A's old = 5 × 3000 = Rs 15000. Answer is option B."
    },
    {
        "id": 123,
        "t": "income",
        "q": "Incomes of Ram and Sham are in 3 : 4. Each gets Rs 2000 more and the new ratio is 7 : 9. Find Sham's new salary.",
        "opts": [
            "Rs 16000",
            "Rs 18000",
            "Rs 20000",
            "Rs 22000"
        ],
        "c": 1,
        "exp": "Step 1: Incomes 3x, 4x. Step 2: (3x+2000)/(4x+2000) = 7/9. Step 3: 27x + 18000 = 28x + 14000 → x = 4000. Step 4: Sham new = 4 × 4000 + 2000 = Rs 18000. Answer is option B."
    },
    {
        "id": 124,
        "t": "income",
        "q": "P spends 80% of income, Q spends 85%. Their savings are in 8 : 9. Find the ratio of their incomes.",
        "opts": [
            "$2 : 3$",
            "$3 : 2$",
            "$4 : 5$",
            "$5 : 4$"
        ],
        "c": 0,
        "exp": "Step 1: P saves 20% → income = 8/0.2 = 40. Step 2: Q saves 15% → income = 9/0.15 = 60. Step 3: Ratio = 40 : 60 = 2 : 3. Answer is option A."
    },
    {
        "id": 125,
        "t": "income",
        "q": "A man, his wife and daughter worked 3, 2 and 4 days. Man : wife daily wage = 5 : 4 and man : daughter = 5 : 3. Total earnings Rs 105. Find the daughter's daily wage.",
        "opts": [
            "Rs 9",
            "Rs 10",
            "Rs 12",
            "Rs 15"
        ],
        "c": 0,
        "exp": "Step 1: Wages 5x, 4x, 3x. Step 2: 3(5x) + 2(4x) + 4(3x) = 105 → 15x + 8x + 12x = 35x = 105. Step 3: x = 3. Step 4: Daughter's wage = 3x = Rs 9. Answer is option A."
    },
    {
        "id": 126,
        "t": "income",
        "q": "Monthly incomes of A and B are in 5 : 4 and their expenditures in 7 : 5. Both save Rs 6000. Find A's income.",
        "opts": [
            "Rs 16000",
            "Rs 18000",
            "Rs 20000",
            "Rs 24000"
        ],
        "c": 2,
        "exp": "Step 1: Incomes 5x, 4x; expenditures 7y, 5y. Step 2: 5x − 7y = 6000 and 4x − 5y = 6000. Step 3: Subtract: x − 2y = 0 → x = 2y. Step 4: 4(2y) − 5y = 6000 → 3y = 6000 → y = 2000, x = 4000. Step 5: A's income = 5 × 4000 = Rs 20000. Answer is option C."
    },
    {
        "id": 127,
        "t": "income",
        "q": "Incomes of A and B are in 3 : 2 and expenditures in 5 : 3. Both save Rs 1000. Find B's income.",
        "opts": [
            "Rs 3000",
            "Rs 4000",
            "Rs 5000",
            "Rs 6000"
        ],
        "c": 1,
        "exp": "Step 1: Incomes 3x, 2x; expenditures 5y, 3y. Step 2: 3x − 5y = 1000 and 2x − 3y = 1000. Step 3: Subtract: x − 2y = 0 → x = 2y. Step 4: 3(2y) − 5y = 1000 → y = 1000, x = 2000. Step 5: B's income = 2 × 2000 = Rs 4000. Answer is option B."
    },
    {
        "id": 128,
        "t": "income",
        "q": "Incomes of X and Y are in 9 : 11 and their expenditures in 7 : 9. If each saves Rs 2000, find Y's income.",
        "opts": [
            "Rs 9000",
            "Rs 11000",
            "Rs 13000",
            "Rs 15000"
        ],
        "c": 1,
        "exp": "Step 1: Incomes 9x, 11x; expenditures 7y, 9y. Step 2: 9x − 7y = 2000 and 11x − 9y = 2000. Step 3: Subtract: 2x − 2y = 0 → x = y. Step 4: 9x − 7x = 2000 → 2x = 2000 → x = 1000. Step 5: Y's income = 11 × 1000 = Rs 11000. Answer is option B."
    },
    {
        "id": 129,
        "t": "income",
        "q": "A man spends 2/5 of his salary and saves the rest. If his savings are Rs 9000, find his salary.",
        "opts": [
            "Rs 12000",
            "Rs 13500",
            "Rs 15000",
            "Rs 18000"
        ],
        "c": 2,
        "exp": "Step 1: He saves 1 − 2/5 = 3/5 of salary. Step 2: (3/5) × Salary = 9000. Step 3: Salary = 9000 × 5/3 = Rs 15000. Answer is option C."
    },
    {
        "id": 130,
        "t": "partnership",
        "q": "A invests Rs 1,00,000 and B invests Rs 2,00,000 for the same period. Profit is Rs 30,000. Find A's share.",
        "opts": [
            "Rs 10000",
            "Rs 15000",
            "Rs 20000",
            "Rs 25000"
        ],
        "c": 0,
        "exp": "Step 1: Profit shares are in capital ratio 1 : 2. Step 2: Total parts = 3, one part = 30000/3 = 10000. Step 3: A's share = 1 × 10000 = Rs 10000. Answer is option A."
    },
    {
        "id": 131,
        "t": "partnership",
        "q": "A invests Rs 1000 for 6 months, B invests Rs 2000 for 3 months. Profit Rs 3000. Find B's share.",
        "opts": [
            "Rs 1200",
            "Rs 1500",
            "Rs 1800",
            "Rs 2000"
        ],
        "c": 1,
        "exp": "Step 1: Input = capital × time. A = 1000 × 6 = 6000, B = 2000 × 3 = 6000. Step 2: Ratio 1 : 1. Step 3: B's share = 3000/2 = Rs 1500. Answer is option B."
    },
    {
        "id": 132,
        "t": "partnership",
        "q": "A invests Rs 5000 for 8 months, B invests Rs 4000 for 6 months. Profit Rs 3200. Find A's share.",
        "opts": [
            "Rs 1600",
            "Rs 1800",
            "Rs 2000",
            "Rs 2400"
        ],
        "c": 2,
        "exp": "Step 1: A input = 5000 × 8 = 40000, B input = 4000 × 6 = 24000. Step 2: Ratio = 40000 : 24000 = 5 : 3. Step 3: Total parts 8, one part = 3200/8 = 400. Step 4: A = 5 × 400 = Rs 2000. Answer is option C."
    },
    {
        "id": 133,
        "t": "partnership",
        "q": "A, B, C invest Rs 10000 each. After 5 months A withdraws 3000, B withdraws 2000, C adds 3000. Yearly profit Rs 34600. Find C's share.",
        "opts": [
            "Rs 9900",
            "Rs 10600",
            "Rs 14100",
            "Rs 15000"
        ],
        "c": 2,
        "exp": "Step 1: Inputs: A = 10000×5 + 7000×7 = 99000. B = 10000×5 + 8000×7 = 106000. C = 10000×5 + 13000×7 = 141000. Step 2: Ratio = 99 : 106 : 141, total 346. Step 3: One part = 34600/346 = 100. Step 4: C = 141 × 100 = Rs 14100. Answer is option C."
    },
    {
        "id": 134,
        "t": "partnership",
        "q": "A invests Rs 70000 for a year. B joins after some months with Rs 60000. Profit is split 2 : 1. After how many months did B join?",
        "opts": [
            "3",
            "4",
            "5",
            "6"
        ],
        "c": 2,
        "exp": "Step 1: A input = 70000 × 12, B input = 60000 × (12−n). Step 2: (70000×12)/(60000×(12−n)) = 2/1. Step 3: (7×12)/(6×(12−n)) = 2 → 84 = 144 − 12n → 12n = 60 → n = 5. Step 4: B joined after 5 months. Answer is option C."
    },
    {
        "id": 135,
        "t": "partnership",
        "q": "A invests Rs 2000 for 6 months, B invests Rs 3000 for 4 months. Find the ratio of their profits.",
        "opts": [
            "$1 : 1$",
            "$2 : 3$",
            "$3 : 2$",
            "$4 : 5$"
        ],
        "c": 0,
        "exp": "Step 1: A input = 2000 × 6 = 12000, B input = 3000 × 4 = 12000. Step 2: Ratio = 1 : 1. Answer is option A."
    },
    {
        "id": 136,
        "t": "partnership",
        "q": "A, B, C invest capitals in 5 : 7 : 8 for 6, 7 and 8 months. Profit Rs 2860. Find A's share.",
        "opts": [
            "Rs 600",
            "Rs 900",
            "Rs 980",
            "Rs 1280"
        ],
        "c": 0,
        "exp": "Step 1: Inputs = 5×6 : 7×7 : 8×8 = 30 : 49 : 64, total 143. Step 2: One part = 2860/143 = 20. Step 3: A = 30 × 20 = Rs 600. Answer is option A."
    },
    {
        "id": 137,
        "t": "partnership",
        "q": "A invests Rs 6000 for 12 months. B joins after 4 months with Rs 4000. Profit Rs 5200. Find B's share.",
        "opts": [
            "Rs 1600",
            "Rs 2000",
            "Rs 2600",
            "Rs 3200"
        ],
        "c": 0,
        "exp": "Step 1: A input = 6000 × 12 = 72000. B input = 4000 × 8 = 32000. Step 2: Ratio = 72 : 32 = 9 : 4. Step 3: Total 13 parts, one part = 5200/13 = 400. Step 4: B = 4 × 400 = Rs 1600. Answer is option A."
    },
    {
        "id": 138,
        "t": "partnership",
        "q": "Capitals of A and B are in 2 : 3 and time periods in 5 : 4. Profit Rs 2200. Find A's share.",
        "opts": [
            "Rs 1000",
            "Rs 1100",
            "Rs 1200",
            "Rs 1500"
        ],
        "c": 0,
        "exp": "Step 1: Input ratio = (2×5) : (3×4) = 10 : 12 = 5 : 6. Step 2: Total 11 parts, one part = 2200/11 = 200. Step 3: A = 5 × 200 = Rs 1000. Answer is option A."
    },
    {
        "id": 139,
        "t": "partnership",
        "q": "Capitals of A, B, C are in 4 : 6 : 9 for equal time. Profit Rs 3800. Find C's share.",
        "opts": [
            "Rs 800",
            "Rs 1200",
            "Rs 1800",
            "Rs 2000"
        ],
        "c": 2,
        "exp": "Step 1: Profit ratio = 4 : 6 : 9, total 19. Step 2: One part = 3800/19 = 200. Step 3: C = 9 × 200 = Rs 1800. Answer is option C."
    },
    {
        "id": 140,
        "t": "partnership",
        "q": "A invests Rs 4000 and B Rs 6000. A gets 10% of the profit as manager's fee; the rest is split in capital ratio. Profit Rs 5500. Find A's total.",
        "opts": [
            "Rs 1980",
            "Rs 2530",
            "Rs 2970",
            "Rs 3050"
        ],
        "c": 1,
        "exp": "Step 1: Manager fee = 10% of 5500 = 550. Step 2: Remaining = 4950 in 4000 : 6000 = 2 : 3. Step 3: A's share = 4950 × (2/5) = 1980. Step 4: A total = 1980 + 550 = Rs 2530. Answer is option B."
    },
    {
        "id": 141,
        "t": "partnership",
        "q": "A invests Rs 10000 for 6 months then doubles it; B invests Rs 15000 for the whole year. Find the profit ratio.",
        "opts": [
            "$1 : 1$",
            "$2 : 3$",
            "$3 : 2$",
            "$4 : 5$"
        ],
        "c": 0,
        "exp": "Step 1: A input = 10000×6 + 20000×6 = 60000 + 120000 = 180000. Step 2: B input = 15000 × 12 = 180000. Step 3: Ratio = 1 : 1. Answer is option A."
    },
    {
        "id": 142,
        "t": "partnership",
        "q": "A, B, C invest capitals in 2 : 3 : 5. A withdraws half his capital after 6 months. Profit Rs 9500. Find B's share.",
        "opts": [
            "Rs 1500",
            "Rs 3000",
            "Rs 4000",
            "Rs 5000"
        ],
        "c": 1,
        "exp": "Step 1: Inputs (units): A = 2×6 + 1×6 = 18, B = 3×12 = 36, C = 5×12 = 60. Step 2: Ratio = 18 : 36 : 60 = 3 : 6 : 10, total 19. Step 3: One part = 9500/19 = 500. Step 4: B = 6 × 500 = Rs 3000. Answer is option B."
    },
    {
        "id": 143,
        "t": "variation",
        "q": "6 men can build a wall in 10 days. How many days will 15 men take?",
        "opts": [
            "3",
            "4",
            "5",
            "6"
        ],
        "c": 1,
        "exp": "Step 1: More men → fewer days (inverse proportion). Step 2: Total work = 6 × 10 = 60 man-days. Step 3: 15 men → 60/15 = 4 days. Answer is option B."
    },
    {
        "id": 144,
        "t": "variation",
        "q": "5 machines produce 200 toys. How many toys will 8 machines produce?",
        "opts": [
            "280",
            "300",
            "320",
            "360"
        ],
        "c": 2,
        "exp": "Step 1: More machines → more toys (direct proportion). Step 2: One machine = 200/5 = 40 toys. Step 3: 8 machines = 8 × 40 = 320. Answer is option C."
    },
    {
        "id": 145,
        "t": "variation",
        "q": "x varies directly with y. If x = 12 when y = 3, find x when y = 7.",
        "opts": [
            "24",
            "26",
            "28",
            "30"
        ],
        "c": 2,
        "exp": "Step 1: Direct: x/y is constant = 12/3 = 4. Step 2: x = 4 × y. Step 3: x = 4 × 7 = 28. Answer is option C."
    },
    {
        "id": 146,
        "t": "variation",
        "q": "x varies inversely with y. If x = 8 when y = 6, find x when y = 12.",
        "opts": [
            "2",
            "3",
            "4",
            "6"
        ],
        "c": 2,
        "exp": "Step 1: Inverse: x × y is constant = 8 × 6 = 48. Step 2: x = 48/12 = 4. Answer is option C."
    },
    {
        "id": 147,
        "t": "variation",
        "q": "12 pipes fill a tank in 8 hours. How long will 16 pipes take?",
        "opts": [
            "4 h",
            "5 h",
            "6 h",
            "7 h"
        ],
        "c": 2,
        "exp": "Step 1: More pipes → less time (inverse). Step 2: Total = 12 × 8 = 96 pipe-hours. Step 3: 16 pipes → 96/16 = 6 hours. Answer is option C."
    },
    {
        "id": 148,
        "t": "variation",
        "q": "A car at 45 km/h takes 4 hours. At 60 km/h, how long will it take?",
        "opts": [
            "2.5 h",
            "3 h",
            "3.5 h",
            "4 h"
        ],
        "c": 1,
        "exp": "Step 1: Higher speed → less time (inverse). Step 2: Distance = 45 × 4 = 180 km. Step 3: Time = 180/60 = 3 hours. Answer is option B."
    },
    {
        "id": 149,
        "t": "variation",
        "q": "15 workers complete a job in 20 days. How many workers are needed for 12 days?",
        "opts": [
            "20",
            "24",
            "25",
            "30"
        ],
        "c": 2,
        "exp": "Step 1: Fewer days → more workers (inverse). Step 2: Work = 15 × 20 = 300 worker-days. Step 3: Workers = 300/12 = 25. Answer is option C."
    }
]
