import os.path
import json
import random

from flask import Flask, render_template, jsonify

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/api/questions')
def get_questions():
    json_path = os.path.join(app.root_path, 'data', 'questions.json')
    with open(json_path, 'r') as f:
        quiz_data = json.load(f)
    random_questions = random.sample(quiz_data, 10)
    return jsonify(random_questions)


if __name__ == '__main__':
    app.run()
