# Pharmacy Zenith Dashboard - Smart Inventory System

## Overview
A Streamlit-based dashboard for managing pharmacy inventory, featuring real-time Google Sheets integration and FEFO (First-Expiry-First-Out) logic.

## Features
- **Real-Time Dashboard**: View Sales, Revenue, and Stock levels.
- **Smart Shelf**: FEFO logic to highlight expiring batches.
- **Offline Fallback**: Automatically switches to local CSVs if internet fails.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Secrets**:
   - Replace the dummy values in `secrets.toml` with your Google Cloud Service Account keys.
   - Or, for public demo, ensure `st.secrets` are set up.

3. **Run the App**:
   ```bash
   streamlit run app.py
   ```

## Folder Structure
- `app.py`: Main dashboard.
- `pages/`: Contains the Smart Shelf page.
- `db_manager.py`: Handles database connections.
- `cleaned_*.csv`: Backup data files.
