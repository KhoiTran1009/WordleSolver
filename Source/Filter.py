def filter_words(words, guess, feedback):
    res = []
    for w in words:
        ok = True
        for i, f in enumerate(feedback):
            if f == 2 and w[i] != guess[i]:
                ok = False
            elif f == 1 and (guess[i] not in w or w[i] == guess[i]):
                ok = False
            elif f == 0 and guess[i] in w:
                ok = False
        if ok:
            res.append(w)
    return res




