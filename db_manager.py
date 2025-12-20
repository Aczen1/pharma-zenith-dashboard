import streamlit as st
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
import toml
import os

# Scope for Google Sheets API
SCOPE = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

def get_connection():
    """Authenticates using secrets.toml and returns the gspread client."""
    try:
        # Try loading from streamlit secrets first
        if hasattr(st, "secrets") and "gcp_service_account" in st.secrets:
             creds_dict = st.secrets["gcp_service_account"]
        # Fallback to local TOML file
        elif os.path.exists("secrets.toml"):
             data = toml.load("secrets.toml")
             creds_dict = data["gcp_service_account"]
        else:
             return None

        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, SCOPE)
        client = gspread.authorize(creds)
        return client
    except Exception as e:
        print(f"Error connecting to Google Sheets: {e}")
        return None

def load_data(sheet_name):
    """
    Fetches data from Google Sheets.
    Returns a list of dictionaries (records).
    """
    client = get_connection()
    
    # Map sheet names to local CSV filenames for fallback
    fallback_map = {
        "Sales": "final_cleaned_sales.csv",
        "Purchases": "final_cleaned_purchases.csv",
        "Forecast": "pharmacy_forecast_next_30_days.csv"
    }

    try:
        if client:
            # Open Sheet - assuming "Pharmacy_Data" is the main file name
            # You might need to change this if the file is named differently
            try:
                sheet = client.open("Pharmacy_Data").worksheet(sheet_name)
                data = sheet.get_all_records()
                return data
            except gspread.exceptions.SpreadsheetNotFound:
                print("Spreadsheet 'Pharmacy_Data' not found.")
            except gspread.exceptions.WorksheetNotFound:
                 print(f"Worksheet '{sheet_name}' not found.")
    except Exception as e:
        print(f"Error loading from cloud: {e}")
    
    # Fallback to CSV
    try:
        filename = fallback_map.get(sheet_name)
        if filename and os.path.exists(filename):
            df = pd.read_csv(filename)
            return df.to_dict(orient="records")
    except Exception as e:
        print(f"Error loading local backup: {e}")

    return []

def add_transaction(sheet_name, row_data):
    """
    Appends a new row to the specified sheet.
    row_data: list of values
    """
    client = get_connection()
    try:
        if client:
            sheet = client.open("Pharmacy_Data").worksheet(sheet_name)
            sheet.append_row(row_data)
            return True
        return False
    except Exception as e:
        print(f"Failed to update Google Sheet: {e}")
        return False
