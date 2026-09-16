
import numpy as np
import pandas as pd


def polynomial_fit(
    data: pd.DataFrame,
    feature: str,
    degree: int
):
    if feature not in data.columns:
        raise ValueError(f"Unknown feature: {feature}")

    if degree < 0 or degree > 10:
        raise ValueError("Degree must be between 0 and 10")


    subset = data[[feature, "Price"]].dropna()

    x = subset[feature].to_numpy(dtype=float)
    y = subset["Price"].to_numpy(dtype=float)

    if len(x) <= degree:
        raise ValueError(
            "Not enough data points for this polynomial degree"
        )


    coefficients = np.polyfit(x, y, degree)

    polynomial = np.poly1d(coefficients)

    # Generate points for smooth polynomial curve
    x_curve = np.linspace(x.min(), x.max(), 200)
    y_curve = polynomial(x_curve)


    observations = [
        {
            "x": float(x_value),
            "price": float(y_value)
        }
        for x_value, y_value in zip(x, y)
    ]


    averages = (
        subset
        .groupby(feature, as_index=False)["Price"]
        .mean()
        .sort_values(feature)
    )

    average_points = [
        {
            "x": float(row[feature]),
            "price": float(row["Price"])
        }
        for _, row in averages.iterrows()
    ]


    curve = [
        {
            "x": float(x_value),
            "price": float(y_value)
        }
        for x_value, y_value in zip(x_curve, y_curve)
    ]


    return {
        "feature": feature,
        "degree": degree,
        "coefficients": coefficients.tolist(),

        "points": observations,

        "averagePoints": average_points,

        "curvePoints": curve,
    }
