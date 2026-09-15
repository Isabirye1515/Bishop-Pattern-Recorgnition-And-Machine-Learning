from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

data = pd.read_csv("melb_data.csv")
info = data[0:13580]


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

