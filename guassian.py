import numpy as np
import pandas as pd
from sklearn.neighbors import KernelDensity


def validate_features(data, features):
    """Check that every requested feature exists in the dataset."""
    for feature in features:
        if feature not in data.columns:
            raise ValueError(
                f"Feature '{feature}' does not exist in the dataset."
            )


def create_covariance_matrix(data, features):
    """Calculate the sample covariance matrix for numeric features."""
    validate_features(data, features)

    selected = data[features].apply(
        pd.to_numeric, errors="coerce"
    ).dropna()

    if len(selected) < 2:
        raise ValueError("At least two complete rows are required.")

    return selected.cov()


def marginal_distribution(data, features):
    """
    Return the mean vector and sample covariance matrix
    for a multivariate Gaussian summary.
    """
    validate_features(data, features)

    selected = data[features].apply(
        pd.to_numeric, errors="coerce"
    ).dropna()

    if len(selected) < 2:
        raise ValueError("At least two complete rows are required.")

    return selected.mean(), selected.cov()


def conditional_distribution(
    data, features, target_feature, target_value
):
    """
    Return a Gaussian summary for selected features
    among rows matching target_feature == target_value.
    """
    validate_features(data, features + [target_feature])

    filtered = data[data[target_feature] == target_value]
    selected = filtered[features].apply(
        pd.to_numeric, errors="coerce"
    ).dropna()

    if len(selected) < 2:
        raise ValueError(
            "Not enough rows for this conditional distribution."
        )

    return selected.mean(), selected.cov()


def is_discrete_feature(data, feature, max_unique=20):
    """
    Identify categorical and low-cardinality integer-like features
    that should be plotted as probabilities rather than KDE curves.
    """
    validate_features(data, [feature])

    values = data[feature].dropna()

    if values.empty:
        raise ValueError(
            f"No valid observations found for '{feature}'."
        )

    if not pd.api.types.is_numeric_dtype(values):
        return True

    numeric = pd.to_numeric(
        values, errors="coerce"
    ).dropna().to_numpy(dtype=float)

    numeric = numeric[np.isfinite(numeric)]

    if len(numeric) == 0:
        raise ValueError(
            f"No valid numeric observations found for '{feature}'."
        )

    return (
        len(np.unique(numeric)) <= max_unique
        and np.allclose(numeric, np.round(numeric))
    )


def discrete_marginal_distribution(data, feature):
    """Return empirical probabilities for a discrete feature."""
    validate_features(data, [feature])

    values = data[feature].dropna()

    if values.empty:
        raise ValueError(
            f"No valid observations found for '{feature}'."
        )

    probabilities = values.value_counts(normalize=True)

    # Numeric categories are sorted numerically.
    if pd.api.types.is_numeric_dtype(values):
        probabilities = probabilities.sort_index()
    else:
        probabilities = probabilities.sort_values(
            ascending=False
        )

    return [
        {
            "x": (
                float(category)
                if isinstance(category, (int, float, np.number))
                else str(category)
            ),
            "y": float(probability),
        }
        for category, probability in probabilities.items()
    ]


def marginal_density(data, feature, bandwidth=0.3, points=100):
    """
    Estimate a continuous marginal density using Gaussian KDE.
    Returns x/y coordinates for Recharts.
    """
    validate_features(data, [feature])

    if bandwidth <= 0:
        raise ValueError("Bandwidth must be greater than zero.")

    if not 20 <= points <= 500:
        raise ValueError("Points must be between 20 and 500.")

    values = pd.to_numeric(
        data[feature], errors="coerce"
    ).dropna().to_numpy(dtype=float)

    values = values[np.isfinite(values)]

    if len(values) < 2 or np.std(values) == 0:
        raise ValueError(
            "Feature needs at least two varying numeric values."
        )

    mean = values.mean()
    scale = values.std()

    # Standardize values so bandwidth is easier to tune.
    z = ((values - mean) / scale).reshape(-1, 1)

    model = KernelDensity(
        kernel="gaussian",
        bandwidth=bandwidth,
    ).fit(z)

    x = np.linspace(values.min(), values.max(), points)
    z_grid = ((x - mean) / scale).reshape(-1, 1)

    # Convert density back to the original feature scale.
    y = np.exp(model.score_samples(z_grid)) / scale

    return [
        {"x": float(a), "y": float(b)}
        for a, b in zip(x, y)
    ]


def categorical_marginal_distribution(data, feature):
    """Estimate empirical probabilities for a categorical feature."""
    validate_features(data, [feature])

    values = data[feature].dropna()

    if values.empty:
        raise ValueError(
            f"No valid observations found for '{feature}'."
        )

    probabilities = values.value_counts(normalize=True)

    return [
        {"x": str(category), "y": float(probability)}
        for category, probability in probabilities.items()
    ]


def marginal_feature_distribution(
    data, feature, bandwidth=0.3, points=100
):
    """
    Automatically select the appropriate distribution:
    - categorical/discrete: empirical probabilities
    - continuous numeric: KDE density
    """
    validate_features(data, [feature])

    if is_discrete_feature(data, feature):
        return {
            "kind": (
                "discrete"
                if pd.api.types.is_numeric_dtype(data[feature])
                else "categorical"
            ),
            "data": discrete_marginal_distribution(data, feature),
            "observations_used": int(data[feature].notna().sum()),
        }

    return {
        "kind": "continuous",
        "data": marginal_density(
            data, feature, bandwidth, points
        ),
        "observations_used": int(data[feature].notna().sum()),
    }


def conditional_feature_distribution(
    data,
    target,
    given,
    bandwidth=0.3,
    points=100,
):
    """
    Estimate P(target | given).

    Parameters
    ----------
    data : pandas.DataFrame
        Source dataset.
    target : str
        Feature whose distribution will be plotted.
    given : dict
        Conditions, e.g. {"Rooms": 4, "Type": "h"}.
    bandwidth : float
        KDE bandwidth for continuous targets.
    points : int
        Number of KDE curve points.

    Returns
    -------
    dict
        A JSON-friendly result with kind, target, given,
        observations_used and x/y chart data.
    """
    validate_features(data, [target, *given.keys()])

    if not given:
        raise ValueError(
            "Provide at least one conditioning feature."
        )

    if target in given:
        raise ValueError(
            "The target cannot also be a conditioning feature."
        )

    if bandwidth <= 0:
        raise ValueError("Bandwidth must be greater than zero.")

    if not 20 <= points <= 500:
        raise ValueError("Points must be between 20 and 500.")

    # Begin with rows where the target is present.
    mask = data[target].notna()

    # Apply every condition to the dataset.
    for feature, expected in given.items():
        column = data[feature]

        if pd.api.types.is_numeric_dtype(column):
            numeric_column = pd.to_numeric(
                column, errors="coerce"
            )

            try:
                expected_number = float(expected)
            except (TypeError, ValueError):
                raise ValueError(
                    f"Condition for '{feature}' must be numeric."
                )

            if not np.isfinite(expected_number):
                raise ValueError(
                    f"Condition for '{feature}' must be finite."
                )

            mask &= np.isclose(
                numeric_column.to_numpy(dtype=float, na_value=np.nan),
                expected_number,
                equal_nan=False,
            )
        else:
            mask &= (
                column.notna()
                & (column.astype(str) == str(expected))
            )

    filtered = data.loc[mask]

    if filtered.empty:
        raise ValueError(
            "No observations match the selected conditions. "
            "Try different conditioning values."
        )

    result = marginal_feature_distribution(
        filtered,
        target,
        bandwidth=bandwidth,
        points=points,
    )

    return {
        "kind": result["kind"],
        "target": target,
        "given": given,
        "observations_used": result["observations_used"],
        "data": result["data"],
    }

def conditional_density(
    data,
    feature,
    given_feature,
    given_value,
    bandwidth=0.3,
    points=100,
):
    """
    Estimate p(feature | given_feature = given_value)
    using KDE on the matching observations.
    """
    validate_features(data, [feature, given_feature])

    if feature == given_feature:
        raise ValueError(
            "The target and conditioning feature must differ."
        )

    if bandwidth <= 0:
        raise ValueError("Bandwidth must be greater than zero.")

    if not 20 <= points <= 500:
        raise ValueError("Points must be between 20 and 500.")

    condition = data[given_feature]

    # Filter matching rows.
    if pd.api.types.is_numeric_dtype(condition):
        try:
            value = float(given_value)
        except (TypeError, ValueError):
            raise ValueError(
                f"{given_feature} must have a numeric condition."
            )

        numeric_condition = pd.to_numeric(
            condition, errors="coerce"
        )

        mask = np.isclose(
            numeric_condition.to_numpy(
                dtype=float, na_value=np.nan
            ),
            value,
            equal_nan=False,
        )
    else:
        mask = (
            condition.notna()
            & (condition.astype(str) == str(given_value))
        )

    filtered = data.loc[mask]

    if filtered.empty:
        raise ValueError(
            f"No rows found where {given_feature} = {given_value}."
        )

    # This method estimates a continuous density.
    values = pd.to_numeric(
        filtered[feature], errors="coerce"
    ).dropna()

    if len(values) < 2 or values.std() == 0:
        raise ValueError(
            "The selected target needs at least two varying "
            "numeric observations."
        )

    density_data = marginal_density(
        filtered,
        feature,
        bandwidth=bandwidth,
        points=points,
    )

    return {
        "kind": "continuous",
        "feature": feature,
        "given": {
            given_feature: given_value
        },
        "observations_used": int(values.size),
        "data": density_data,
    }
