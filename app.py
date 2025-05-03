import os.path
import json
import random

from flask import Flask, render_template, jsonify, request
from models import db, HighScore
app = Flask(__name__, static_url_path='/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///highscores.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/leaderboard')
def leaderboard():
    top_scores = HighScore.query.order_by(HighScore.score.desc()).limit(10).all()
    return render_template('leaderboard.html', top_scores=top_scores)

@app.route('/api/questions')
def get_questions():
    json_path = os.path.join(app.root_path, 'data', 'questions.json')
    with open(json_path, 'r') as f:
        quiz_data = json.load(f)
    random_questions = random.sample(quiz_data, 10)
    return jsonify(random_questions)

@app.route('/api/highscore', methods=['POST'])
def save_highscore():
    data = request.get_json()
    name = data.get('name')
    score = data.get('score')

    if not name or score is None:
        return jsonify({'error': 'Missing name or score'}), 400

    new_score = HighScore(name=name, score=score)
    db.session.add(new_score)
    db.session.commit()

    return jsonify({'message': 'Score saved successfully'}), 200

if __name__ == '__main__':
    app.run()
