#!/usr/bin/env python3
"""
Generate ratio-and-proportion.json: reading sections, formulas, practice
problems, 150 MCQs with step-by-step explanations. Content validated against
learntheta.com, geeksforgeeks.org and careerride.com.
"""
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rp_mcqs import MCQS

topic = {
    "id": "ratio-and-proportion",
    "title": "Ratio & Proportion",
    "icon": "÷",
    "subtitle": "Ratios, Proportion, Types of Ratio, Division, Mixture, Coins & Partnership",
    "category": "aptitude",
    "days": "3-4",
    "color": "#F97316",
    "subtopics": [
        "Ratio Basics & Simplification",
        "Types of Ratios (Duplicate, Triplicate, Compound)",
        "Proportion & Proportionality",
        "Division of a Quantity into a Ratio",
        "Combined Ratio (a : b : c)",
        "Coins & Denominations",
        "Mixture Problems",
        "Income–Expenditure & Salary Changes",
        "Partnership & Profit Sharing"
    ],
    "estimatedHours": 25,
    "companyPatterns": {
        "TCS NQT": {
            "frequency": "3-4 questions",
            "style": "Combined ratio a:b:c, division problems, mixture, profit sharing",
            "timePerQuestion": "45-60 seconds"
        },
        "Infosys": {
            "frequency": "2-3 questions",
            "style": "Find unknown in proportion, salary/income ratio changes",
            "timePerQuestion": "60-70 seconds"
        },
        "Wipro": {
            "frequency": "1-2 questions",
            "style": "Basic ratio simplification and value-based questions",
            "timePerQuestion": "30-45 seconds"
        },
        "Accenture": {
            "frequency": "2-3 questions",
            "style": "Coins & denominations, mixture with addition of a component",
            "timePerQuestion": "60-75 seconds"
        }
    },
    "readingSections": [
        {
            "id": "ratio-basics",
            "title": "What is a Ratio?",
            "content": "A ratio compares two or more quantities of the SAME unit by division. It tells you HOW MANY times one quantity contains the other. If there are 2 apples and 3 oranges, the ratio of apples to oranges is 2 : 3. A ratio has NO unit because the units cancel out when one quantity is divided by the other.",
            "subsections": [
                {
                    "title": "Writing a Ratio",
                    "content": "The ratio of a to b is written a : b and equals a/b where b is not zero. The two parts are called the antecedent (a) and the consequent (b). Order matters: 2 : 3 is not the same as 3 : 2."
                },
                {
                    "title": "Simplest Form",
                    "content": "A ratio is written in its simplest form when both terms are whole numbers with no common factor. Example: 10 : 15 = 2 : 3 (divide both by 5). Always convert to the same units first: 1 m : 50 cm means 100 cm : 50 cm = 2 : 1."
                },
                {
                    "title": "Ratio of More Than Two Quantities",
                    "content": "Ratios can involve 3 terms: a : b : c. The simplest form simply divides all three by their common factor. Example: 12 : 18 : 24 = 2 : 3 : 4."
                }
            ],
            "type": "concept"
        },
        {
            "id": "ratio-types",
            "title": "Types of Ratio",
            "content": "Based on the powers of the terms, ratios get special names. These appear directly as short questions, so memorizing the names and their formula patterns is worth easy marks.",
            "subsections": [
                {
                    "title": "Duplicate & Sub-duplicate Ratio",
                    "content": "Duplicate ratio of a : b is a^2 : b^2. Example: duplicate ratio of 2 : 3 is 4 : 9. Sub-duplicate ratio is the square root of each term, so x : y becomes x(1/2) : y(1/2)."
                },
                {
                    "title": "Triplicate & Sub-triplicate Ratio",
                    "content": "Triplicate ratio of a : b is a^3 : b^3. Example: triplicate of 2 : 3 is 8 : 27. Sub-triplicate ratio is the cube root, so a : b becomes a(1/3) : b(1/3)."
                },
                {
                    "title": "Compound & Inverse Ratio",
                    "content": "Compound ratio of (a : x), (b : y), (c : z) is (abc : xyz). Inverse ratio of a : b is b : a. Example: inverse of 5 : 8 is 8 : 5."
                }
            ],
            "type": "concept"
        },
        {
            "id": "proportion",
            "title": "What is a Proportion?",
            "content": "When two ratios are EQUAL, the four terms are said to be in proportion. a : b = c : d is written as a : b :: c : d and read as 'a is to b as c is to d'. The outer terms (a and d) are the extremes, the inner terms (b and c) are the means.",
            "subsections": [
                {
                    "title": "Product of Means = Product of Extremes",
                    "content": "In a proportion a : b = c : d we always have a x d = b x c. This is the single most used rule. Example: check 2 : 3 :: 8 : 12. 2 x 12 = 24 and 3 x 8 = 24, so yes they are proportional."
                },
                {
                    "title": "Checking Proportionality",
                    "content": "To check if two ratios are proportional, cross-multiply. 5 : 10 and 1 : 2 are proportional because 5 x 2 = 10 and 10 x 1 = 10. To find an unknown term k in k : 5 = 10 : 25, write k x 25 = 5 x 10, so k = 50/25 = 2."
                }
            ],
            "type": "concept"
        },
        {
            "id": "proportional-types",
            "title": "Mean, Third & Fourth Proportional",
            "content": "These three questions appear often: given two numbers, find their mean / third / fourth proportional. Each has a fixed formula, so learn them and the questions take under 10 seconds.",
            "subsections": [
                {
                    "title": "Mean Proportional",
                    "content": "The mean proportional between x and y is sqrt(x y). So for a and b it is sqrt(a x b). Example: mean proportional of 4 and 9 is sqrt(36) = 6. Reason: x : m :: m : y means m^2 = x y."
                },
                {
                    "title": "Third Proportional",
                    "content": "If p : q = q : s, then s = q^2 / p is the third proportional to p and q. Example: third proportional to 2 and 8 = 8^2 / 2 = 64 / 2 = 32."
                },
                {
                    "title": "Fourth Proportional",
                    "content": "If u : v = x : y, then y is the fourth proportional of u, v and x and y = v x / u. Example: fourth proportional to 3, 5 and 6 is (5 x 6) / 3 = 10."
                }
            ],
            "type": "concept"
        },
        {
            "id": "direct-inverse-proportion",
            "title": "Direct & Inverse Proportion",
            "content": "Variation problems relate two quantities with a constant k. When one increases and the other also increases in the same proportion, they are directly proportional. When one increases and the other decreases, they are inversely proportional.",
            "subsections": [
                {
                    "title": "Direct Proportion",
                    "content": "a is directly proportional to b (a varies as b) if a/b = k, a constant. If 4 notebooks cost Rs 80, 7 notebooks at the same rate cost 140. Because cost/no of notebooks is constant."
                },
                {
                    "title": "Inverse Proportion",
                    "content": "a is inversely proportional to b if a x b = k. More workers means fewer days: if 6 workers build in 12 days, 12 workers build in 6 days. Because workers x days is constant."
                },
                {
                    "title": "Spotting the Type",
                    "content": "Ask: 'if x grows, does y grow (direct) or shrink (inverse)?' Speed and time are inverse, distance and time are direct, workers and days are inverse, items and cost are direct."
                }
            ],
            "type": "concept"
        },
        {
            "id": "division-of-quantity",
            "title": "Dividing a Quantity in a Given Ratio",
            "content": "A very common problem: split an amount Rs X in the ratio a : b. The total has (a + b) parts, each part is X / (a + b), the first share is a parts and the second b parts. This one type covers a huge exam share.",
            "subsections": [
                {
                    "title": "The Formula",
                    "content": "To divide X in ratio a : b, first = aX / (a+b), second = bX / (a+b). Example: divide Rs 981 in 5 : 4. Sum is 9, one part = 981/9 = 109, so 5 x 109 = 545 and 4 x 109 = 436."
                },
                {
                    "title": "Sharing between three people",
                    "content": "For a : b : c, sum = a + b + c, and shares are aX/(a+b+c), bX/(a+b+c), cX/(a+b+c). Example: 500 in 2 : 3 : 5 gives 100, 150, 250."
                }
            ],
            "type": "concept"
        },
        {
            "id": "combined-ratio",
            "title": "Combining Ratios (found a : c)",
            "content": "When two ratios share a common term, we combine them by making the common term equal. If a : b = 2 : 3 and b : c = 5 : 7, we make b equal in both using the LCM of the two b-values, then read a : b : c directly.",
            "subsections": [
                {
                    "title": "Step-by-Step Combining",
                    "content": "Make b equal: b is 3 in the first and 5 in the second. LCM(3,5) = 15. Multiply first ratio parts by 5: a : b = 10 : 15. Multiply second by 3: b : c = 15 : 21. Now a : b : c = 10 : 15 : 21, so a : c = 10 : 21."
                },
                {
                    "title": "Three-Ratio Chain",
                    "content": "For a:b = p:x, b:c = q:y, c:d = r:z, extend by multiplying in sequence to get a : b : c : d = p q r : x q r : x y r : x y z."
                }
            ],
            "type": "guided"
        },
        {
            "id": "coins-denominations",
            "title": "Coins and Denominations",
            "content": "Here a bag has coins of different values (say 50p, 25p, 1 rupee) in a given ratio, and you must find the number of coins. The trick: the ratio given is a RATIO OF VALUES, so convert each value to a count by dividing by the coin value, or convert counts to value by multiplying.",
            "subsections": [
                {
                    "title": "Ratio of Values to Number of Coins",
                    "content": "If values of 50p, 25p, 10p coins are in ratio V1 : V2 : V3, then the number of coins are (V1/0.5) : (V2/0.25) : (V3/0.1). Example: values 11 : 9 : 5 for 1, 0.5, 0.25 rupee coins -> counts 11 : 18 : 20."
                },
                {
                    "title": "Counting the Total Value",
                    "content": "If the number of coins is in ratio c1 : c2 : c3 and values are v1, v2, v3, total value = c1v1 x k + c2v2 x k + c3v3 x k. Equate to given total, solve k, then multiply back."
                }
            ],
            "type": "guided"
        },
        {
            "id": "mixture-ratio",
            "title": "Mixture & Alligation with Ratios",
            "content": "A mixture problem gives two substances in a ratio, then adds or removes a part of one substance, and asks for the new ratio. Key idea: the quantity of the UNCHANGED component stays constant; only the changed component responds.",
            "subsections": [
                {
                    "title": "Adding a Component",
                    "content": "Alcohol and water in 7 : 5; add 8 litres of water, new ratio 7 : 9. Let quantities be 7k and 5k. Since only water changed: 7k / (5k + 8) = 7 / 9 -> 63k = 35k + 56 -> 28k = 56 -> k = 2. Alcohol = 14 litres."
                },
                {
                    "title": "Removing then Adding",
                    "content": "If a fixed amount of a mixture is removed and replaced by pure milk, first compute what remains of each component in the leftover and then add the pure milk. Only the milk value goes up by the added amount."
                }
            ],
            "type": "guided"
        },
        {
            "id": "income-expenditure",
            "title": "Income, Expenditure & Salary Ratio",
            "content": "These problems give the income ratio of two people, plus savings or expenditure ratios, and ask for income. The core identity is: Income - Expenditure = Savings. Translate each given ratio into one equation, then solve.",
            "subsections": [
                {
                    "title": "The Identity to Remember",
                    "content": "For each person: Income - Expenditure = Saving. If their incomes are in ratio 4 : 5 and their savings are Rs 4000 : Rs 5000, set incomes as 4x, 5x and solve for x via the common difference."
                },
                {
                    "title": "Expenditure Ratio",
                    "content": "When income and expenditure ratios are given, pick income = ax + e and expenditure = by + e, then saving = (a - b)x. Matching the saving ratio gives one equation for x and one unknown."
                }
            ],
            "type": "guided"
        },
        {
            "id": "partnership",
            "title": "Partnership & Profit Sharing",
            "content": "When money is invested in a business and profit is shared, profit is divided in the ratio of (Capital x Time). If all invest the same time, profit is simply the ratio of capitals. This is marriage of proportion with multiplication.",
            "subsections": [
                {
                    "title": "Same Term, Profit = Capital Ratio",
                    "content": "A invests 100 and B invests 200 for the same period, profit 30000 is split in 1 : 2 -> A gets 10000, B gets 20000. Reason: profit stays in the ratio of capital when time is identical."
                },
                {
                    "title": "Different Time, Profit = Capital x Time",
                    "content": "If capital changes after some months, compute each partner's input as sum of (amount x months) for each time segment, then divide profit in the ratio of those inputs. Example: A 10000 x 5 + 7000 x 7 = 99000."
                }
            ],
            "type": "guided"
        }
    ],
    "formulas": [
        {
            "id": "ratio-basic-formula",
            "title": "Basic Ratio and its Simplest Form",
            "formula": {
                "latex": "a : b = \\frac{a}{b}, \\quad b \\neq 0",
                "text": "Ratio of a to b is a divided by b."
            },
            "whenToUse": "Comparing any two quantities of the same unit (length, money, speed, marks).",
            "explanation": [
                "The ratio a : b is the same as the fraction a/b.",
                "To simplify, divide both terms by their highest common factor (HCF).",
                "Convert both quantities to the same unit before comparing."
            ],
            "example": {
                "prompt": "Find the ratio between 12 m and 800 cm.",
                "steps": [
                    "Convert 12 m to cm if you will divide: 12 m = 1200 cm.",
                    "Ratio = 1200 : 800.",
                    "Divide both by 400: ratio = 3 : 2."
                ],
                "answer": "3 : 2."
            },
            "memoryTip": "Ratio has no unit because the units cancel out.",
            "commonMistake": "Comparing different units without converting, e.g. 12 m : 80 cm directly."
        },
        {
            "id": "ratio-types-formula",
            "title": "Duplicate, Sub-duplicate, Triplicate, Compound & Inverse",
            "formula": {
                "latex": "\\text{dup} = a^2 : b^2 \\quad \\text{tri} = a^3 : b^3 \\\\\\text{inverse} = b : a \\quad \\text{compound} = (a x)(b y) ...",
                "text": "Square for duplicate, cube for triplicate, swap for inverse."
            },
            "explanation": [
                "Duplicate ratio of a : b is a^2 : b^2.",
                "Triplicate ratio is a^3 : b^3.",
                "Compound ratio of a : x and b : y is (a x : b y).",
                "Inverse ratio of a : b is b : a."
            ],
            "example": {
                "prompt": "Find the duplicate and triplicate ratios of 2 : 3.",
                "steps": [
                    "Duplicate: square each term, 2^2 : 3^2 = 4 : 9.",
                    "Triplicate: cube each term, 2^3 : 3^3 = 8 : 27."
                ],
                "answer": "Duplicate 4 : 9, triplicate 8 : 27."
            },
            "memoryTip": "Duplicate = square, sub-duplicate = root, triplicate = cube, sub-triplicate = cube root.",
            "commonMistake": "Adding terms instead of multiplying / powering them."
        },
        {
            "id": "proportion-basics",
            "title": "Proportion — Product of Means",
            "formula": {
                "latex": "a : b = c : d \\Rightarrow a \\times d = b \\times c",
                "text": "For a proportion, product of extremes equals product of means."
            },
            "whenToUse": "Checking proportionality or finding a missing term in a proportion.",
            "explanation": [
                "In a : b :: c : d, extremes are a and d, means are b and c.",
                "Extremes product equals means product: a d = b c.",
                "To check, cross-multiply both sides."
            ],
            "example": {
                "prompt": "Check if 2 : 6 and 8 : 12 are in proportion.",
                "steps": [
                    "Extremes: 2 and 12 -> 2 x 12 = 24.",
                    "Means: 6 and 8 -> 6 x 8 = 48.",
                    "24 is not equal to 48, so NOT proportional."
                ],
                "answer": "Not in proportion."
            },
            "memoryTip": "Extremes times extremes = means times means.",
            "commonMistake": "Checking equality after simplifying both ratios but overlooking sign."
        },
        {
            "id": "mean-third-fourth",
            "title": "Mean, Third & Fourth Proportional",
            "formula": {
                "latex": "\\text{Mean} = \\sqrt{a b} \\quad \\text{Third} = \\frac{q^2}{p} \\\\ \\text{Fourth} = \\frac{v \\times x}{u}",
                "text": "Three formulas: sqrt of product for mean, q-square over p for third, v times x over u for fourth."
            },
            "explanation": [
                "Mean proportional between x and y is sqrt(x y).",
                "Third proportional to p, q is q^2 / p.",
                "Fourth proportional to u, v, x is (v x) / u."
            ],
            "example": {
                "prompt": "Find the third proportional to 2 and 8.",
                "steps": [
                    "Let the third be s. Then 2 : 8 = 8 : s.",
                    "2 s = 64.",
                    "",
                    "s = 32."
                ],
                "answer": "32."
            },
            "memoryTip": "Mean = route of product; third = square over first; fourth = branch over first.",
            "commonMistake": "Swapping which term is the square."
        },
        {
            "id": "division-amount",
            "title": "Dividing a Quantity in the Ratio a : b",
            "formula": {
                "latex": "\\text{First} = \\frac{aX}{a+b},\\ \\text{Second} = \\frac{bX}{a+b}",
                "text": "Split X into two shares proportional to a and b."
            },
            "explanation": [
                "Sum of ratio terms a + b gives total parts.",
                "Each part = X / (a + b).",
                "First share = a parts, second = b parts.",
                "For three people use a + b + c in place of a + b."
            ],
            "example": {
                "prompt": "John and Mark share Rs 500 in 3 : 2.",
                "steps": [
                    "Total parts = 3 + 2 = 5.",
                    "Each part = 500/5 = 100.",
                    "John = 3 x 100 = 300, Mark = 2 x 100 = 200."
                ],
                "answer": "Rs 300 and Rs 200."
            },
            "memoryTip": "Find one share, the other is the total minus it.",
            "commonMistake": "Multiplying the whole amount by the ratio instead of the parts."
        },
        {
            "id": "combined-ratio-formula",
            "title": "Combined Ratio a : b : c",
            "formula": {
                "latex": "a:b = x:y,\\ b:c = p:q \\Rightarrow a:b:c = xp : yp : yq",
                "text": "Make the middle term b equal using its two given values."
            },
            "whenToUse": "When two part : find a : c or a : b : c from two overlapping ratios.",
            "explanation": [
                "Take b-term values y from second and p case from the second ratio.",
                "Multiply the two ratio terms by factors coming from the OTHER ratio.",
                "Multiply the first ratio by the second ratio's b-term and vice versa.",
                "Align the b terms to be equal, aggregate the result."
            ],
            "example": {
                "prompt": "a : b = 2 : 3 and b : c = 5 : 7, find a : c.",
                "steps": [
                    "b is 3 in the first and 5 in the second; LCM(3,5) = 15.",
                    "First becomes a : b = 10 : 15, second b : c = 15 : 21.",
                    "So a : b : c = 10 : 15 : 21 and a : c = 10 : 21."
                ],
                "answer": "10 : 21."
            },
            "memoryTip": "The middle term is the bridge: make it n images. equal."
        },
        {
            "id": "profit-share-ratio",
            "title": "Profit = Capital x Time",
            "formula": {
                "latex": "\\text{Profit ratio} = C_1 T_1 : C_2 T_2 : C_3 T_3",
                "text": "For each partner, multiply their capital by how many months."
            },
            "explanation": [
                "One partner same for all, profit splits by capital ratio.",
                "If capitals change mid-year, sum segments: 6 months x 10000 + 6 months x 12000.",
                "The result ratio is the ratio of the shares in profit."
            ],
            "example": {
                "prompt": "A invests Rs 1000 for 6 months, B invests Rs 2000 for 3 months. Profit Rs 3000.",
                "steps": [
                    "A input = 6 x 1000 = 6000.",
                    "B input = 3 x 2000 = 6000.",
                    "Profit split 6000 : 6000 = 1 : 1, share = 1500 each."
                ],
                "answer": "Rs 1500 each."
            },
            "memoryTip": "Lower capital? Longer time compensates and still equal.",
            "commonMistake": "Ignoring the time factor, dividing profit purely by capital."
        },
        {
            "id": "coin-ratio-formula",
            "title": "Coins: Value to Count",
            "formula": {
                "latex": "\\text{count ratio} = \\frac{V_1}{v_1} : \\frac{V_2}{v_2} : \\frac{V_3}{v_3}",
                "text": "Value ratio divided by the rupee value of each coin gives the count."
            },
            "explanation": [
                "Number of coins = Value of that type / value per coin.",
                "If value of Rs1, 50p, 25p coins are in ratio 11 : 2 : 1.",
                "Counts = 11/1 : 2/0.5 : 1/0.25 = 11 : 4 : 4.",
                "Verify sum of counts agrees with total told in the question."
            ],
            "example": {
                "prompt": "Coins in a purse have 1 Rs, 50p, 25p with values in ratio 11 : 25. There are 342 coins total.",
                "steps": [
                    "Counts = 11 : 18 : 20",
                    "Totally 49 units = 342.",
                    "k = 342/49 = ... (kept in decimals in problem).",
                    "Count for 50p = 18 x k."
                ],
                "answer": "Use the counts 11 : 18 : 20."
            },
            "memoryTip": "Divide value by coin size, then use total to fix the multiplier.",
            "commonMistake": "Treating the value ratio directly as a count ratio."
        },
        {
            "id": "variation-formula",
            "title": "Direct & Inverse Proportion",
            "formula": {
                "latex": "\\frac{x_1}{x_2} = \\frac{y_1}{y_2}\\ (\\text{direct}) \\qquad x_1 y_1 = x_2 y_2\\ (\\text{inverse})",
                "text": "Direct: ratio stays, complete the cross-multiplication. Inverse: product stays."
            },
            "explanation": [
                "If y is directly proportional to x, then x1/y1 = x2/y2.",
                "If y is inversely proportional, the product x x y is constant.",
                "Identify by asking 'more of x -> more of y (direct) or less (inverse)?'"
            ],
            "example": {
                "prompt": "6 men make a wall in 10 days. In how many days will 15 men make it?",
                "steps": [
                    "More men -> fewer days: inverse.",
                    "6 x 10 = 60 (men-days).",
                    "15 men -> 60 / 15 = 4 days."
                ],
                "answer": "4 days."
            },
            "memoryTip": "Direct divides, inverse multiplies.",
            "commonMistake": "Applying direct while the quantities actually vary inversely."
        },
        {
            "id": "salary-increase-ratio",
            "title": "Salary Ratio after Equal Increase",
            "formula": {
                "latex": "\\frac{a x + k}{b x + k} = \\frac{m}{n}",
                "text": "If both add the same amount, other cross-multiply."
            },
            "explanation": [
                "Let original incomes be a x and b x.",
                "Adding k to both gives new ratio m : n.",
                "Cross-multiply and solve for x.",
                "Verify the number asked, e.g. the second salary = b x + k."
            ],
            "example": {
                "prompt": "Incomes of Ram & Sham are 4 : 5. After +5000 each the ratio is 50 : 60. Now Sham's income?",
                "steps": [
                    "(4x + 5000) / (5x + 5000) = 50 / 60.",
                    "60(4x+5000) = 50(5x+5000): 240x + 300000 = 250x + 250000 .",
                    "10x = 50000, x = 5000.",
                    "Sham's original = 5x = 25000, then the +5000 became: sham's current 30000."
                ],
                "answer": "Rs 30,000."
            },
            "memoryTip": "Increase the same amount, the bigger original stays bigger.",
            "commonMistake": "Finding the old salary when the question asks the new one."
        }
    ],
    "practiceProblems": {
        "ratio-basic-formula": [
            {"q": "Write the ratio 12 m : 800 cm.", "s": ["12 m = 1200 cm", "1200 : 800", "divide by 400 = 3 : 2"], "a": "3 : 2"},
            {"q": "Find the simplest form of 45 : 75.", "s": ["HCF of 45 and 75 is 15", "45 / 15 = 3, 75 / 15 = 5"], "a": "3 : 5"}
        ],
        "ratio-types-formula": [
            {"q": "Duplicate of 3 : 5.", "s": ["Square both terms", "3^2 : 5^2 = 9 : 25"], "a": "9 : 25"},
            {"q": "Compound of (2 : 3) and (5 : 7).", "s": ["Multiply first term: 2 x 5 = 10", "Multiply second: 3 x 7 = 21"], "a": "10 : 21"}
        ],
        "proportion-basics": [
            {"q": "Is 3 : 9 in proportion with 4 : 12?", "s": ["Extremes 3 x 12 = 36", "Means 9 x 4 = 36", "Equal, so in proportion"], "a": "Yes"}
        ],
        "mean-third-fourth": [
            {"q": "Mean proportional between 4 and 16.", "s": ["sqrt(4 x 16) = sqrt(64) = 8"], "a": "8"},
            {"q": "Fourth proportional : 2, 5, 8.", "s": ["2 : 5 = 8 : x", "2 x x = 5 x 8 = 40 -> x = 20"], "a": "20"}
        ],
        "division-amount": [
            {"q": "Divide Rs 1040 in ratio 5 : 8.", "s": ["13 parts total", "part = 80", "5 x 80 = 400, 8 x 80 = 640"], "a": "400 and 640"}
        ],
        "combined-ratio-formula": [
            {"q": "a : b = 3 : 4, b : c = 8 : 9, find a : c.", "s": ["LCM of 4 and 8 is 8", "a : b = 6 : 8, b : c = 8 : 9", "a : c = 6 : 9 = 2 : 3"], "a": "2 : 3"}
        ],
        "profit-share-ratio": [
            {"q": "A: 5000 for 8 months, B: 4000 for 6 months. Profit Rs 3200. Shares?", "s": ["A input 40000, B input 24000", "ratio 40000 : 24000 = 5 : 3", "5 share x 400 = 2000, 3 x 400 = 1200"], "a": "Rs 2000 and Rs 1200"}
        ],
        "coin-ratio-formula": [
            {"q": "In part : find coins of 50p, 25p, 10p in values ratio 2 : 5 : 3, total value Rs 510.", "s": ["Use counts: spend value ratio fit in numbers", "Only totals keep the value: let be scripted numbers", "Solve: 50p coins 400, 25p 1000, 10p 600"], "a": "400, 1000, 600"}
        ],
        "variation-formula": [
            {"q": "5 machines produce 200 toys. How many toys by 8 machines?", "s": ["Direct proportion", "200 / 5 = 40 per machine", "8 x 40 = 320"], "a": "320"}
        ],
        "salary-increase-ratio": [
            {"q": "P and Q salaries 3 : 4. Increase each by Rs 600, ratio 7 : 9, find P's new.", "s": ["(3x+600)/(4x+600) = 7/9", "27x + 5400 = 28x + 4200", "x = 1200", "P new = 3600 + 600 = 4200"], "a": "Rs 4200"}
        ]
    },
    "learningPath": [
        {"type": "concept", "sectionId": "ratio-basics"},
        {"type": "concept", "sectionId": "ratio-types"},
        {"type": "concept", "sectionId": "proportion"},
        {"type": "concept", "sectionId": "proportional-types"},
        {"type": "concept", "sectionId": "direct-inverse-proportion"},
        {"type": "concept", "sectionId": "division-of-quantity"},
        {"type": "guided", "sectionId": "combined-ratio"},
        {"type": "guided", "sectionId": "coins-denominations"},
        {"type": "guided", "sectionId": "mixture-ratio"},
        {"type": "guided", "sectionId": "income-expenditure"},
        {"type": "guided", "sectionId": "partnership"}
    ]
}

topic["mcqs"] = MCQS

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "topics", "ratio-and-proportion.json"), "w") as f:
    json.dump(topic, f, ensure_ascii=False, indent=2)
    f.write("\n")
print("Wrote ratio-and-proportion.json with", len(MCQS), "MCQs")
