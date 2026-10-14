from flask import Flask, json, jsonify, request
import pandas as pd
from binomial import bernoulli_bayes_curves, discrete_distribution
from guassian import (
    categorical_marginal_distribution,
    conditional_feature_distribution,
    marginal_density,
    is_discrete_feature,
    discrete_marginal_distribution,
    conditional_density,
)
from multinomial import multinomial_distribution
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


@app.route("/api/multinomial")
def multinomial_api():
    feature = request.args.get("feature", "Type")
    try:
        result = multinomial_distribution(data, feature)
        return jsonify(result)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    

@app.get("/api/distribution/features")
def distribution_features_api():
    features = []

    for feature in data.columns:
        series = data[feature].dropna()
        numeric = pd.api.types.is_numeric_dtype(data[feature])
        discrete = is_discrete_feature(data, feature)

        if discrete:
            if numeric:
                values = sorted(
                    pd.to_numeric(series, errors="coerce")
                    .dropna().unique().tolist()
                )
            else:
                values = (
                    series.astype(str)
                    .value_counts()
                    .index.tolist()
                )

            # Avoid sending an excessively large list to React.
            values = values[:100]
        else:
            values = []

        features.append({
            "name": feature,
            "numeric": bool(numeric),
            "kind": "discrete" if discrete else "continuous",
            "values": values,
        })

    return jsonify({"features": features})


@app.get("/api/distribution/marginal")
def marginal_api():
    try:
        feature = request.args.get("feature", "").strip()
        if not feature:
            raise ValueError("Select a feature.")

        if feature not in data.columns:
            raise ValueError(f"Feature '{feature}' does not exist.")

        bandwidth = float(request.args.get("bandwidth", 0.3))
        points = int(request.args.get("points", 100))

        if not 0 < bandwidth <= 10:
            raise ValueError("Bandwidth must be between 0 and 10.")

        if not 20 <= points <= 500:
            raise ValueError("Points must be between 20 and 500.")

        if is_discrete_feature(data, feature):
            result = discrete_marginal_distribution(data, feature)
            kind = "discrete"
        else:
            result = marginal_density(
                data, feature, bandwidth, points
            )
            kind = "continuous"

        return jsonify({
            "feature": feature,
            "kind": kind,
            "data": result,
            "observations_used": int(data[feature].notna().sum()),
        })

    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400


@app.get("/api/distribution/conditional")
def conditional_api():
    try:
        target = request.args.get("target", "").strip()
        raw_given = request.args.get("given", "{}")

        if not target:
            raise ValueError("Select a target feature.")

        try:
            given = json.loads(raw_given)
        except json.JSONDecodeError:
            raise ValueError("'given' must contain valid JSON.")

        if not isinstance(given, dict) or not given:
            raise ValueError(
                "Provide at least one conditioning feature and value."
            )

        if not all(isinstance(k, str) for k in given):
            raise ValueError("Condition feature names must be strings.")

        bandwidth = float(request.args.get("bandwidth", 0.3))
        points = int(request.args.get("points", 100))

        if not 0 < bandwidth <= 10:
            raise ValueError("Bandwidth must be between 0 and 10.")

        if not 20 <= points <= 500:
            raise ValueError("Points must be between 20 and 500.")

        result = conditional_feature_distribution(
            data=data,
            target=target,
            given=given,
            bandwidth=bandwidth,
            points=points,
        )

        return jsonify(result)

    except (ValueError, TypeError) as error:
        app.logger.warning("Conditional distribution error: %s", error)
        return jsonify({"error": str(error)}), 400

    except Exception:
        app.logger.exception("Unexpected conditional distribution error")
        return jsonify({
            "error": "Unexpected server error. Check the Flask terminal."
        }), 500


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

