from flask import Flask, jsonify, request
import pandas as pd
from binomial import bernoulli_bayes_curves, discrete_distribution
from coefficients import polynomial_fit

app = Flask(__name__)

data = pd.read_csv("melb_data.csv")
info = data[0:200]

@app.route("/api/distribution")
def distribution_api():

    feature = request.args.get(
        "feature",
        "Rooms"
    )

    try:

        result = discrete_distribution(
            data=data,
            feature=feature
        )

        return jsonify(result)

    except ValueError as error:

        return jsonify({
            "error": str(error)
        }), 400

@app.route("/api/bernoulli-bayes")
def bernoulli_bayes_api():

    # Pull every parameter from the query string — nothing is defaulted.
    raw_alpha = request.args.get("prior_alpha")
    raw_beta = request.args.get("prior_beta")

    if raw_alpha is None or raw_beta is None:
        return jsonify({
            "error": "prior_alpha and prior_beta are required "
                     "(e.g. /api/bernoulli-bayes?prior_alpha=2&prior_beta=5)"
        }), 400

    try:
        prior_alpha = float(raw_alpha)
        prior_beta = float(raw_beta)
    except ValueError:
        return jsonify({
            "error": "prior_alpha and prior_beta must be numbers"
        }), 400

    price_feature = request.args.get("price_feature", "Price")
    points = int(request.args.get("points", 100))

    try:
        result = bernoulli_bayes_curves(
            data=data,
            prior_alpha=prior_alpha,
            prior_beta=prior_beta,
            price_feature=price_feature,
            points=points
        )
        return jsonify(result)

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

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

