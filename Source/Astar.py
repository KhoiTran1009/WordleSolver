import math
from collections import defaultdict

def expected_remaining(candidates, guess):
    buckets = defaultdict(list)
    for w in candidates:
        fb = feedback_pattern(guess, w)
        buckets[fb].append(w)

    total = len(candidates)
    exp = 0
    for b in buckets.values():
        p = len(b)/total
        exp += p * len(b)
    return exp

def feedback_pattern(guess, target):
    res = [0]*5
    used = [False]*5

    for i in range(5):
        if guess[i] == target[i]:
            res[i] = 2  # G
            used[i] = True

    for i in range(5):
        if res[i] == 0:
            for j in range(5):
                if not used[j] and guess[i] == target[j]:
                    res[i] = 1  # Y
                    used[j] = True
                    break

    return "".join(map(str, res))

def astar_solver(candidates, depth):
    best_word = None
    best_f = float("inf")

    for guess in candidates:
        exp_remain = expected_remaining(candidates, guess)
        g = depth + 1
        h = math.log2(exp_remain + 1)
        f = g + h

        if f < best_f:
            best_f = f
            best_word = guess

    return best_word
