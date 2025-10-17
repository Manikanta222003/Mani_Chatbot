from flask import Flask, request, jsonify
import joblib
from sklearn.metrics.pairwise import cosine_similarity
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ---- Load model and dataset ----
vectorizer = joblib.load("Mani_vectorizer_up.pkl")   # Vectorizer
qa_data = joblib.load("Mani_qa_dataset_up.pkl")     # DataFrame with 'Question' and 'Answer' columns

# ---- Demo Test ----
demo_question = "What is your company name?"
demo_vec = vectorizer.transform([demo_question])
data_vecs = vectorizer.transform(qa_data["Question"])
similarity = cosine_similarity(demo_vec, data_vecs)
best_idx = similarity.argmax()

print("✅ Demo test successful!")
print("Question:", qa_data.iloc[best_idx]["Question"])
print("Answer:", qa_data.iloc[best_idx]["Answer"])
print("--------------------------------------")

# ---- Helper: Convert URLs to clickable links ----
def convert_links(text):
    url_pattern = r"(https?://[^\s]+)"
    return re.sub(url_pattern, r'<a href="\1" target="_blank">\1</a>', text)

# ---- Routes ----
@app.route("/")
def home():
    return "Q&A Chatbot Backend is Running ✅"

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("question")

    # Vectorize user input
    user_vec = vectorizer.transform([user_input])
    question_vecs = vectorizer.transform(qa_data["Question"])

    # Calculate similarity
    similarity = cosine_similarity(user_vec, question_vecs)
    best_idx = similarity.argmax()

    # Get matched question and answer
    best_question = qa_data.iloc[best_idx]["Question"]
    best_answer = qa_data.iloc[best_idx]["Answer"]

    # Convert URLs in the answer to clickable hyperlinks
    best_answer_with_links = convert_links(best_answer)

    return jsonify({
        "matched_question": best_question,
        "answer": best_answer_with_links
    })

if __name__ == "__main__":
    app.run(debug=True)
