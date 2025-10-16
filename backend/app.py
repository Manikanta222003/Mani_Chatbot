from flask import Flask, request, jsonify
import joblib
from sklearn.metrics.pairwise import cosine_similarity

from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
# ---- Load files ----
vectorizer = joblib.load("Mani_vectorizer1.pkl")
qa_data = joblib.load("Mani_qa_dataset1.pkl")  # DataFrame with 'Question' and 'Answer' columns

# ---- Demo Test (optional) ----
demo_question = "What is your company name?"
demo_vec = vectorizer.transform([demo_question])
data_vecs = vectorizer.transform(qa_data["Question"])
similarity = cosine_similarity(demo_vec, data_vecs)
best_idx = similarity.argmax()
print("✅ Demo test")
print("Question:", qa_data.iloc[best_idx]["Question"])
print("Answer:", qa_data.iloc[best_idx]["Answer"])
print("--------------------------------------")

# ---- Routes ----
@app.route("/")
def home():
    return "Q&A Chatbot Backend is Running ✅"

@app.route("/chat", methods=["POST"])
def chat():
    # Receive user question from frontend
    user_input = request.json.get("question")

    # Vectorize user question
    user_vec = vectorizer.transform([user_input])
    question_vecs = vectorizer.transform(qa_data["Question"])

    # Find most similar question
    similarity = cosine_similarity(user_vec, question_vecs)
    best_idx = similarity.argmax()

    # Get corresponding answer
    best_question = qa_data.iloc[best_idx]["Question"]
    best_answer = qa_data.iloc[best_idx]["Answer"]

    return jsonify({
        "matched_question": best_question,
        "answer": best_answer
    })

if __name__ == "__main__":
    app.run(debug=True)
