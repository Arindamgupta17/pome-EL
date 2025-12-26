from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import os
import numpy as np

app = Flask(__name__)

# Load Model (Graceful fallback if file missing)
MODEL_PATH = 'attrition_xgb_model (1).pkl'
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            model = None
    else:
        print("Model file not found. Running in demo mode with mock predictions until model is trained.")

load_model()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    # Extract features in EXACT order
    # 1. JobRole (Encoded)
    # 2. Department (Encoded)
    # 3. WorkLifeBalance (1-4)
    # 4. JobSatisfaction (1-4)
    # 5. StockOptionLevel (0-3)
    
    features = [
        int(data.get('JobRole')),
        int(data.get('Department')),
        int(data.get('WorkLifeBalance')),
        int(data.get('JobSatisfaction')),
        int(data.get('StockOptionLevel'))
    ]
    
    # Prediction logic
    if model:
        # Predict using loaded model
        try:
            # Reshape for single sample
            input_data = np.array(features).reshape(1, -1)
            prediction = int(model.predict(input_data)[0])
            # Try to get probability if available
            if hasattr(model, 'predict_proba'):
                probability = float(model.predict_proba(input_data)[0][1]) * 100
            else:
                probability = 85.0 if prediction == 1 else 15.0
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        # Fallback/Mock logic for demo if model isn't ready
        # Heuristic: Poor satisfaction + Low stock + Poor WLB = High Attrition
        score = 0
        if features[2] <= 2: score += 30 # Poor WLB
        if features[3] <= 2: score += 40 # Poor Satisfaction
        if features[4] == 0: score += 20 # No Stock
        
        probability = min(max(score + 10, 5), 95)
        prediction = 1 if probability > 50 else 0

    # Risk Level
    if probability < 30:
        risk_level = "Low"
    elif probability < 70:
        risk_level = "Medium"
    else:
        risk_level = "High"

    # Feature Summary & Contributions (Mock SHAP)
    # In a real app, use shap library here.
    contributions = {
        'JobRole': np.random.uniform(-5, 5),
        'Department': np.random.uniform(-5, 5),
        'WorkLifeBalance': -10 if features[2] > 2 else 15,
        'JobSatisfaction': -15 if features[3] > 2 else 20,
        'StockOptionLevel': -5 if features[4] > 0 else 10
    }
    
    # Generate Insights
    insights = []
    if features[3] <= 2:
        insights.append("Low job satisfaction is a primary driver of risk.")
    if features[2] <= 2:
        insights.append("Poor work-life balance significantly increases attrition probability.")
    if features[4] == 0:
        insights.append("Lack of stock options contributes to lower retention.")
    if not insights and prediction == 0:
        insights.append("Employee engagement metrics are healthy.")

    return jsonify({
        'attrition_prediction': prediction,
        'attrition_probability': round(probability, 1),
        'risk_level': risk_level,
        'feature_summary': " ".join(insights),
        'feature_contributions': contributions
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
