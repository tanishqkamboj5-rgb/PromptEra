from flask import Flask, render_template, request, jsonify
from brain import generate_reply
app = Flask(
    __name__,
    template_folder="../frontend",
    static_folder="../frontend"
)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():

    try:

        data = request.json

        message = data["message"]

        reply = generate_reply(message)

        return jsonify({
            "reply": reply
        })

    except Exception as e:

        print(e)

        return jsonify({
            "reply": "⚠️ Sorry! Something went wrong. Please try again."
        })


if __name__ == "__main__":
    app.run(debug=True)