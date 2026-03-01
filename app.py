from flask import Flask, request, jsonify
from flask_cors import CORS

# import your transpiler function
from transpiler import transpile_code  # <-- adjust to your function name

app = Flask(__name__)
CORS(app)  # allow frontend (port 5173) to access backend (port 5000)

@app.route("/transpile", methods=["POST"])
def transpile():
    data = request.json
    cpp_code = data.get("code", "")

    if not cpp_code:
        return jsonify({"error": "Empty input"}), 400

    try:
        python_code = transpile_code(cpp_code)  # your logic here
        return jsonify({"output": python_code})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)