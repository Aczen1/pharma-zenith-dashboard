import streamlit as st
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime

# Scope for Google Sheets API
SCOPE = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

def get_connection():
    """Authenticates using secrets.toml and returns the gspread client."""
    try:
        # Load credentials from streamlit secrets
        creds_dict = st.secrets["gcp_service_account"]
        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, SCOPE)
        client = gspread.authorize(creds)
        return client
    except Exception as e:
        # st.error(f"Error connecting to Google Sheets: {e}")
        # Return None so we can fallback gracefully
        return None

def load_data(sheet_name):
    """
    Fetches data from Google Sheets.
    If connection fails or sheet not found, falls back to local CSV.
    """
    client = get_connection()
    
    # Map sheet names to local CSV filenames
    fallback_map = {
        "Sales": "final_cleaned_sales.csv",
        "Purchases": "final_cleaned_purchases.csv",
        "Wastage": "wastage_alert_report.csv",
        "Forecast": "pharmacy_forecast_next_30_days.csv"
    }

    try:
        if client:
            # Assuming a single spreadsheet for the project, or search by name
            # For this hackathon, let's assume the spreadsheet name is "Pharmacy_Data" 
            # or we pass it in. If explicit sheet name is unique across user drive:
            sheet = client.open("Pharmacy_Data").worksheet(sheet_name)
            data = sheet.get_all_records()
            df = pd.DataFrame(data)
            if not df.empty:
                return df
    except Exception as e:
        st.warning(f"Could not load '{sheet_name}' from Google Sheets. Switching to Offline Mode.")
    
    # Fallback to CSV
    try:
        filename = fallback_map.get(sheet_name)
        if filename:
            df = pd.read_csv(filename)
            return df
    except FileNotFoundError:
        st.error(f"Critical Error: Local backup {filename} not found!")
        return pd.DataFrame() # Return empty to avoid crashes

    return pd.DataFrame()

def add_transaction(date, drug_name, batch_number, qty):
    """
    Appends a new transaction row to the 'Sales' tab in Google Sheets.
    """
    client = get_connection()
    try:
        if client:
            sheet = client.open("Pharmacy_Data").worksheet("Sales")
            # Append row: [Date, Drug_Name, Batch_Number, Quantity]
            # Ensure order matches your sheet columns!
            sheet.append_row([str(date), drug_name, batch_number, int(qty)])
            st.success(f"Sold {qty} of {drug_name} (Batch: {batch_number}) - Updated Cloud!")
            return True
        else:
            st.error("Cannot add transaction: Offline Mode active.")
            return False
    except Exception as e:
        st.error(f"Failed to update Google Sheet: {e}")
        return False
