import pandas as pd
import numpy as np
from scipy.stats import beta as beta_dist

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

    if price_feature not in data.columns:
        raise ValueError(f"Feature '{price_feature}' does not exist")
    if prior_alpha <= 0 or prior_beta <= 0:
        raise ValueError("prior_alpha and prior_beta must be > 0")
    if points < 2:
        raise ValueError("points must be >= 2")

    prices = data[price_feature].dropna()
    if len(prices) == 0:
        raise ValueError("No non-null prices.")

    threshold = float(prices.mean())
    x = (prices > threshold).astype(int)
    n = int(len(x))
    k = int(x.sum())
    n_minus_k = n - k

    thetas = np.linspace(0, 1, points)

    # Prior
    prior_vals = beta_dist.pdf(thetas, prior_alpha, prior_beta)

    # Log-likelihood (safe from underflow)
    log_lik = np.full_like(thetas, -np.inf, dtype=float)
    mask = (thetas > 0) & (thetas < 1)
    log_lik[mask] = (
        k * np.log(thetas[mask]) +
        n_minus_k * np.log(1 - thetas[mask])
    )

    # Shift so peak = 0, then exponentiate
    finite = log_lik[np.isfinite(log_lik)]
    if len(finite) > 0:
        log_lik = log_lik - finite.max()
    lik_vals = np.exp(log_lik)
    lik_vals[~np.isfinite(lik_vals)] = 0.0

    # Posterior
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