import streamlit as st
import pandas as pd
import altair as alt
import db_manager

st.set_page_config(page_title="Real-Time Alerts & Forecast", page_icon="📈")

st.title("📈 Demand Forecasting & Alerts")
st.markdown("AI-Powered Predictions for the next 30 days.")

# 1. Load Forecast Data
forecast_df = db_manager.load_data("Forecast")

if forecast_df.empty:
    st.warning("No forecast data available. Please check 'pharmacy_forecast_next_30_days.csv'.")
else:
    # Ensure Date format
    if "Date" in forecast_df.columns:
        forecast_df["Date"] = pd.to_datetime(forecast_df["Date"])

    # 2. Filter by Medicine
    all_drugs = forecast_df["Drug_Name"].unique()
    selected_drug = st.selectbox("Select Medicine to Forecast:", all_drugs)

    if selected_drug:
        drug_data = forecast_df[forecast_df["Drug_Name"] == selected_drug]

        # 3. Plot Chart
        chart = alt.Chart(drug_data).mark_line(point=True).encode(
            x='Date:T',
            y=alt.Y('Predicted_Qty:Q', title='Predicted Quantity'),
            tooltip=['Date', 'Predicted_Qty']
        ).properties(
            title=f'30-Day Demand Forecast: {selected_drug}'
        ).interactive()

        st.altair_chart(chart, use_container_width=True)

        # 4. Show Warning if spiking
        # Simple logic: if max predicted > 2x average
        avg_qty = drug_data["Predicted_Qty"].mean()
        max_qty = drug_data["Predicted_Qty"].max()
        
        if max_qty > (avg_qty * 1.5):
            st.error(f"⚠️ High Demand Alert! Predicted peak of {max_qty:.2f} units is significantly above average.")
        else:
            st.success("Demand looks stable.")

        with st.expander("View Raw Data"):
            st.dataframe(drug_data)
