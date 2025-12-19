import streamlit as st
import pandas as pd
import db_manager

st.set_page_config(page_title="Pharmacy Zenith Dashboard", layout="wide")

st.title("🏥 Pharmacy Zenith - Admin Dashboard")

# 1. Load Real Data
with st.spinner("Fetching live data from Google Sheets..."):
    sales_df = db_manager.load_data("Sales")
    purchases_df = db_manager.load_data("Purchases")
    wastage_df = db_manager.load_data("Wastage")

# 2. Key Performance Indicators (KPIs)
st.subheader("📊 Key Metrics")
col1, col2, col3 = st.columns(3)

# KPI 1: Total Units Sold
total_sold = 0
total_revenue = 0
if not sales_df.empty and "Quantity" in sales_df.columns:
    total_sold = sales_df["Quantity"].sum()
    # If there's a 'Price' or 'Total_Amount' column, use it. Else assume dummy calculation.
    if "Total_Amount" in sales_df.columns:
         total_revenue = sales_df["Total_Amount"].sum()
    else:
         # Dummy assumption for hackathon if column missing: avg price 50
         total_revenue = total_sold * 50 

col1.metric("Total Soles (Units)", f"{total_sold}")
col2.metric("Est. Total Revenue", f"₹{total_revenue:,.2f}")

# KPI 2: Total Current Stock
total_stock = 0
if not purchases_df.empty:
    purchased_qty = purchases_df["Quantity"].sum() if "Quantity" in purchases_df.columns else 0
    total_stock = purchased_qty - total_sold # Simple logic

col3.metric("Current Stock Level", f"{total_stock} Units")

# 3. Recent Transactions
st.divider()
st.subheader("📋 Recent Sales Transactions")
if not sales_df.empty:
    st.dataframe(sales_df.tail(10)) # Show last 10
else:
    st.info("No sales data available.")

# 4. Low Stock / Wastage Alerts
st.divider()
col_alert1, col_alert2 = st.columns(2)

with col_alert1:
    st.subheader("⚠️ Wastage Alerts (Expiring Soon)")
    if not wastage_df.empty:
        st.dataframe(wastage_df)
    else:
        st.success("No wastage alerts!")

with col_alert2:
    st.subheader("📉 Low Stock Warning")
    if total_stock < 50:
        st.error(f"Critical Stock Level: Only {total_stock} units global stock!")
    else:
        st.success("Stock levels look healthy.")
