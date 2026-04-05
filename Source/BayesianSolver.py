import math
from collections import defaultdict

def solve(words, candidateArray):
    pos_freq = [defaultdict(int) for _ in range(5)]

    for word in candidateArray:
        for i, ch in enumerate(word):
            pos_freq[i][ch] += 1

    total = len(candidateArray)

    best_word = ""
    best_score = float("-inf")

    for word in words:
        score = 0

        for i, ch in enumerate(word):
            freq = pos_freq[i].get(ch, 0) + 1
            prob = freq / (total + 26)
            score += math.log(prob)

        if score > best_score:
            best_score = score
            best_word = word

    return best_word