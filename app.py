from flask import Flask, jsonify, request
import pandas as pd
from coefficients import polynomial_fit

app = Flask(__name__)

data = pd.read_csv("melb_data.csv")
info = data[0:200]

@app.route("/api/polynomial-fit")
def polynomial_fit_api():

    feature = request.args.get("feature", "Rooms")
    degree = int(request.args.get("degree", 1))

    try:
        result = polynomial_fit(
            data=data,
            feature=feature,
            degree=degree
        )

        return jsonify(result)

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400


@app.route("/api/houses")
def home():
    # Convert NaN values to None before converting to JSON
    houses = info.astype(object).where(pd.notna(info), None)

    return jsonify(houses.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )

