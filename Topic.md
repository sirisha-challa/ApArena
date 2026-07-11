# Master Topic 2: Simplification & Approximation for MNC Placements

Simplification and Approximation are the highest-scoring topics in the quantitative aptitude sections of TCS, Infosys, Wipro, Cognizant, and Accenture. These questions test your calculation speed and clarity of basic rules. If you master this, you can secure 5-8 easy marks in just 5 minutes.

This document is your **complete, spoon-fed guide**. We will break down every formula, shortcut, and pattern with step-by-step mathematical reasoning, followed by exactly 10 practice problems for each concept, modeled directly from past placement papers.

---

## Part 1: The BODMAS / VBODMAS Rule

### The Concept & Pattern
**Pattern Recognition:** If a question has a long string of numbers mixed with `+`, `-`, `*`, `/`, `()`, `{}`, `[]`, and the word **"of"**, it is a BODMAS question. 
**The Trap:** Companies love to put "of" next to multiplication to confuse you. **Rule:** "Of" always comes *before* Division and Multiplication.

**The Order (VBODMAS):**
1. **V** = Vinculum (Bar bracket: $\overline{a-b}$). Solve this first.
2. **B** = Brackets `( )`, `{ }`, `[ ]`. Solve inner to outer.
3. **O** = **Of** (Fractions, percentages, or literal 'of').
4. **D** = Division (`/` or `÷`).
5. **M** = Multiplication (`*` or `×`).
6. **A** = Addition (`+`).
7. **S** = Subtraction (`-`).

*Note: Division and Multiplication have the same priority; solve left to right. Same for Addition and Subtraction.*

### Step-by-Step Examples (10 Problems)

**1. $12 + 8 \div 4 \times 3 - 5$**
*   **Step 1 (Division):** $8 \div 4 = 2$. Equation becomes: $12 + 2 \times 3 - 5$
*   **Step 2 (Multiplication):** $2 \times 3 = 6$. Equation becomes: $12 + 6 - 5$
*   **Step 3 (Addition):** $12 + 6 = 18$. Equation becomes: $18 - 5$
*   **Step 4 (Subtraction):** $18 - 5 = 13$. **Answer: 13**

**2. $24 \div 6 \text{ of } 2 + 5$** *(Classic TCS Trap)*
*   **Step 1 (Of):** "6 of 2" means $6 \times 2 = 12$. Equation becomes: $24 \div 12 + 5$
*   **Step 2 (Division):** $24 \div 12 = 2$. Equation becomes: $2 + 5$
*   **Step 3 (Addition):** $2 + 5 = 7$. **Answer: 7** *(If you did division first, you'd get 7, wait, no, $24/6=4$, $4*2=8$, $8+5=13$. This is why 'of' must be done first!)*

**3. $15 - [ 4 + \{ 12 - ( 8 \div 2 \text{ of } 3 ) \} ]$**
*   **Step 1 (Innermost Bracket & Of):** $2 \text{ of } 3 = 6$. Bracket becomes: $(8 \div 6)$. Wait, $8 \div 6$ is a fraction. Let's re-read standard placement rules: usually it's $8 \div (2 \times 3)$ or it's a typo in standard memory. Let's use a cleaner standard example: $15 - [ 4 + \{ 12 - ( 8 - 2 \times 3 ) \} ]$
*   **Step 1 (Innermost Bracket & Mult):** $2 \times 3 = 6$. Bracket: $(8 - 6) = 2$.
*   **Step 2 (Curly Bracket):** $12 - 2 = 10$.
*   **Step 3 (Square Bracket):** $4 + 10 = 14$.
*   **Step 4 (Final Subtraction):** $15 - 14 = 1$. **Answer: 1**

**4. $5 + \frac{1}{2} \text{ of } 16 - 4$**
*   **Step 1 (Of):** $\frac{1}{2} \times 16 = 8$. Equation: $5 + 8 - 4$
*   **Step 2 (Addition):** $5 + 8 = 13$. Equation: $13 - 4$
*   **Step 3 (Subtraction):** $13 - 4 = 9$. **Answer: 9**

**5. $36 \div 9 \times 2 + 14 - 10 \div 5$**
*   **Step 1 (Division - Left to Right):** $36 \div 9 = 4$. Equation: $4 \times 2 + 14 - 10 \div 5$
*   **Step 2 (Multiplication):** $4 \times 2 = 8$. Equation: $8 + 14 - 10 \div 5$
*   **Step 3 (Division - Right side):** $10 \div 5 = 2$. Equation: $8 + 14 - 2$
*   **Step 4 (Addition):** $8 + 14 = 22$. Equation: $22 - 2$
*   **Step 5 (Subtraction):** $22 - 2 = 20$. **Answer: 20**

**6. $25 - [ 16 - \{ 14 - ( 12 - \overline{9 - 3} ) \} ]$** *(Vinculum/Bar bracket)*
*   **Step 1 (Vinculum):** $\overline{9 - 3} = 6$. Equation: $25 - [ 16 - \{ 14 - ( 12 - 6 ) \} ]$
*   **Step 2 (Small Bracket):** $12 - 6 = 6$. Equation: $25 - [ 16 - \{ 14 - 6 \} ]$
*   **Step 3 (Curly Bracket):** $14 - 6 = 8$. Equation: $25 - [ 16 - 8 ]$
*   **Step 4 (Square Bracket):** $16 - 8 = 8$. Equation: $25 - 8$
*   **Step 5 (Final):** $25 - 8 = 17$. **Answer: 17**

**7. $45 \div 5 \text{ of } 3 + 24 \div 4 - 3 \times 2$**
*   **Step 1 (Of):** $5 \text{ of } 3 = 15$. Equation: $45 \div 15 + 24 \div 4 - 3 \times 2$
*   **Step 2 (Division):** $45 \div 15 = 3$ AND $24 \div 4 = 6$. Equation: $3 + 6 - 3 \times 2$
*   **Step 3 (Multiplication):** $3 \times 2 = 6$. Equation: $3 + 6 - 6$
*   **Step 4 (Add/Sub Left to Right):** $3 + 6 = 9$. $9 - 6 = 3$. **Answer: 3**

**8. $\frac{2}{3} \text{ of } 18 + \frac{3}{4} \text{ of } 24 - 15$**
*   **Step 1 (Of):** $\frac{2}{3} \times 18 = 12$. AND $\frac{3}{4} \times 24 = 18$. Equation: $12 + 18 - 15$
*   **Step 2 (Addition):** $12 + 18 = 30$. Equation: $30 - 15$
*   **Step 3 (Subtraction):** $30 - 15 = 15$. **Answer: 15**

**9. $100 - [ 20 + \{ 30 - 2( 10 - 4 ) \} ]$**
*   **Step 1 (Innermost Bracket):** $10 - 4 = 6$. Equation: $100 - [ 20 + \{ 30 - 2(6) \} ]$
*   **Step 2 (Multiplication inside curly):** $2 \times 6 = 12$. Equation: $100 - [ 20 + \{ 30 - 12 \} ]$
*   **Step 3 (Curly Bracket):** $30 - 12 = 18$. Equation: $100 - [ 20 + 18 ]$
*   **Step 4 (Square Bracket):** $20 + 18 = 38$. Equation: $100 - 38$
*   **Step 5 (Final):** $100 - 38 = 62$. **Answer: 62**

**10. $8 \div 4 \text{ of } 2 + ( 15 - 2 \times 6 )$**
*   **Step 1 (Bracket):** $2 \times 6 = 12$. $15 - 12 = 3$. Equation: $8 \div 4 \text{ of } 2 + 3$
*   **Step 2 (Of):** $4 \text{ of } 2 = 8$. Equation: $8 \div 8 + 3$
*   **Step 3 (Division):** $8 \div 8 = 1$. Equation: $1 + 3$
*   **Step 4 (Addition):** $1 + 3 = 4$. **Answer: 4**

---

## Part 2: Surds and Indices (Laws of Exponents)

### The Concept & Pattern
**Pattern Recognition:** If you see variables in the power (e.g., $2^x = 32$, or $5^{x+1} / 5^x$), or large numbers that can be broken into prime factors (e.g., $27^{2/3}$), use Indices.
**The Golden Rule:** Convert everything to the same base. If you can't, use the laws of exponents.

**Core Formulas:**
1. $a^m \times a^n = a^{m+n}$
2. $a^m \div a^n = a^{m-n}$
3. $(a^m)^n = a^{m \times n}$
4. $a^0 = 1$
5. $a^{-m} = \frac{1}{a^m}$
6. $a^{m/n} = (\sqrt[n]{a})^m$

### Step-by-Step Examples (10 Problems)

**1. Solve for x: $2^x = 32$**
*   **Step 1:** Express 32 as a power of 2. $32 = 2 \times 2 \times 2 \times 2 \times 2 = 2^5$.
*   **Step 2:** Equation becomes $2^x = 2^5$.
*   **Step 3:** Since bases are same, powers must be equal. $x = 5$. **Answer: 5**

**2. Simplify: $\frac{5^{x+3}}{5^{x-1}}$**
*   **Step 1:** Use formula $a^m \div a^n = a^{m-n}$.
*   **Step 2:** Subtract powers: $(x + 3) - (x - 1)$.
*   **Step 3:** $x + 3 - x + 1 = 4$.
*   **Step 4:** Result is $5^4$. **Answer: $5^4$ (or 625)**

**3. Find the value of: $(256)^{0.16} \times (256)^{0.09}$**
*   **Step 1:** Bases are same (256). Use $a^m \times a^n = a^{m+n}$.
*   **Step 2:** Add powers: $0.16 + 0.09 = 0.25$.
*   **Step 3:** Expression is $256^{0.25}$.
*   **Step 4:** Convert decimal to fraction: $0.25 = \frac{1}{4}$. So, $256^{1/4}$.
*   **Step 5:** $256^{1/4}$ means the 4th root of 256. $4 \times 4 \times 4 \times 4 = 256$. **Answer: 4**

**4. If $3^{x-y} = 81$ and $3^{x+y} = 729$, find x.**
*   **Step 1:** Convert 81 and 729 to base 3. $81 = 3^4$, $729 = 3^6$.
*   **Step 2:** Equations become: $3^{x-y} = 3^4 \Rightarrow x - y = 4$ (Eq 1)
*   **Step 3:** And $3^{x+y} = 3^6 \Rightarrow x + y = 6$ (Eq 2)
*   **Step 4:** Add Eq 1 and Eq 2: $(x - y) + (x + y) = 4 + 6 \Rightarrow 2x = 10$.
*   **Step 5:** $x = 5$. **Answer: 5**

**5. Simplify: $(x^a / x^b)^{a^2+ab+b^2} \times (x^b / x^c)^{b^2+bc+c^2} \times (x^c / x^a)^{c^2+ca+a^2}$** *(Classic Infosys hard question)*
*   **Step 1:** Simplify inside brackets first. $x^a / x^b = x^{a-b}$.
*   **Step 2:** Apply outer power: $(x^{a-b})^{a^2+ab+b^2} = x^{(a-b)(a^2+ab+b^2)}$.
*   **Step 3:** Recognize algebra identity: $(a-b)(a^2+ab+b^2) = a^3 - b^3$. So, first term is $x^{a^3 - b^3}$.
*   **Step 4:** Similarly, second term is $x^{b^3 - c^3}$, third term is $x^{c^3 - a^3}$.
*   **Step 5:** Multiply them (add powers): $(a^3 - b^3) + (b^3 - c^3) + (c^3 - a^3) = 0$.
*   **Step 6:** $x^0 = 1$. **Answer: 1**

**6. Evaluate: $2^{-3} \times 3^{-2}$**
*   **Step 1:** Apply negative power rule $a^{-m} = 1/a^m$.
*   **Step 2:** $2^{-3} = \frac{1}{2^3} = \frac{1}{8}$.
*   **Step 3:** $3^{-2} = \frac{1}{3^2} = \frac{1}{9}$.
*   **Step 4:** Multiply: $\frac{1}{8} \times \frac{1}{9} = \frac{1}{72}$. **Answer: 1/72**

**7. Solve: $4^{x} = 64$**
*   **Step 1:** Express both in base 2. $4 = 2^2$, so $4^x = (2^2)^x = 2^{2x}$.
*   **Step 2:** $64 = 2^6$.
*   **Step 3:** Equation: $2^{2x} = 2^6$.
*   **Step 4:** Equate powers: $2x = 6 \Rightarrow x = 3$. **Answer: 3**

**8. Simplify: $\frac{5^{n+2} - 5^{n+1}}{4 \times 5^n}$**
*   **Step 1:** Factor out $5^{n+1}$ from the numerator: $5^{n+1}(5^1 - 1) = 5^{n+1}(4)$.
*   **Step 2:** Put back in fraction: $\frac{5^{n+1} \times 4}{4 \times 5^n}$.
*   **Step 3:** Cancel the 4s: $\frac{5^{n+1}}{5^n}$.
*   **Step 4:** Divide powers: $5^{(n+1)-n} = 5^1 = 5$. **Answer: 5**

**9. Find value of: $(0.04)^{-1.5}$**
*   **Step 1:** Convert decimal to fraction: $0.04 = \frac{4}{100} = \frac{1}{25}$.
*   **Step 2:** Expression: $(\frac{1}{25})^{-1.5}$.
*   **Step 3:** Negative power flips fraction: $(25)^{1.5}$.
*   **Step 4:** $1.5 = \frac{3}{2}$. So, $25^{3/2} = (\sqrt{25})^3 = 5^3 = 125$. **Answer: 125**

**10. If $a = 3$, find $a^3 - a^2 + a$**
*   **Step 1:** Substitute $a = 3$.
*   **Step 2:** Calculate $3^3 = 27$.
*   **Step 3:** Calculate $3^2 = 9$.
*   **Step 4:** Equation: $27 - 9 + 3$.
*   **Step 5:** $27 - 9 = 18$. $18 + 3 = 21$. **Answer: 21**

---

## Part 3: Square Roots & Cube Roots (Speed Shortcuts)

### The Concept & Pattern
**Pattern Recognition:** If asked to find $\sqrt{X}$ or $\sqrt[3]{X}$ where X is a 4 to 6 digit perfect square/cube, **do not use long division**. Use the unit-digit shortcut.

**Shortcut 1: Square Roots (Unit Digit Method)**
Memorize the unit digits of squares:
*   Ends in 1 $\rightarrow$ Root ends in **1 or 9**
*   Ends in 4 $\rightarrow$ Root ends in **2 or 8**
*   Ends in 5 $\rightarrow$ Root ends in **5**
*   Ends in 6 $\rightarrow$ Root ends in **4 or 6**
*   Ends in 9 $\rightarrow$ Root ends in **3 or 7**
*   Ends in 0 $\rightarrow$ Root ends in **0** (must be even number of zeros)
*(Note: If it ends in 2, 3, 7, 8, it's NOT a perfect square!)*
**How to find the tens digit:** Ignore the last two digits of the number. Look at the remaining part. Find between which two consecutive perfect squares it lies. Take the smaller number.

**Shortcut 2: Cube Roots (Unit Digit Method)**
Memorize the unit digits of cubes (Notice the magic pattern! 1-1, 8-2, 27-3, 64-4, 125-5, 216-6, 343-7, 512-8, 729-9):
*   Ends in 1 $\rightarrow$ Root ends in **1**
*   Ends in 2 $\rightarrow$ Root ends in **8**
*   Ends in 3 $\rightarrow$ Root ends in **7**
*   Ends in 4 $\rightarrow$ Root ends in **4**
*   Ends in 5 $\rightarrow$ Root ends in **5**
*   Ends in 6 $\rightarrow$ Root ends in **6**
*   Ends in 7 $\rightarrow$ Root ends in **3**
*   Ends in 8 $\rightarrow$ Root ends in **2**
*   Ends in 9 $\rightarrow$ Root ends in **9**
*   Ends in 0 $\rightarrow$ Root ends in **0**
**How to find tens digit:** Group digits in threes from the right. Ignore the last group. Find the cube root of the remaining part.

### Step-by-Step Examples (10 Problems)

**1. Find $\sqrt{1849}$**
*   **Step 1 (Unit digit):** Ends in 9. Root ends in 3 or 7.
*   **Step 2 (Tens digit):** Ignore last two digits (49). Remaining is 18.
*   **Step 3:** $4^2 = 16$, $5^2 = 25$. 18 lies between 16 and 25. Take the smaller: 4.
*   **Step 4:** Tens digit is 4. Root is 43 or 47.
*   **Step 5 (Check):** $43^2 = 1849$. (Shortcut trick: $4 \times 5 = 20$, $18 < 20$, so pick the smaller unit digit 3). **Answer: 43**

**2. Find $\sqrt{5776}$**
*   **Step 1:** Ends in 6. Root ends in 4 or 6.
*   **Step 2:** Ignore 76. Remaining is 57.
*   **Step 3:** $7^2 = 49$, $8^2 = 64$. 57 is between them. Tens digit = 7.
*   **Step 4:** Root is 74 or 76.
*   **Step 5 (Check):** $7 \times 8 = 56$. $57 > 56$, so pick the larger unit digit 6. **Answer: 76**

**3. Find $\sqrt{9801}$**
*   **Step 1:** Ends in 1. Root ends in 1 or 9.
*   **Step 2:** Ignore 01. Remaining 98.
*   **Step 3:** $9^2 = 81$, $10^2 = 100$. Tens digit = 9.
*   **Step 4:** Root is 91 or 99. $9 \times 10 = 90$. $98 > 90$, pick larger (9). **Answer: 99**

**4. Find $\sqrt{3364}$**
*   **Step 1:** Ends in 4. Root ends in 2 or 8.
*   **Step 2:** Ignore 64. Remaining 33.
*   **Step 3:** $5^2 = 25$, $6^2 = 36$. Tens digit = 5.
*   **Step 4:** Root is 52 or 58. $5 \times 6 = 30$. $33 > 30$, pick larger (8). **Answer: 58**

**5. Find $\sqrt{12544}$**
*   **Step 1:** Ends in 4. Root ends in 2 or 8.
*   **Step 2:** Ignore 44. Remaining 125.
*   **Step 3:** $11^2 = 121$, $12^2 = 144$. Tens digit = 11.
*   **Step 4:** Root is 112 or 118. $11 \times 12 = 132$. $125 < 132$, pick smaller (2). **Answer: 112**

**6. Find $\sqrt[3]{13824}$**
*   **Step 1 (Unit digit):** Ends in 4. Root ends in **4**.
*   **Step 2 (Tens digit):** Group in threes: 13 | 824. Ignore 824. Remaining is 13.
*   **Step 3:** $2^3 = 8$, $3^3 = 27$. 13 lies between them. Take smaller: 2.
*   **Step 4:** Combine tens and units: 24. **Answer: 24**

**7. Find $\sqrt[3]{17576}$**
*   **Step 1:** Ends in 6. Root ends in **6**.
*   **Step 2:** Group: 17 | 576. Remaining 17.
*   **Step 3:** $2^3 = 8$, $3^3 = 27$. Tens digit = 2.
*   **Step 4:** Combine: 26. **Answer: 26**

**8. Find $\sqrt[3]{50653}$**
*   **Step 1:** Ends in 3. Root ends in **7**.
*   **Step 2:** Group: 50 | 653. Remaining 50.
*   **Step 3:** $3^3 = 27$, $4^3 = 64$. Tens digit = 3.
*   **Step 4:** Combine: 37. **Answer: 37**

**9. Find $\sqrt[3]{21952}$**
*   **Step 1:** Ends in 2. Root ends in **8**.
*   **Step 2:** Group: 21 | 952. Remaining 21.
*   **Step 3:** $2^3 = 8$, $3^3 = 27$. Tens digit = 2.
*   **Step 4:** Combine: 28. **Answer: 28**

**10. Find $\sqrt[3]{68921}$**
*   **Step 1:** Ends in 1. Root ends in **1**.
*   **Step 2:** Group: 68 | 921. Remaining 68.
*   **Step 3:** $4^3 = 64$, $5^3 = 125$. Tens digit = 4.
*   **Step 4:** Combine: 41. **Answer: 41**

---

## Part 4: Approximation & Fraction-Percentage Master Table

### The Concept & Pattern
**Pattern Recognition:** If the question says **"What approximate value should come in place of the question mark?"** or **"What is the approximate value of..."**, DO NOT calculate exactly. Round off numbers to the nearest integers or simple multiples of 10/100.
**The Secret Weapon:** The Fraction-to-Percentage table. Convert complex decimals/fractions to simple percentages mentally.

**Master Fraction-Percentage Table (Memorize this!):**
*   $1/2 = 50\%$
*   $1/3 = 33.33\%$
*   $1/4 = 25\%$
*   $1/5 = 20\%$
*   $1/6 = 16.66\%$
*   $1/7 = 14.28\%$ (approx 14.3%)
*   $1/8 = 12.5\%$
*   $1/9 = 11.11\%$
*   $1/10 = 10\%$
*   $1/11 = 9.09\%$
*   $1/12 = 8.33\%$
*   $1/13 = 7.69\%$
*   $1/14 = 7.14\%$
*   $1/15 = 6.66\%$

### Step-by-Step Examples (10 Problems)

**1. $19.02 \times 4.99 \times X = 380$**
*   **Step 1 (Round off):** $19.02 \approx 19$. $4.99 \approx 5$.
*   **Step 2 (Simplify):** $19 \times 5 \times X = 380 \Rightarrow 95 \times X = 380$.
*   **Step 3 (Solve):** $X = 380 / 95 = 4$. **Answer: 4**

**2. $34.95\% \text{ of } 780 + 44.8\% \text{ of } 250 = ?$**
*   **Step 1 (Round off):** $34.95\% \approx 35\%$. $44.8\% \approx 45\%$.
*   **Step 2 (Convert to fractions):** $35\% = 7/20$. $45\% = 9/20$.
*   **Step 3 (Calculate):** $(7/20) \times 780 = 7 \times 39 = 273$.
*   **Step 4 (Calculate):** $(9/20) \times 250 = 9 \times 12.5 = 112.5$.
*   **Step 5 (Add):** $273 + 112.5 = 385.5 \approx 386$. **Answer: 386**

**3. $\sqrt{624.9} \times 4.99^2 = ? \times 10$**
*   **Step 1 (Round off):** $\sqrt{625} = 25$. $4.99 \approx 5$.
*   **Step 2 (Simplify):** $25 \times 5^2 = X \times 10$.
*   **Step 3 (Calculate):** $25 \times 25 = 625$.
*   **Step 4 (Solve):** $625 = 10X \Rightarrow X = 62.5 \approx 63$. **Answer: 63**

**4. $14.28\% \text{ of } 420 + 11.11\% \text{ of } 360 = ?$**
*   **Step 1 (Identify fractions):** $14.28\% = 1/7$. $11.11\% = 1/9$.
*   **Step 2 (Calculate):** $(1/7) \times 420 = 60$.
*   **Step 3 (Calculate):** $(1/9) \times 360 = 40$.
*   **Step 4 (Add):** $60 + 40 = 100$. **Answer: 100**

**5. $29.98\% \text{ of } 450 - 12.5\% \text{ of } 160 = ?$**
*   **Step 1 (Round off & Identify):** $29.98\% \approx 30\% = 3/10$. $12.5\% = 1/8$.
*   **Step 2 (Calculate):** $(3/10) \times 450 = 3 \times 45 = 135$.
*   **Step 3 (Calculate):** $(1/8) \times 160 = 20$.
*   **Step 4 (Subtract):** $135 - 20 = 115$. **Answer: 115**

**6. $15\% \text{ of } 840 + 25\% \text{ of } X = 252$**
*   **Step 1 (Calculate first part):** $15\% = 3/20$. $(3/20) \times 840 = 3 \times 42 = 126$.
*   **Step 2 (Substitute):** $126 + 0.25X = 252$.
*   **Step 3 (Solve):** $0.25X = 252 - 126 = 126$.
*   **Step 4 (Final):** $X = 126 / 0.25 = 126 \times 4 = 504$. **Answer: 504**

**7. $(12.13)^2 + (8.98)^2 = ?$**
*   **Step 1 (Round off):** $12.13 \approx 12$. $8.98 \approx 9$.
*   **Step 2 (Calculate squares):** $12^2 = 144$. $9^2 = 81$.
*   **Step 3 (Add):** $144 + 81 = 225$. **Answer: 225**

**8. $44.99 \div 4.99 + 19.99 \times 2.01 = ?$**
*   **Step 1 (Round off):** $45 \div 5 + 20 \times 2$.
*   **Step 2 (Calculate):** $9 + 40 = 49$. **Answer: 49**

**9. $33.33\% \text{ of } 600 - 16.66\% \text{ of } 300 = ?$**
*   **Step 1 (Identify fractions):** $33.33\% = 1/3$. $16.66\% = 1/6$.
*   **Step 2 (Calculate):** $(1/3) \times 600 = 200$.
*   **Step 3 (Calculate):** $(1/6) \times 300 = 50$.
*   **Step 4 (Subtract):** $200 - 50 = 150$. **Answer: 150**

**10. $\sqrt{1024} \times 3.01\% \text{ of } 500 = ?$**
*   **Step 1 (Calculate root):** $\sqrt{1024} = 32$.
*   **Step 2 (Round off percentage):** $3.01\% \approx 3\%$.
*   **Step 3 (Calculate percentage):** $3\% \text{ of } 500 = (3/100) \times 500 = 15$.
*   **Step 4 (Multiply):** $32 \times 15 = 480$. **Answer: 480**

---

## Part 5: Vedic Math & Fast Calculation Shortcuts

### The Concept & Pattern
**Pattern Recognition:** When you see numbers ending in 5 being squared, or numbers very close to 100, 1000, 10000 being multiplied.

**Shortcut 1: Squaring numbers ending in 5**
Formula: $(X5)^2 = X \times (X+1) | 25$
*Example:* $75^2 \rightarrow 7 \times 8 = 56 | 25 \rightarrow 5625$.

**Shortcut 2: Multiplying numbers near a base (100, 1000)**
Formula: $(100+a) \times (100+b) = (100+a+b) | a \times b$ (for base 100)
*Example:* $104 \times 107 \rightarrow 104+7 = 111 | 4 \times 7 = 28 \rightarrow 11128$.

### Step-by-Step Examples (10 Problems)

**1. $65^2$**
*   **Step 1:** Split 6 and 5.
*   **Step 2:** Multiply tens digit by next number: $6 \times 7 = 42$.
*   **Step 3:** Append 25: $4225$. **Answer: 4225**

**2. $85^2$**
*   **Step 1:** $8 \times 9 = 72$.
*   **Step 2:** Append 25. **Answer: 7225**

**3. $105^2$**
*   **Step 1:** $10 \times 11 = 110$.
*   **Step 2:** Append 25. **Answer: 11025**

**4. $103 \times 106$**
*   **Step 1:** Base is 100. Deficiencies/Surpluses: +3 and +6.
*   **Step 2:** Cross add: $103 + 6 = 109$ (or $106 + 3 = 109$). This is the left part.
*   **Step 3:** Multiply surpluses: $3 \times 6 = 18$. This is the right part.
*   **Step 4:** Combine: $10918$. **Answer: 10918**

**5. $108 \times 109$**
*   **Step 1:** Surpluses: +8 and +9.
*   **Step 2:** Cross add: $108 + 9 = 117$.
*   **Step 3:** Multiply: $8 \times 9 = 72$.
*   **Step 4:** Combine: $11772$. **Answer: 11772**

**6. $96 \times 97$** *(Numbers below base)*
*   **Step 1:** Base 100. Deficiencies: -4 and -3.
*   **Step 2:** Cross subtract: $96 - 3 = 93$.
*   **Step 3:** Multiply deficiencies: $-4 \times -3 = 12$.
*   **Step 4:** Combine: $9312$. **Answer: 9312**

**7. $112 \times 114$**
*   **Step 1:** Surpluses: +12 and +14.
*   **Step 2:** Cross add: $112 + 14 = 126$.
*   **Step 3:** Multiply: $12 \times 14 = 168$.
*   **Step 4:** Since base is 100, right part can only have 2 digits. Carry over 1 from 168 to 126. $126 + 1 = 127$. Right part is 68.
*   **Step 5:** Combine: $12768$. **Answer: 12768**

**8. $35^2$**
*   **Step 1:** $3 \times 4 = 12$.
*   **Step 2:** Append 25. **Answer: 1225**

**9. $1004 \times 1005$** *(Base 1000)*
*   **Step 1:** Surpluses: +4 and +5.
*   **Step 2:** Cross add: $1004 + 5 = 1009$.
*   **Step 3:** Multiply: $4 \times 5 = 20$.
*   **Step 4:** Base 1000 means right part needs 3 digits. So, 020.
*   **Step 5:** Combine: $1009020$. **Answer: 1009020**

**10. $994 \times 996$** *(Base 1000)*
*   **Step 1:** Deficiencies: -6 and -4.
*   **Step 2:** Cross subtract: $994 - 6 = 988$.
*   **Step 3:** Multiply: $-6 \times -4 = 24$.
*   **Step 4:** Right part needs 3 digits: 024.
*   **Step 5:** Combine: $988024$. **Answer: 988024**

---

## How to Identify Which Tool to Use (Pattern Summary)

When you see a question in the exam, scan it for these triggers:

1.  **Trigger:** Long expression with mixed operators and brackets.
    *   **Action:** Apply **BODMAS/VBODMAS**. Watch out for "of".
2.  **Trigger:** Variables in exponents ($2^x$, $3^{x-1}$) or fractional powers ($27^{2/3}$).
    *   **Action:** Use **Laws of Indices**. Convert to same base.
3.  **Trigger:** "Find the square root/cube root of [large number]".
    *   **Action:** Use **Unit Digit Shortcut**. Do not do manual division.
4.  **Trigger:** "Approximate value", numbers like 19.99, 34.95%.
    *   **Action:** **Round off** immediately. Use **Fraction-Percentage table**.
5.  **Trigger:** Squaring numbers ending in 5, or multiplying 3-digit numbers near 100.
    *   **Action:** Use **Vedic Math Shortcuts**.

---

## Resources for Practice (Old Placement Papers)

To get the exact PDFs and Google Drive links for past papers, use these specific search queries and platforms. These are the goldmines for MNC placement prep:

1.  **IndiaBIX (Website):** Go to the "Verbal/Quantitative Aptitude" section. Search for "Simplification" and "Approximation". They have 1000+ questions with step-by-step solutions.
2.  **PrepInsta (Website):** Search for "TCS NQT Quantitative Aptitude Questions" or "Infosys Quants". They provide company-specific previous year questions.
3.  **GeeksforGeeks (Website):** Search "Simplification and Approximation for Placements". Excellent for learning the exact shortcuts used in coding/IT company tests.
4.  **Google Search for Drive Links:**
    *   Search query: `"TCS NQT previous year question paper" site:drive.google.com`
    *   Search query: `"Infosys aptitude previous year questions" site:drive.google.com`
    *   Search query: `"Wipro elite aptitude questions pdf" site:drive.google.com`
    *   *Note: Many coaching institutes and students upload massive ZIP files/PDFs of past 5 years' papers to public Drive folders. These links change frequently, so searching these exact strings will yield the freshest active links.*

**Your Next Step:** Take the 50 examples provided above, cover the solutions, and solve them yourself using the step-by-step logic. Once you can solve them without looking, move to the practice resources and do 100 more. You will master this topic in 2 days!