/**
 * ot-questions.mjs — 60 practice problems + 60 MCQs for Output Tracing.
 * Every snippet is re-executed by the interpreter in ot-lib.mjs at build time.
 * Convention: "/" = integer division, MOD = remainder, quoted values are TEXT.
 */
import { P, M } from './ot-lib.mjs';

/* ================================================================== */
/* F1  seq-overwrite — 10 problems                                     */
/* ================================================================== */
export const practice = {
  'seq-overwrite': [
    P('so1', `a = 7\nb = a + 5\na = b - 2\nprint a, b`, ['10, 12', '12, 12', '10, 10', '12, 10'], 0,
      [
        '$a = 7$.',
        '$b = a + 5 = 7 + 5 = 12$ — uses the current $a$.',
        '$a = b - 2 = 12 - 2 = 10$ — uses the new $b$; old $a = 7$ is gone.',
        'print: $a = 10$, $b = 12$.'
      ], { d: 'easy' }),

    P('so2', `x = 3\ny = x * x\nx = y + x\nprint x`, ['12', '9', '6', '18'], 0,
      [
        '$x = 3$.',
        '$y = 3 \\times 3 = 9$.',
        '$x = y + x = 9 + 3 = 12$.',
        'Output is 12.'
      ], { d: 'easy' }),

    P('so3', `p = 2\nq = p * p * p\nq = q - p\nprint q`, ['6', '8', '4', '2'], 0,
      [
        '$p = 2$, so $q = 2 \\times 2 \\times 2 = 8$.',
        '$q = 8 - 2 = 6$.',
        'Output is 6.'
      ], { d: 'easy' }),

    P('so4', `n = 20\nm = n / 4\nn = m * 5\nprint n, m`, ['25, 5', '5, 5', '25, 25', '20, 5'], 0,
      [
        '$m = 20 / 4 = 5$.',
        '$n = m \\times 5 = 5 \\times 5 = 25$.',
        'print: $n = 25$, $m = 5$.'
      ], { d: 'easy' }),

    P('so5', `t = 9\nt = t - 4\nt = t * t\nprint t`, ['25', '81', '45', '5'], 0,
      [
        '$t = 9$.',
        '$t = 9 - 4 = 5$.',
        '$t = 5 \\times 5 = 25$.'
      ], { d: 'easy' }),

    P('so6', `a = 1\nb = 2\nc = 3\na = a + b\nc = c - a\nprint c`, ['0', '3', '-1', '2'], 0,
      [
        '$a = 1$, $b = 2$, $c = 3$.',
        '$a = a + b = 1 + 2 = 3$ — $a$ is updated FIRST.',
        '$c = c - a = 3 - 3 = 0$ — uses the UPDATED $a$, not the old 1.',
        'Output is 0.'
      ], { d: 'medium' }),

    P('so7', `x = 15\ny = x / 2\nz = x MOD 2\nw = y + z\nprint w`, ['8', '7', '7.5', '1'], 0,
      [
        '$y = 15 / 2 = 7$ — integer division drops the 0.5.',
        '$z = 15 \\bmod 2 = 1$.',
        '$w = 7 + 1 = 8$.'
      ], { d: 'medium' }),

    P('so8', `v = 100\nv = v / 2\nv = v / 5\nv = v + 30\nprint v`, ['40', '50', '70', '130'], 0,
      [
        '$v = 100 / 2 = 50$.',
        '$v = 50 / 5 = 10$.',
        '$v = 10 + 30 = 40$.'
      ], { d: 'easy' }),

    P('so9', `a = 6\nb = 8\na = a * b\nb = b - a\nprint b`, ['-40', '40', '-48', '48'], 0,
      [
        '$a = 6 \\times 8 = 48$.',
        '$b = b - a = 8 - 48 = -40$ — the new huge $a$ is used.',
        'Output is $-40$.'
      ], { d: 'medium' }),

    P('so10', `r = 5\ns = r + 1\nr = s - 1\ns = r + 1\nprint r + s`, ['11', '10', '12', '9'], 0,
      [
        '$s = 5 + 1 = 6$.',
        '$r = 6 - 1 = 5$.',
        '$s = 5 + 1 = 6$.',
        '$r + s = 5 + 6 = 11$.'
      ], { d: 'medium' }),
  ],

  /* ================================================================ */
  /* F2 swap-temp — 10 problems                                        */
  /* ================================================================ */
  'swap-temp': [
    P('st1', `a = 4\nb = 11\ntemp = a\na = b\nb = temp\nprint a, b`, ['11, 4', '4, 11', '11, 11', '4, 4'], 0,
      [
        '$temp = 4$ saves the old $a$.',
        '$a = b = 11$.',
        '$b = temp = 4$ restores the old $a$.',
        'Values exchanged: $11, 4$.'
      ], { d: 'easy' }),

    P('st2', `x = 8\ny = 3\nz = x\nx = y\ny = z\nprint x + y`, ['11', '16', '5', '6'], 0,
      [
        '$z = 8$ saves old $x$.',
        '$x = 3$, $y = 8$: swapped.',
        '$x + y = 3 + 8 = 11$.'
      ], { d: 'easy' }),

    P('st3', `m = 5\nn = 9\nm = n\nn = m\nprint m, n`, ['9, 9', '9, 5', '5, 9', '5, 5'], 0,
      [
        '$m = n = 9$ — old $m = 5$ is destroyed.',
        '$n = m = 9$ — copies the same 9 back.',
        'No swap happened: both print 9. This is the classic fake-swap trap.'
      ], { d: 'easy' }),

    P('st4', `p = 7\nq = 2\ntemp = q\nq = p\np = temp\nprint p * q`, ['14', '49', '4', '9'], 0,
      [
        '$temp = 2$ saves old $q$.',
        '$q = 7$, $p = 2$: swapped.',
        '$p \\times q = 2 \\times 7 = 14$.'
      ], { d: 'medium' }),

    P('st5', `a = 10\nb = 20\nc = a\na = b\nb = c\nc = a + b\nprint c`, ['30', '20', '40', '10'], 0,
      [
        '$c = 10$ (old $a$), then $a = 20$, $b = 10$.',
        'Now $c$ is OVERWRITTEN: $c = a + b = 20 + 10 = 30$.',
        'Output is 30.'
      ], { d: 'medium' }),

    P('st6', `x = 3\ny = 8\nt = x\nx = y\ny = t\nprint x - y`, ['5', '-5', '11', '-11'], 0,
      [
        'Swap first: $x = 8$, $y = 3$.',
        '$x - y = 8 - 3 = 5$.'
      ], { d: 'easy' }),

    P('st7', `a = 6\nb = 6\ntemp = a\na = b\nb = temp\nprint a + b`, ['12', '0', '6', '36'], 0,
      [
        'Swapping equal values changes nothing: $a = 6$, $b = 6$.',
        '$a + b = 12$.'
      ], { d: 'easy' }),

    P('st8', `n1 = 15\nn2 = 4\nt = n1\nn1 = n2\nn2 = t\nprint n1 / n2`, ['0', '3', '2', '4'], 0,
      [
        'After the swap: $n1 = 4$, $n2 = 15$.',
        '$4 / 15 = 0$ — integer division of a smaller number.',
        'Output is 0.'
      ], { d: 'medium' }),

    P('st9', `a = 5\nb = 9\nswap = a\na = b\nb = swap\nprint b - a`, ['-4', '4', '14', '-14'], 0,
      [
        'After the swap: $a = 9$, $b = 5$.',
        '$b - a = 5 - 9 = -4$.'
      ], { d: 'medium' }),

    P('st10', `x = 1\ny = 2\nz = 3\nt = x\nx = y\ny = z\nz = t\nprint x * 100 + y * 10 + z`, ['231', '123', '321', '213'], 0,
      [
        '$t = 1$; $x = 2$; $y = 3$; $z = 1$ — values rotate one slot.',
        '$x \\times 100 + y \\times 10 + z = 200 + 30 + 1 = 231$.'
      ], { d: 'medium' }),
  ],

  /* ================================================================ */
  /* F3 arith-swap — 10 problems                                       */
  /* ================================================================ */
  'arith-swap': [
    P('as1', `a = 12\nb = 5\na = a + b\nb = a - b\na = a - b\nprint a, b`, ['5, 12', '12, 5', '17, 12', '5, 5'], 0,
      [
        '$a = 12 + 5 = 17$ (the sum).',
        '$b = 17 - 5 = 12$ (old $a$).',
        '$a = 17 - 12 = 5$ (old $b$).',
        'Swapped: $5, 12$.'
      ], { d: 'easy' }),

    P('as2', `x = 7\ny = 2\nx = x + y\ny = x - y\nx = x - y\nprint x + y`, ['9', '14', '4', '18'], 0,
      [
        'The routine swaps the values: $x = 2$, $y = 7$.',
        'A swap never changes the sum: $2 + 7 = 9$.'
      ], { d: 'easy' }),

    P('as3', `p = 4\nq = 6\np = p + q\nq = p - q\np = p - q\nprint p * q`, ['24', '10', '2', '20'], 0,
      [
        'After the swap: $p = 6$, $q = 4$.',
        '$6 \\times 4 = 24$.'
      ], { d: 'easy' }),

    P('as4', `a = 9\nb = 3\na = a + b\nb = a - b\na = a - b\nprint a / b`, ['0', '3', '1', '2'], 0,
      [
        'After the swap: $a = 3$, $b = 9$.',
        '$a / b = 3 / 9 = 0$ — integer division.',
        'Output is 0.'
      ], { d: 'medium' }),

    P('as5', `x = 20\ny = 8\nx = x - y\ny = x + y\nx = y - x\nprint x, y`, ['8, 20', '20, 8', '12, 20', '8, 12'], 0,
      [
        '$x = 20 - 8 = 12$ (difference).',
        '$y = 12 + 8 = 20$ (old $x$).',
        '$x = 20 - 12 = 8$ (old $y$).',
        'Subtract-flavoured swap: $8, 20$.'
      ], { d: 'hard' }),

    P('as6', `a = 5\nb = 10\na = a + b\nb = a - b\nprint a, b`, ['15, 5', '5, 10', '15, 10', '10, 5'], 0,
      [
        '$a = 5 + 10 = 15$.',
        '$b = 15 - 10 = 5$.',
        'Only two lines ran — the third ($a = a - b$) is missing, so $a$ still holds the sum 15. Output: $15, 5$.'
      ], { d: 'medium' }),

    P('as7', `m = 3\nn = 4\nm = m * n\nn = m / n\nm = m / n\nprint m, n`, ['4, 3', '3, 4', '12, 3', '4, 4'], 0,
      [
        '$m = 3 \\times 4 = 12$ (the product).',
        '$n = 12 / 4 = 3$ (old $m$).',
        '$m = 12 / 3 = 4$ (old $n$).',
        'Multiply/divide swap: $4, 3$.'
      ], { d: 'medium' }),

    P('as8', `a = 2\nb = 6\na = a + b\nb = a - b\na = a - b\nb = b + 1\nprint a, b`, ['6, 3', '2, 3', '6, 2', '3, 6'], 0,
      [
        'Lines 1-3 swap: $a = 6$, $b = 2$.',
        '$b = 2 + 1 = 3$ — the extra line runs AFTER the swap.',
        'Output: $6, 3$.'
      ], { d: 'medium' }),

    P('as9', `x = 30\ny = 10\nx = x + y\ny = x - y\nx = x - y\nprint y / x`, ['3', '0', '1', '30'], 0,
      [
        'After the swap: $x = 10$, $y = 30$.',
        '$y / x = 30 / 10 = 3$.'
      ], { d: 'easy' }),

    P('as10', `a = 8\nb = 3\na = a + b\nb = a - b\na = a - b\nc = a * 10 + b\nprint c`, ['38', '83', '110', '11'], 0,
      [
        'Swap first: $a = 3$, $b = 8$.',
        '$c = 3 \\times 10 + 8 = 38$.'
      ], { d: 'medium' }),
  ],

  /* ================================================================ */
  /* F4 div-mod-pair — 10 problems                                     */
  /* ================================================================ */
  'div-mod-pair': [
    P('dm1', `n = 17\nq = n / 5\nr = n MOD 5\nprint q, r`, ['3, 2', '2, 3', '3.4, 2', '3, 3'], 0,
      [
        '$q = 17 / 5 = 3$ — fraction dropped.',
        '$r = 17 \\bmod 5 = 2$.',
        'print: $3, 2$.'
      ], { d: 'easy' }),

    P('dm2', `a = 9\nb = 2\nc = a / b\nd = a MOD b\nprint c * 10 + d`, ['41', '45', '14', '40'], 0,
      [
        '$c = 9 / 2 = 4$, $d = 9 \\bmod 2 = 1$.',
        '$c \\times 10 + d = 40 + 1 = 41$.'
      ], { d: 'easy' }),

    P('dm3', `n = 456\na = n MOD 10\nb = n / 10\nprint a * 100 + b`, ['645', '456', '654', '465'], 0,
      [
        '$a = 6$ (last digit), $b = 45$ (rest).',
        '$6 \\times 100 + 45 = 645$ — last digit moved to the front.'
      ], { d: 'medium' }),

    P('dm4', `n = 60\nk = 8\nq = n / k\nr = n MOD k\nprint q * r`, ['28', '56', '4', '7'], 0,
      [
        '$q = 60 / 8 = 7$ — eight goes into sixty seven times.',
        '$r = 60 \\bmod 8 = 4$ — remainder after $8 \\times 7 = 56$.',
        '$q \\times r = 7 \\times 4 = 28$.'
      ], { d: 'easy' }),

    P('dm5', `x = 100\ny = 13\nq = x / y\nr = x MOD y\nprint q + r`, ['16', '9', '10', '17'], 0,
      [
        '$q = 100 / 13 = 7$, $r = 100 \\bmod 13 = 9$.',
        '$7 + 9 = 16$.'
      ], { d: 'medium' }),

    P('dm6', `n = 8\nprint n / 10, n MOD 10`, ['0, 8', '8, 0', '0.8, 8', '1, 8'], 0,
      [
        '$8 / 10 = 0$ — integer division of a smaller number.',
        '$8 \\bmod 10 = 8$ — remainder is the number itself.',
        'print: $0, 8$.'
      ], { d: 'medium' }),

    P('dm7', `n = 3407\na = n / 100\nb = n MOD 100\nprint a, b`, ['34, 7', '34, 07', '3, 407', '340, 7'], 0,
      [
        '$a = 3407 / 100 = 34$ — last two digits removed.',
        '$b = 3407 \\bmod 100 = 7$ — remainder after removing 34 hundreds.',
        'print: $34, 7$.'
      ], { d: 'hard' }),

    P('dm8', `n = 25\na = n / 10\nb = n MOD 10\nprint b * 10 + a`, ['52', '25', '55', '22'], 0,
      [
        '$a = 2$, $b = 5$.',
        '$b \\times 10 + a = 50 + 2 = 52$ — digits reversed.'
      ], { d: 'easy' }),

    P('dm9', `n = 83\nk = 9\nq = n / k\nr = n MOD k\nprint q * k + r`, ['83', '81', '2', '74'], 0,
      [
        '$q = 9$, $r = 2$.',
        '$q \\times k + r = 9 \\times 9 + 2 = 83$ — the DIV-MOD identity always rebuilds $n$.'
      ], { d: 'medium' }),

    P('dm10', `a = 7\nb = 2\nc = a / b\nd = a - c * b\nprint c, d`, ['3, 1', '3.5, 0', '3, 0', '2, 1'], 0,
      [
        '$c = 7 / 2 = 3$.',
        '$d = 7 - 3 \\times 2 = 7 - 6 = 1$ — this is exactly $7 \\bmod 2$ computed by hand.',
        'print: $3, 1$.'
      ], { d: 'hard' }),
  ],

  /* ================================================================ */
  /* F5 digit-loop — 10 problems                                       */
  /* ================================================================ */
  'digit-loop': [
    P('dl1', `n = 231\nrev = 0\nWHILE n > 0\n  d = n MOD 10\n  rev = rev * 10 + d\n  n = n / 10\nENDWHILE\nprint rev`, ['132', '231', '123', '213'], 0,
      [
        'Pass 1: $d = 1$, $rev = 1$, $n = 23$.',
        'Pass 2: $d = 3$, $rev = 13$, $n = 2$.',
        'Pass 3: $d = 2$, $rev = 132$, $n = 0$ — loop ends.',
        'Output is 132.'
      ], { d: 'medium' }),

    P('dl2', `n = 592\ns = 0\nWHILE n > 0\n  s = s + n MOD 10\n  n = n / 10\nENDWHILE\nprint s`, ['16', '15', '17', '5'], 0,
      [
        'Pass 1: $s = 2$, $n = 59$.',
        'Pass 2: $s = 2 + 9 = 11$, $n = 5$.',
        'Pass 3: $s = 11 + 5 = 16$, $n = 0$.',
        'Digit sum is 16.'
      ], { d: 'easy' }),

    P('dl3', `n = 7\ns = 0\nWHILE n > 0\n  s = s + n MOD 10\n  n = n / 10\nENDWHILE\nprint s`, ['7', '0', '1', '14'], 0,
      [
        'Single-digit $n = 7$: one pass — $s = 7$, $n = 0$.',
        'The loop DOES run for the last digit. Output is 7.'
      ], { d: 'medium' }),

    P('dl4', `n = 444\nc = 0\nWHILE n > 0\n  c = c + 1\n  n = n / 10\nENDWHILE\nprint c`, ['3', '4', '2', '444'], 0,
      [
        'Each pass removes one digit: $444 \\to 44 \\to 4 \\to 0$.',
        'Three passes, counter ends at 3.'
      ], { d: 'easy' }),

    P('dl5', `n = 254\np = 1\nWHILE n > 0\n  p = p * (n MOD 10)\n  n = n / 10\nENDWHILE\nprint p`, ['40', '11', '0', '250'], 0,
      [
        'Pass 1: $p = 1 \\times 4 = 4$, $n = 25$.',
        'Pass 2: $p = 4 \\times 5 = 20$, $n = 2$.',
        'Pass 3: $p = 20 \\times 2 = 40$, $n = 0$.',
        'Digit product is 40.'
      ], { d: 'medium' }),

    P('dl6', `n = 100\ns = 0\nWHILE n > 0\n  d = n MOD 10\n  s = s + d\n  n = n / 10\nENDWHILE\nprint s`, ['1', '0', '100', '3'], 0,
      [
        'Pass 1: $d = 0$, $s = 0$, $n = 10$.',
        'Pass 2: $d = 0$, $s = 0$, $n = 1$.',
        'Pass 3: $d = 1$, $s = 1$, $n = 0$.',
        'Zeros add nothing: digit sum is 1.'
      ], { d: 'medium' }),

    P('dl7', `n = 1234\nrev = 0\nWHILE n > 0\n  rev = rev * 10 + n MOD 10\n  n = n / 10\nENDWHILE\nprint rev`, ['4321', '1234', '3412', '2143'], 0,
      [
        'Pass 1: $rev = 4$, $n = 123$.',
        'Pass 2: $rev = 43$, $n = 12$.',
        'Pass 3: $rev = 432$, $n = 1$.',
        'Pass 4: $rev = 4321$, $n = 0$.'
      ], { d: 'medium' }),

    P('dl8', `n = 36\nc = 0\nWHILE n > 1\n  n = n / 2\n  c = c + 1\nENDWHILE\nprint c`, ['5', '4', '6', '3'], 0,
      [
        'This loop halves, not digit-walks: $36 \\to 18 \\to 9 \\to 4 \\to 2 \\to 1$.',
        'Five passes until $n = 1$ fails $n > 1$. Counter is 5.'
      ], { d: 'medium' }),

    P('dl9', `n = 9\nWHILE n > 0\n  print n MOD 10\n  n = n / 10\nENDWHILE\nprint "done"`, ['9, done', '9', '0, done', 'done, 9'], 0,
      [
        'Pass 1: print $9$, then $n = 0$.',
        '$0 > 0$ fails — loop ends.',
        'Then prints "done". Output lines: 9, done.'
      ], { d: 'medium' }),

    P('dl10', `n = 128\ns = 0\nc = 0\nWHILE n > 0\n  s = s + n MOD 10\n  c = c + 1\n  n = n / 10\nENDWHILE\nprint s * c`, ['33', '11', '99', '24'], 0,
      [
        'Digits of 128: sum $= 1 + 2 + 8 = 11$, count $= 3$.',
        '$s \\times c = 11 \\times 3 = 33$.'
      ], { d: 'hard' }),
  ],

  /* ================================================================ */
  /* F6 string-concat — 10 problems                                    */
  /* ================================================================ */
  'string-concat': [
    P('sc1', `a = "6"\nb = "4"\nc = a + b\nprint c`, ['64', '10', '46', '24'], 0,
      [
        'Both values are TEXT (quotes).',
        '$"6" + "4"$ glues: $"64"$.',
        'Output is 64.'
      ], { d: 'easy' }),

    P('sc2', `x = 4\ny = 5\nprint "sum" , x + y`, ['sum, 9', 'sum9', 'sum, 45', '9'], 0,
      [
        'print with a comma prints two values: the text $sum$ then $4 + 5 = 9$.',
        'Output: $sum, 9$.'
      ], { d: 'easy' }),

    P('sc3', `a = "12"\nb = "3"\nc = a + b\nd = 12 + 3\nprint c, d`, ['123, 15', '15, 123', '123, 123', '15, 15'], 0,
      [
        '$c = "12" + "3" = "123"$ (glue).',
        '$d = 12 + 3 = 15$ (add).',
        'print: $123, 15$.'
      ], { d: 'medium' }),

    P('sc4', `s = "go"\nt = "ld"\nw = s + t\nprint w`, ['gold', 'ldgo', 'go ld', 'g o l d'], 0,
      [
        '$w = "go" + "ld" = "gold"$ — glue keeps order.',
        'Output is gold.'
      ], { d: 'easy' }),

    P('sc5', `a = "0"\nb = "7"\nc = a + b\nprint c`, ['07', '7', '0', '70'], 0,
      [
        '$"0" + "7" = "07"$ — glue never drops leading zeros.',
        'Output is 07.'
      ], { d: 'medium' }),

    P('sc6', `w1 = "data"\nw2 = "base"\nw = w1 + w2\nprint w`, ['database', 'basedata', 'data base', 'databse'], 0,
      [
        '$"data" + "base" = "database"$ — no space is added by glue.',
        'Output is database.'
      ], { d: 'easy' }),

    P('sc7', `a = "ab"\nb = "cd"\nprint b + a`, ['cdab', 'abcd', 'abdc', 'dcba'], 0,
      [
        'Glue order follows the expression: $b + a$ puts $cd$ first.',
        'Output is cdab.'
      ], { d: 'medium' }),

    P('sc8', `n = 2\ns = "ha"\nprint s + s + s`, ['hahaha', 'ha6', 'ha ha ha', '6'], 0,
      [
        'The number 2 is never used — no repeat operator exists here.',
        '$"ha" + "ha" + "ha" = "hahaha"$.'
      ], { d: 'medium' }),

    P('sc9', `a = "10"\nb = "5"\nc = a + b\nd = 10 + 5\nprint d, c`, ['15, 105', '105, 15', '15, 155', '155, 15'], 0,
      [
        '$d = 10 + 5 = 15$ (numbers).',
        '$c = "10" + "5" = "105"$ (glue).',
        'print order is $d$ then $c$: $15, 105$.'
      ], { d: 'medium' }),

    P('sc10', `x = "1"\ny = "2"\nz = x + y\nw = z + z\nprint w`, ['1212', '24', '121', '1122'], 0,
      [
        '$z = "1" + "2" = "12"$.',
        '$w = "12" + "12" = "1212"$ — glue twice.',
        'Output is 1212.'
      ], { d: 'hard' }),
  ],
};

/* ================================================================== */
/* MCQs — 60, cleaned & re-verified                                    */
/* ================================================================== */
export const mcqs = [
  M(`a = 6\nb = 4\nc = a * b\nprint c`, ['24', '10', '64', '12'], 0, 'easy', 'basic-assignment',
    ['$a = 6$, $b = 4$.', '$c = 6 \\times 4 = 24$.', 'print shows 24.']),
  M(`a = 5\na = a + 3\nprint a`, ['8', '5', '15', '3'], 0, 'easy', 'overwrite',
    ['$a = 5$.', '$a = 5 + 3 = 8$.', 'Output is 8.']),
  M(`a = 2 + 3 * 4\nprint a`, ['14', '20', '24', '11'], 0, 'easy', 'precedence',
    ['Multiplication first: $3 \\times 4 = 12$.', 'Then $2 + 12 = 14$.']),
  M(`a = 7 / 2\nprint a`, ['3', '3.5', '4', '2'], 0, 'easy', 'integer-division',
    ['Integer division drops the fraction.', '$7 / 2 = 3$ (not 3.5, no rounding).']),
  M(`a = 15 MOD 4\nprint a`, ['3', '4', '11', '1'], 0, 'easy', 'mod',
    ['$4 \\times 3 = 12$ fits into 15.', 'Remainder $= 15 - 12 = 3$.']),
  M(`a = 10\nb = 20\ntemp = a\na = b\nb = temp\nprint a, b`, ['20, 10', '10, 20', '20, 20', '10, 10'], 0, 'easy', 'swap',
    ['$temp = 10$ saves old $a$.', '$a = 20$, then $b = temp = 10$.', 'Swapped: $20, 10$.']),
  M(`sum = 0\nsum = sum + 1\nsum = sum + 2\nsum = sum + 3\nsum = sum + 4\nprint sum`, ['10', '24', '4', '25'], 0, 'easy', 'accumulation',
    ['Running total: $0+1=1$, $1+2=3$, $3+3=6$, $6+4=10$.', 'Output is 10.']),
  M(`product = 1\nproduct = product * 2\nproduct = product * 3\nproduct = product * 4\nprint product`, ['24', '10', '8', '12'], 0, 'easy', 'accumulation',
    ['$1 \\times 2 = 2$, $2 \\times 3 = 6$, $6 \\times 4 = 24$.', 'Output is 24.']),
  M(`x = 10\ny = x + 5\nx = x + 20\nz = x + y\nprint z`, ['45', '25', '35', '50'], 0, 'easy', 'chain',
    ['$y = 15$ (old $x$ frozen).', '$x = 30$.', '$z = 30 + 15 = 45$.']),
  M(`x = 2\nprint x\nx = x * 3\nprint x\nx = x + 4\nprint x\nx = x * 2\nprint x`, ['2, 6, 10, 20', '2, 6, 16, 32', '2, 5, 9, 18', '2, 6, 10, 12'], 0, 'easy', 'multi-print',
    ['$x = 2$, print 2.', '$x = 6$, print 6.', '$x = 10$, print 10.', '$x = 20$, print 20.']),
  M(`a = 10\na = a + 5\na = a * 2\nprint a`, ['30', '15', '20', '25'], 0, 'easy', 'overwrite',
    ['$a = 10 + 5 = 15$.', '$a = 15 \\times 2 = 30$.']),
  M(`a = 4\nb = a * a + a\nprint b`, ['20', '16', '24', '32'], 0, 'easy', 'chain',
    ['$a \\times a = 16$.', '$16 + 4 = 20$.']),
  M(`m = 5\nn = 9\nm = n\nn = m\nprint m + n`, ['18', '14', '45', '10'], 0, 'easy', 'swap',
    ['$m = 9$ (old $m$ destroyed).', '$n = m = 9$.', '$9 + 9 = 18$ — fake swap.']),
  M(`a = 20\nb = a - 5\na = a + b\nb = a - b\nprint a - b`, ['15', '20', '5', '10'], 0, 'easy', 'overwrite',
    ['$b = 15$.', '$a = 20 + 15 = 35$.', '$b = 35 - 15 = 20$.', '$a - b = 35 - 20 = 15$.']),
  M(`n = 13\na = n MOD 2\nprint a`, ['1', '0', '6', '2'], 0, 'easy', 'mod',
    ['13 is odd.', '$13 \\bmod 2 = 1$.']),
  M(`a = 5\nb = 3\nc = a + b * 2\nd = (a + b) * 2\nprint c + d`, ['27', '32', '50', '21'], 0, 'easy', 'precedence',
    ['$c = 5 + 6 = 11$.', '$d = 8 \\times 2 = 16$.', '$11 + 16 = 27$.']),
  M(`a = 10\nb = a / 3\nc = a MOD 3\nd = b * 3 + c\nprint d`, ['10', '4', '9', '1'], 0, 'easy', 'identity-reconstruction',
    ['$b = 3$, $c = 1$.', '$3 \\times 3 + 1 = 10$ — DIV/MOD identity.']),
  M(`n = 1234\nlast_digit = n MOD 10\nn = n / 10\nsecond_last = n MOD 10\nprint last_digit + second_last`, ['7', '34', '4', '10'], 0, 'easy', 'digit-extraction',
    ['Last digit $= 4$.', '$n = 123$; second-last $= 3$.', '$4 + 3 = 7$.']),
  M(`a = 12\nb = 24\na = a + b\nb = a - b\na = a - b\nprint a + b`, ['36', '24', '48', '12'], 0, 'easy', 'swap',
    ['The routine swaps: $a = 24$, $b = 12$.', 'Sum unchanged: $36$.']),
  M(`p = 3\nq = 7\nr = p * q\np = r - p\nq = r - q\ns = p + q\nprint s`, ['32', '10', '28', '21'], 0, 'medium', 'overwrite',
    ['$r = 21$.', '$p = 21 - 3 = 18$, $q = 21 - 7 = 14$.', '$s = 32$.']),
  M(`a = 10\nb = 3\nc = 2\nd = 20\ne = 4\nx = a + b * c - d / e\nprint x`, ['11', '9', '6', '5'], 0, 'medium', 'precedence',
    ['$b \\times c = 6$, $d / e = 5$.', '$10 + 6 - 5 = 11$.']),
  M(`n = 4728\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n MOD 10\nprint a + b + c`, ['17', '21', '10', '15'], 0, 'medium', 'digit-extraction',
    ['Digits peeled: 8, 2, 7.', '$8 + 2 + 7 = 17$.']),
  M(`n = 5678\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n MOD 10\nn = n / 10\nd = n MOD 10\nprint a + b + c + d`, ['26', '20', '24', '30'], 0, 'medium', 'digit-extraction',
    ['Digits peeled: 8, 7, 6, 5.', '$8 + 7 + 6 + 5 = 26$.']),
  M(`x = 3\ny = x * x\nz = y + x\nx = z\ny = x + z\nprint y`, ['24', '15', '21', '36'], 0, 'medium', 'overwrite',
    ['$y = 9$, $z = 12$.', '$x = 12$.', '$y = 12 + 12 = 24$.']),
  M(`p = 2\nq = 3\nr = p\np = q\nq = r\nr = p + q\nprint r`, ['5', '6', '3', '2'], 0, 'easy', 'swap',
    ['$r = 2$; swap makes $p = 3$, $q = 2$.', '$r = 3 + 2 = 5$.']),
  M(`n = 123\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n\nprint a * 100 + b * 10 + c`, ['321', '123', '312', '231'], 0, 'medium', 'digit-extraction',
    ['$a = 3$, $b = 2$, $c = 1$.', '$300 + 20 + 1 = 321$ — reversed.']),
  M(`n = 17\nq = n / 4\nr = n MOD 4\nprint q * 4 + r`, ['17', '4', '1', '5'], 0, 'easy', 'identity-reconstruction',
    ['$q = 4$, $r = 1$.', '$16 + 1 = 17$ — identity rebuilds $n$.']),
  M(`a = 5\nb = a * a + 2 * a + 1\nprint b`, ['36', '31', '30', '35'], 0, 'medium', 'chain',
    ['$25 + 10 + 1 = 36$ — this is $(a+1)^2$.']),
  M(`x = 5\ny = 2 * x\nx = y + x\nprint x`, ['15', '10', '20', '25'], 0, 'easy', 'overwrite',
    ['$y = 10$.', '$x = 10 + 5 = 15$.']),
  M(`a = "5"\nb = "3"\nc = a + b\nprint c`, ['53', '8', '35', '15'], 0, 'easy', 'string-concatenation',
    ['Quoted values are text.', '$"5" + "3" = "53"$ — glue, not add.']),
  M(`n = 649\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n\nprint a - b + c`, ['11', '9', '5', '7'], 0, 'medium', 'digit-extraction',
    ['$a = 9$, $b = 4$, $c = 6$.', '$9 - 4 + 6 = 11$.']),
  M(`balance = 100\nbalance = balance + 50\nbalance = balance - 30\nbalance = balance * 2\nbalance = balance + 15\nprint balance`, ['255', '145', '210', '160'], 0, 'easy', 'accumulation',
    ['$150 \\to 120 \\to 240 \\to 255$.', 'Output is 255.']),
  M(`x = 3\ny = x * 2\nz = x + y\nx = z\ny = x - 3\nprint y`, ['6', '9', '3', '12'], 0, 'easy', 'overwrite',
    ['$y = 6$, $z = 9$, $x = 9$.', '$y = 9 - 3 = 6$.']),
  M(`a = 25\nb = 7\nc = a MOD b\nd = a / b\ne = d * b\nf = a - e\nprint c + f`, ['8', '2', '0', '1'], 0, 'medium', 'precedence',
    ['$c = 25 \\bmod 7 = 4$, $d = 25 / 7 = 3$.', '$e = 3 \\times 7 = 21$, $f = 25 - 21 = 4$.', '$c + f = 4 + 4 = 8$ — remainder + rebuilt remainder.']),
  M(`n = 537\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n\nprint a * 100 + b * 10 + c`, ['735', '537', '357', '753'], 0, 'medium', 'digit-extraction',
    ['$a = 7$, $b = 3$, $c = 5$.', '$700 + 30 + 5 = 735$.']),
  M(`a = 2\nb = a * 3\na = b + 1\nc = a - b\nb = c * a\na = b + c\nprint a`, ['8', '7', '6', '1'], 0, 'hard', 'overwrite',
    ['$b = 6$, $a = 7$, $c = 1$.', '$b = 1 \\times 7 = 7$.', '$a = 7 + 1 = 8$.']),
  M(`x = 100\ny = 30\nz = 7\nr = x MOD y\nq = x / y\ns = q * z + r\nprint s`, ['31', '21', '10', '34'], 0, 'medium', 'precedence',
    ['$r = 10$, $q = 3$.', '$3 \\times 7 + 10 = 31$.']),
  M(`a = "12"\nb = "3"\nc = a + b\nd = 12 + 3\nprint c`, ['123', '15', '12315', '33'], 0, 'easy', 'string-concatenation',
    ['$c$ glues text: $"123"$.', '$d$ is never printed.']),
  M(`a = 45\nb = 20\na = a - b\nb = b + a\na = b - a\nprint a, b`, ['20, 45', '45, 20', '25, 45', '20, 25'], 0, 'medium', 'swap',
    ['$a = 25$ (difference).', '$b = 20 + 25 = 45$ (old $a$).', '$a = 45 - 25 = 20$ (old $b$).']),
  M(`n = 9876\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n MOD 10\nn = n / 10\nd = n MOD 10\nprint a + b + c + d`, ['30', '27', '33', '24'], 0, 'easy', 'digit-extraction',
    ['Digits: 6, 7, 8, 9.', '$6 + 7 + 8 + 9 = 30$.']),
  M(`n = 1234\nsum = 0\nsum = sum + n MOD 10\nn = n / 10\nsum = sum + n MOD 10\nn = n / 10\nsum = sum + n MOD 10\nn = n / 10\nsum = sum + n\nprint sum`, ['10', '9', '14', '12'], 0, 'medium', 'accumulation',
    ['$1 + 2 + 3 = 6$, final $n = 1$.', '$6 + 1 = 10$.']),
  M(`n = 83\nk = 9\nq = n / k\nr = n MOD k\nprint q, r`, ['9, 2', '2, 9', '8, 3', '9, 1'], 0, 'easy', 'identity-reconstruction',
    ['$9 \\times 9 = 81$, remainder 2.', 'print: $9, 2$.']),
  M(`x = 4\ny = x + 2\nz = y * 2\nw = z - x\nprint w`, ['8', '16', '12', '6'], 0, 'medium', 'chain',
    ['$y = 6$, $z = 12$, $w = 12 - 4 = 8$.']),
  M(`a = 5\nb = 10\nc = a + b\na = c - b\nb = c - a\nc = a * b\na = c / 5\nprint a, b, c`, ['10, 10, 50', '5, 10, 15', '10, 10, 15', '5, 10, 50'], 0, 'hard', 'overwrite',
    ['$c = 15$.', '$a = 5$, $b = 15 - 5 = 10$.', '$c = 50$; $a = 50 / 5 = 10$.', 'print: $10, 10, 50$.']),
  M(`x = 7\ny = 2\nz = x / y\nw = x MOD y\np = z * w\nq = z + w\nprint p + q`, ['7', '4', '3', '10'], 0, 'hard', 'precedence',
    ['$z = 3$, $w = 1$.', '$p = 3$, $q = 4$.', '$3 + 4 = 7$.']),
  M(`a = "7"\nb = "77"\nc = a + b\nprint c`, ['777', '84', '77', '7'], 0, 'easy', 'string-concatenation',
    ['Glue: $"7" + "77" = "777"$.']),
  M(`n = 2468\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n MOD 10\nn = n / 10\nd = n MOD 10\nprint a + b + c + d`, ['20', '18', '22', '16'], 0, 'medium', 'digit-extraction',
    ['Digits: 8, 6, 4, 2.', '$8 + 6 + 4 + 2 = 20$.']),
  M(`n = 100\nk = 13\nq = n / k\nr = n MOD k\nprint q, r`, ['7, 9', '9, 7', '7, 10', '8, 9'], 0, 'medium', 'identity-reconstruction',
    ['$13 \\times 7 = 91$, remainder 9.', 'print: $7, 9$.']),
  M(`a = 1\nb = 2\na = b\nb = 3\nprint a\nprint b`, ['2, 3', '3, 2', '1, 2', '2, 2'], 0, 'hard', 'multi-print',
    ['$a = 2$ (copy of $b$).', '$b = 3$.', 'Two prints: $2$ then $3$.']),
  M(`p = 1\np = p * 3\np = p * 4\np = p * 5\nprint p`, ['60', '12', '120', '15'], 0, 'easy', 'accumulation',
    ['$3 \\times 4 = 12$, $12 \\times 5 = 60$.']),
  M(`x = 10\ny = 5\nx = x - y\ny = x + y\nprint y`, ['10', '5', '15', '20'], 0, 'medium', 'swap',
    ['$x = 5$.', '$y = 5 + 5 = 10$.']),
  M(`a = 4\nb = 6\nr = a * b / a + b\nprint r`, ['12', '6', '10', '30'], 0, 'medium', 'precedence',
    ['Equal ranks go LEFT TO RIGHT: $4 \\times 6 = 24$, then $24 / 4 = 6$.', 'Only then $+: 6 + 6 = 12$.']),
  M(`a = 10\nb = 20\nc = 30\na = b\nb = c\nc = a\nprint a, b, c`, ['20, 30, 20', '30, 20, 20', '20, 20, 30', '30, 30, 20'], 0, 'hard', 'overwrite',
    ['$a = 20$.', '$b = 30$.', '$c = a = 20$ — $a$ was ALREADY overwritten.']),
  M(`n = 5555\na = n MOD 10\nn = n / 10\nb = n MOD 10\nn = n / 10\nc = n MOD 10\nn = n / 10\nd = n MOD 10\nprint a + b + c + d`, ['20', '4', '25', '5'], 0, 'easy', 'digit-extraction',
    ['Four 5s: $5 \\times 4 = 20$.']),
  M(`n = 50\nk = 7\nq = n / k\nr = n MOD k\nprint q * r`, ['7', '8', '1', '14'], 0, 'medium', 'identity-reconstruction',
    ['$q = 7$, $r = 1$.', '$7 \\times 1 = 7$.']),
  M(`m = 2\nn = 5\nm = m * n\nn = m - n\nm = m - n\nn = m + n\nprint m, n`, ['5, 10', '10, 5', '10, 10', '5, 5'], 0, 'hard', 'swap',
    ['$m = 10$.', '$n = 10 - 5 = 5$ (old $m$).', '$m = 10 - 5 = 5$ (old $n$).', '$n = 5 + 5 = 10$ — extra line re-doubles.']),
  M(`a = "1"\nb = "2"\nc = "3"\nd = a + b + c\nprint d`, ['123', '6', '321', '12'], 0, 'easy', 'string-concatenation',
    ['Glue in order: $"123"$.']),
  M(`score = 75\nif score >= 90 then\n  print "A"\nelse if score >= 75 then\n  print "B"\nelse\n  print "C"\nend if`, ['B', 'A', 'C', '75'], 0, 'hard', 'condition',
    ['First test: $75 \\geq 90$? No.', 'Second test: $75 \\geq 75$? Yes — boundary values satisfy $\\geq$.', 'Prints B.']),
  M(`a = 8\nb = 3\nq = a / b\nr = a MOD b\ns = q * 10 + r\nprint s`, ['22', '8', '23', '12'], 0, 'medium', 'precedence',
    ['$q = 2$, $r = 2$.', '$20 + 2 = 22$.']),
  M(`x = 6\ny = 4\nz = (x + y) / 2\nw = x * y / 2\nprint z + w`, ['17', '15', '18', '16'], 0, 'medium', 'precedence',
    ['$z = 10 / 2 = 5$.', '$w = 24 / 2 = 12$.', '$5 + 12 = 17$.']),
];
