import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import BayesianRidge


data = pd.read_csv("melb_data.csv")


features = [
    "Suburb",
    "Rooms",
    "Type",
    "Method",
    "SellerG",
    "Distance",
    "Postcode",
    "Bedroom2",
    "Bathroom",
    "Car",
    "Landsize",
    "BuildingArea",
    "YearBuilt",
    "CouncilArea",
    "Lattitude",
    "Longtitude",
    "Regionname",
    "Propertycount",
]

target = "Price"


model_data = data[features + [target]].copy()

model_data[target] = pd.to_numeric(
    model_data[target],
    errors="coerce"
)

model_data = model_data.dropna(subset=[target])

X = model_data[features]
y = model_data[target]

categorical_features = [
    "Suburb",
    "Type",
    "Method",
    "SellerG",
    "CouncilArea",
    "Regionname",
]

numeric_features = [
    "Rooms",
    "Distance",
    "Postcode",
    "Bedroom2",
    "Bathroom",
    "Car",
    "Landsize",
    "BuildingArea",
    "YearBuilt",
    "Lattitude",
    "Longtitude",
    "Propertycount",
]


numeric_transformer = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="median")
    )
])


categorical_transformer = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="most_frequent")
    ),
    (
        "onehot",
        OneHotEncoder(
            handle_unknown="ignore",
            sparse_output=False
        )
    )
])


preprocessor = ColumnTransformer([
    (
        "numeric",
        numeric_transformer,
        numeric_features
    ),
    (
        "categorical",
        categorical_transformer,
        categorical_features
    )
])


model = Pipeline([
    (
        "preprocessor",
        preprocessor
    ),
    (
        "regression",
        BayesianRidge(
            max_iter=1000
        )
    )
])


print("Training Bayesian model...")

model.fit(X, y)

print("Training complete.")

new_house = pd.DataFrame({
    "Suburb": ["Abbotsford"],
    "Rooms": [2],
    "Type": ["h"],
    "Method": ["S"],
    "SellerG": ["Biggin"],
    "Distance": [2.5],
    "Postcode": [3067],
    "Bedroom2": [2],
    "Bathroom": [1],
    "Car": [1],
    "Landsize": [202],
    "BuildingArea": [100],
    "YearBuilt": [None],
    "CouncilArea": ["Yarra"],
    "Lattitude": [-37.7996],
    "Longtitude": [144.9984],
    "Regionname": ["Northern Metropolitan"],
    "Propertycount": [4019],
})


predicted_price, standard_deviation = model.predict(
    new_house,
    return_std=True
)

predicted_price = predicted_price[0]
standard_deviation = standard_deviation[0]


lower = predicted_price - 1.96 * standard_deviation
upper = predicted_price + 1.96 * standard_deviation


print("\nFeatures used:")
print(features)

print("\nNew house:")
print(new_house.to_string(index=False))

print(
    f"\nBayesian predicted price: "
    f"${predicted_price:,.2f}"
)

print(
    f"\nPrediction standard deviation: "
    f"${standard_deviation:,.2f}"
)

print(
    f"\nApproximate 95% interval:"
)

print(
    f"${lower:,.2f}  to  ${upper:,.2f}"
)
