import flask
from flask import render_template, jsonify
from Astar import astar_solver
import os
app = flask.Flask(__name__, template_folder='templates')

words = []
words_path = os.path.join(os.path.dirname(__file__), 'static', 'words.txt')
with open(words_path, 'r') as file:
    words = file.read().splitlines()

@app.route('/words')
def load_words():
    return jsonify(words) 


@app.route('/')
def home(): 
    return render_template('index.html')

@app.route('/api/AIsendGuess', methods=['POST'])
def ai_send_guess():
    data = flask.request.get_json()
    previous_guesses = data.get('previousGuesses', [])
    status_of_guesses = data.get('statusofGuesses', [])
    algorithm = data.get('algorithm', 'dfs')


    candidates = words.copy()
    for guess, feedback in zip(previous_guesses, status_of_guesses):
        from Filter import filter_words
        candidates = filter_words(candidates, guess, feedback)
    
    depth = len(previous_guesses)
    
    # Placeholder for AI logic based on the selected algorithm
    if algorithm == 'dfs':
        next_guess = "crane"  # Example guess for DFS
    elif algorithm == 'bfs':
        next_guess = "slate"  # Example guess for BFS
    elif algorithm == 'ucs':
        next_guess = "flame"  # Example guess for UCS
    elif algorithm == 'astar':
        candidates_k = candidates[:5]
        next_guess = astar_solver(candidates_k, depth)  # Example guess for A*
    else:
        next_guess = "apple"  # Default guess
    

    print(f"AI selected guess: {next_guess} using {algorithm} algorithm")
    return jsonify({'nextGuess': next_guess})

if __name__ == '__main__':
    app.run(debug=True)