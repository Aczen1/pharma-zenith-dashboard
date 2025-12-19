import streamlit as st
import pandas as pd
from datetime import date
import db_manager

st.set_page_config(page_title="Smart Shelf", page_icon="💊")

st.title("💊 Smart Shelf - FEFO System")
st.markdown("**First-Expiry-First-Out Logic**: Always pick the batch expiring soonest!")

# 1. Load Data
sales_df = db_manager.load_data("Sales")
purchases_df = db_manager.load_data("Purchases")

if sales_df.empty or purchases_df.empty:
    st.error("No data found. Please check connectivity or CSV files.")
    st.stop()

# 2. Process Stock Levels
# Calculate total sold per batch
if "Batch_Number" in sales_df.columns and "Quantity" in sales_df.columns:
    sold_per_batch = sales_df.groupby("Batch_Number")["Quantity"].sum().reset_index()
    sold_per_batch.rename(columns={"Quantity": "Sold_Qty"}, inplace=True)
else:
    sold_per_batch = pd.DataFrame(columns=["Batch_Number", "Sold_Qty"])

# Merge with Purchases to get initial stock
stock_df = pd.merge(purchases_df, sold_per_batch, on="Batch_Number", how="left")
stock_df["Sold_Qty"] = stock_df["Sold_Qty"].fillna(0)
stock_df["Current_Stock"] = stock_df["Quantity"] - stock_df["Sold_Qty"]

# Filter out out-of-stock items
active_stock = stock_df[stock_df["Current_Stock"] > 0].copy()

# 3. FEFO Logic
# Convert Expiry to datetime for sorting
active_stock["Expiry_Date"] = pd.to_datetime(active_stock["Expiry_Date"])
active_stock = active_stock.sort_values(by="Expiry_Date", ascending=True)

# 4. Search UI
all_medicines = active_stock["Drug_Name"].unique()
selected_drug = st.selectbox("Search Medicine:", all_medicines)

if selected_drug:
    st.subheader(f"Batches for: {selected_drug}")
    
    # Filter for selected drug
    drug_batches = active_stock[active_stock["Drug_Name"] == selected_drug]
    
    if drug_batches.empty:
        st.warning("Out of Stock!")
    else:
        # Display Batches
        for index, row in drug_batches.iterrows():
            batch_no = row["Batch_Number"]
            expiry = row["Expiry_Date"].date()
            stock = int(row["Current_Stock"])
            
            # Smart Styling
            is_oldest = (index == drug_batches.index[0])
            
            if is_oldest:
                card_color = "green"
                msg = "✅ PICK THIS BATCH (Expiring Soonest)"
            else:
                card_color = "red"
                msg = "❌ DO NOT PICK (Newer Batch)"
            
            with st.container():
                st.markdown(f"### Batch: {batch_no}")
                st.markdown(f"**Expiry**: {expiry} | **Stock**: {stock}")
                
                if is_oldest:
                    st.success(msg)
                else:
                    st.error(msg)
                
                # Sell Action
                with st.expander(f"Sell from {batch_no}"):
                    qty_to_sell = st.number_input(f"Qty to sell ({batch_no})", min_value=1, max_value=stock, key=f"qty_{batch_no}")
                    if st.button(f"Confirm Sale ({batch_no})", key=f"btn_{batch_no}"):
                        success = db_manager.add_transaction(date.today(), selected_drug, batch_no, qty_to_sell)
                        if success:
                            st.balloons()
                            st.rerun()

                st.divider()
