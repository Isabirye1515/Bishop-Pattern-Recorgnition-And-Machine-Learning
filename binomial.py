import pandas as pd


def discrete_distribution(data, feature="Rooms"):

    if feature not in data.columns:
        raise ValueError(
            f"Feature '{feature}' does not exist"
        )

    distribution = (
        data[feature]
        .dropna()
        .value_counts()
        .sort_index()
    )

    total = distribution.sum()

    result = []

    for value, count in distribution.items():

        result.append({
            "value": value,
            "count": int(count),
            "probability": float(count / total)
        })

    return result

import pandas as pd
from scipy.stats import beta as beta_dist


def bernoulli_bayes_curves(
    data,
    prior_alpha,
    prior_beta,
    price_feature="Price",
    points=100
):
    """
    Returns prior, likelihood, and posterior curves for Recharts.

    The prior is NOT defaulted — you must pass it in.

    Parameters
    ----------
    data : pd.DataFrame
    prior_alpha : float
        Alpha of the Beta prior.
    prior_beta : float
        Beta of the Beta prior.
    price_feature : str
        Column to use for the expensive/not-expensive split.
    points : int
        Number of theta samples in [0, 1].
    """

    if price_feature not in data.columns:
        raise ValueError(f"Feature '{price_feature}' does not exist")

    if prior_alpha <= 0 or prior_beta <= 0:
        raise ValueError("prior_alpha and prior_beta must be > 0")

    if points < 2:
        raise ValueError("points must be >= 2")

    prices = data[price_feature].dropna()
    if len(prices) == 0:
        raise ValueError("No non-null prices to compute the distribution.")

    threshold = float(prices.mean())

    # 1 = Expensive (success), 0 = Not Expensive
    x = (prices > threshold).astype(int)
    n = int(len(x))
    k = int(x.sum())
    n_minus_k = n - k

    # Grid of theta values
    thetas = [i / (points - 1) for i in range(points)]

    # Prior: Beta(alpha, beta)  — uses ONLY what was passed in
    prior_vals = beta_dist.pdf(thetas, prior_alpha, prior_beta)

    # Likelihood: theta^k * (1-theta)^(n-k), normalized to peak = 1
    raw_lik = [(t ** k) * ((1 - t) ** n_minus_k) for t in thetas]
    max_lik = max(raw_lik) if max(raw_lik) > 0 else 1
    lik_vals = [v / max_lik for v in raw_lik]

    # Posterior: Beta(alpha + k, beta + n - k)
    post_alpha = prior_alpha + k
    post_beta = prior_beta + n_minus_k
    post_vals = beta_dist.pdf(thetas, post_alpha, post_beta)

    combined = [
        {
            "theta": float(t),
            "prior": float(pv),
            "likelihood": float(lv),
            "posterior": float(pov),
        }
        for t, pv, lv, pov in zip(thetas, prior_vals, lik_vals, post_vals)
    ]

    return {
        "threshold": threshold,
        "n": n,
        "k": k,
        "n_minus_k": n_minus_k,
        "mle": k / n,
        "prior": {"alpha": prior_alpha, "beta": prior_beta},
        "posterior": {"alpha": post_alpha, "beta": post_beta},
        "combined": combined,
    }