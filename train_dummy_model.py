import joblib
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Create dummy training data (to simulate the existing model)
# Features: JobRole, Department, WLB, Satisfaction, Stock
X = np.random.rand(100, 5) 
X[:, 0] = np.random.randint(0, 9, 100) # JobRole
X[:, 1] = np.random.randint(0, 6, 100) # Department
X[:, 2] = np.random.randint(1, 5, 100) # WLB
X[:, 3] = np.random.randint(1, 5, 100) # Satisfaction
X[:, 4] = np.random.randint(0, 4, 100) # Stock

# Dummy target: High satisfaction + high stock = Stay (0)
y = []
for row in X:
    score = row[2] + row[3] + row[4]
    y.append(0 if score > 7 else 1)

clf = RandomForestClassifier()
clf.fit(X, y)

# Save to .pkl
joblib.dump(clf, 'model.pkl')
print("Dummy model.pkl created successfully for demo purposes.")
