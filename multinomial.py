import numpy as np
from scipy.special import gammaln
from scipy.stats import dirichlet as dirichlet_dist


CATEGORY_LABELS = {
    "Type": {
        "h": "House",
        "t": "Townhouse",
        "u": "Unit",
    },
    "Method": {
        "S": "Sold",
        "SP": "Sold Prior",
        "PI": "Passed In",
        "VB": "Vendor Bid",
        "SA": "Sold After",
    },
    "Regionname": {
        "Northern Metropolitan": "Northern Metropolitan",
        "Southern Metropolitan": "Southern Metropolitan",
        "Western Metropolitan": "Western Metropolitan",
        "Eastern Metropolitan": "Eastern Metropolitan",
    },
    "CouncilArea": {},
}


def multinomial_distribution(
    data,
    feature="Type",
    prior_alpha=None
):

    if feature not in data.columns:
        raise ValueError(
            f"Feature '{feature}' does not exist"
        )

    series = data[feature].dropna()

    if len(series) == 0:
        raise ValueError(
            f"No non-null values for '{feature}'"
        )

    distribution = (
        series
        .value_counts()
        .sort_index()
    )

    total = int(distribution.sum())
    categories = distribution.index.tolist()
    m = distribution.to_numpy(dtype=float)
    K = len(categories)

    if prior_alpha is None:
        prior_alpha = np.ones(K, dtype=float)
    else:
        prior_alpha = np.asarray(prior_alpha, dtype=float)
        if len(prior_alpha) != K:
            raise ValueError(
                f"prior_alpha must have length {K}"
            )

    mle_vals = m / total

    posterior_alpha = prior_alpha + m
    prior_alpha_0 = float(prior_alpha.sum())
    posterior_alpha_0 = float(posterior_alpha.sum())
    posterior_mean_vals = posterior_alpha / posterior_alpha_0

    log_likelihood = float(
        np.sum(m * np.log(mle_vals + 1e-300))
    )

    log_coeff = float(
        gammaln(total + 1) - np.sum(gammaln(m + 1))
    )

    multinomial_probability = float(
        np.exp(log_coeff + log_likelihood)
    )

    dirichlet_pdf_at_mle = float(
        dirichlet_dist.pdf(mle_vals, posterior_alpha)
    )

    labels = CATEGORY_LABELS.get(feature, {})

    combined = [
        {
            "category": labels.get(str(cat), str(cat)),
            "count": int(m[i]),
            "mle": float(mle_vals[i]),
            "posterior": float(posterior_mean_vals[i]),
        }
        for i, cat in enumerate(categories)
    ]

    return {
        "feature": feature,
        "n": total,
        "k": K,
        "prior": {
            "alpha": prior_alpha.tolist(),
            "alpha0": prior_alpha_0,
        },
        "posterior": {
            "alpha": posterior_alpha.tolist(),
            "alpha0": posterior_alpha_0,
        },
        "log_likelihood": log_likelihood,
        "log_multinomial_coefficient": log_coeff,
        "multinomial_probability": multinomial_probability,
        "dirichlet_pdf_at_mle": dirichlet_pdf_at_mle,
        "combined": combined,
    }