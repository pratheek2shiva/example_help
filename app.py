from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def generate_adaptive_card():
    return {
    "type": "AdaptiveCard",
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "version": "1.3",
    "body": [
        {
            "type": "TextBlock",
            "text": "Hi, please this is sample test!\nplease click these options to load the button test",
            "wrap": True
        },
        {
            "type": "TextBlock",
            "text": "Enter your name",
            "wrap": True
        },
        {
            "type": "Input.Text",
            "placeholder": "Placeholder text",
            "id": "user_name"
        },
        {
            "type": "TextBlock",
            "text": "when were you born?",
            "wrap": True
        },
        {
            "type": "Input.Date",
            "id": "user_birth"
        },
        {
            "type": "ActionSet",
            "actions": [
                {
                    "type": "Action.Submit",
                    "title": "Submit"
                }
            ],
            "id": "user_submit"
        }
    ]
}

@app.route('/', methods=['GET'])
def home():
    return "Chatbot backend is running!"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    user_message = data['message'].lower()
    
    if user_message in ["hi", "hello"]:
        adaptive_card = generate_adaptive_card()
        return jsonify({
            "answer": "Hello! Please fill out this card:",
            "card": adaptive_card
        })
    else:
        # Handle all other messages
        response = f"You said: {user_message}. How can I help you further?"
        return jsonify({"answer": response})
    

@app.route('/process_card', methods=['POST'])
def process_card():
    data = request.get_json()
    user_name = data.get('user_name', '')
    user_birth = data.get('user_birth', '')
    
    response = f"Thank you, {user_name}! Your birthdate is {user_birth}. How else can I assist you?"
    
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)