from flask import Flask, jsonify, request
from flask_cors import CORS
import db_manager
import pandas as pd
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    """Returns Sales, Purchases, and Forecast data."""
    try:
        sales = db_manager.load_data("Sales")
        purchases = db_manager.load_data("Purchases")
        forecast = db_manager.load_data("Forecast")
        return jsonify({
            "sales": sales,
            "purchases": purchases,
            "forecast": forecast
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transaction', methods=['POST'])
def add_transaction():
    """
    Adds a single manual transaction (row) to a sheet.
    Body: { "sheet": "Sales", "row": [...] }
    """
    data = request.json
    sheet_name = data.get("sheet")
    row_data = data.get("row")
    
    if not sheet_name or not row_data:
        return jsonify({"error": "Missing sheet or row data"}), 400

    success = db_manager.add_transaction(sheet_name, row_data)
    if success:
        return jsonify({"message": "Transaction added successfully"}), 200
    else:
        return jsonify({"error": "Failed to add transaction"}), 500

@app.route('/api/upload', methods=['POST'])
def upload_csv():
    """
    Handles CSV upload. Appends rows to the target sheet.
    Body: { "sheet": "Purchases", "data": [...] } (List of dicts or list of lists)
    """
    data = request.json
    sheet_name = data.get("sheet")
    rows = data.get("data") # Expecting list of rows
    
    if not sheet_name or not rows:
         return jsonify({"error": "Missing sheet or data"}), 400

    # For bulk upload, iterate and add (simple but slow) or use batch update if db_manager supports it.
    # db_manager.add_transaction adds one by one.
    # Ideally gspread has append_rows. Let's update db_manager later for efficiency if needed.
    # For now, loop.
    
    success_count = 0
    client = db_manager.get_connection()
    if not client:
         return jsonify({"error": "Offline mode"}), 503

    try:
        sheet = client.open("Pharmacy_Data").worksheet(sheet_name)
        # gspread append_rows is efficient
        sheet.append_rows(rows)
        return jsonify({"message": f"Successfully added {len(rows)} rows"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Gemini Integration ---
import google.generativeai as genai
import toml
import os

try:
    # Load API Key
    if os.path.exists("secrets.toml"):
        secrets = toml.load("secrets.toml")
        api_key = secrets.get("gemini", {}).get("api_key")
        if api_key:
            genai.configure(api_key=api_key)
            
            # Robust Model Selection
            model = None
            preferred_models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro", "gemini-1.0-pro"]
            
            # 1. Try preferred models
            for m_name in preferred_models:
                try:
                    test_model = genai.GenerativeModel(m_name)
                    # Lightweight test to check availability
                    test_model.generate_content("test")
                    model = test_model
                    print(f"Gemini AI configured successfully using model: {m_name}")
                    break
                except Exception as e:
                    print(f"Model {m_name} failed: {e}")
                    continue
            
            # 2. Fallback: Search available models if preferred failed
            if not model:
                print("Preferred models failed. Searching available models...")
                try:
                    for m in genai.list_models():
                        if 'generateContent' in m.supported_generation_methods and 'gemini' in m.name:
                            # Strip 'models/' prefix if present for GenerativeModel constructor
                            model_name = m.name.replace("models/", "") 
                            try:
                                test_model = genai.GenerativeModel(model_name)
                                test_model.generate_content("test")
                                model = test_model
                                print(f"Gemini AI configured successfully using fallback: {model_name}")
                                break
                            except:
                                continue
                except Exception as e:
                    print(f"Failed to list models: {e}")

            if not model:
                print("Error: Could not configure any valid Gemini model.")
        else:
            print("Warning: Gemini API Key not found in secrets.toml")
            model = None
    else:
        print("Warning: secrets.toml not found")
        model = None
except Exception as e:
    print(f"Failed to configure Gemini: {e}")
    model = None

@app.route('/api/analyze', methods=['POST'])
def analyze_medicine():
    """
    Analyzes medicine status using Gemini AI.
    Body: { "name": "Dolo 650", "stock": 120, "expiry": "2025-12-31", "forecast": 50 }
    """
    if not model:
        return jsonify({"insight": "AI unavailable (Key missing)."}), 503

    data = request.json
    name = data.get("name")
    stock = data.get("stock")
    expiry = data.get("expiry")
    forecast = data.get("forecast")
    batches = data.get("batches", []) # List of batches if available

    # Construct Prompt
    prompt = f"""
    You are a pharmacy inventory expert assistant. Analyze the status of the following medicine:
    - Name: {name}
    - Current Total Stock: {stock} units
    - Predicted 30-Day Demand: {forecast} units
    - Nearest Expiry Date: {expiry}

    Task: Provide a single, concise (max 2 sentences) ACTIONABLE insight for the pharmacist. 
    Focus on reordering if stock is low vs demand, or discounting/pushing if expiry is near.
    Do not use markdown formatting. Be direct.
    """

    try:
        response = model.generate_content(prompt)
        return jsonify({"insight": response.text.strip()})
    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"insight": "Could not generate insight."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
