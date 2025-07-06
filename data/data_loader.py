# server/core/data_loader.py

import os
import time
import pandas as pd
import concurrent.futures
import time

MAX_WORKERS = 4  # Adjust based on your internet and CPU

from nselib import capital_market

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
os.makedirs(DATA_DIR, exist_ok=True)

# Static NIFTY50 list (as of mid-2024)
NIFTY_50 = [
    "ADANIPORTS", "ASIANPAINT", "AXISBANK", "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BPCL",
    "BHARTIARTL", "BRITANNIA", "CIPLA", "COALINDIA", "DIVISLAB", "DRREDDY", "EICHERMOT",
    "GRASIM", "HCLTECH", "HDFCBANK", "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "HINDUNILVR",
    "ICICIBANK", "ITC", "INDUSINDBK", "INFY", "JSWSTEEL", "KOTAKBANK", "LT", "M&M", "MARUTI",
    "NTPC", "NESTLEIND", "ONGC", "POWERGRID", "RELIANCE", "SBILIFE", "SBIN", "SUNPHARMA",
    "TCS", "TATACONSUM", "TATAMOTORS", "TATASTEEL", "TECHM", "TITAN", "UPL", "ULTRACEMCO",
    "WIPRO"
]

def fetch_symbol(symbol: str, period: str = '6M') -> pd.DataFrame:
    raw = capital_market.price_volume_data(symbol, period=period)
    df = pd.DataFrame(raw)
    df['Date'] = pd.to_datetime(df['Date'], format="%d-%b-%Y")
    df.sort_values('Date', inplace=True)

    for col in ['PrevClose','OpenPrice','HighPrice','LowPrice','LastPrice',
                'ClosePrice','AveragePrice','TotalTradedQuantity','Turnover₹','No.ofTrades']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace(',', '').astype(float)

    df.rename(columns={
        'ClosePrice': 'Close',
        'OpenPrice': 'Open',
        'HighPrice': 'High',
        'LowPrice': 'Low',
        'LastPrice': 'Last',
        'TotalTradedQuantity': 'Volume'
    }, inplace=True)

    return df[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]

def save_symbol(df: pd.DataFrame, symbol: str):
    path = os.path.join(DATA_DIR, f"{symbol}.csv")
    df.to_csv(path, index=False)


def safe_fetch(symbol):
    try:
        df = fetch_symbol(symbol)
        save_symbol(df, symbol)
        print(f"✅ {symbol}")
        return None  # success
    except Exception as e:
        print(f"❌ {symbol}: {e}")
        return symbol  # failed

def refresh_all_symbols_parallel():
    failed = []

    print(f"\n🚀 Starting download with {MAX_WORKERS} threads...\n")
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results = list(executor.map(safe_fetch, NIFTY_50))

    failed = [sym for sym in results if sym is not None]

    if failed:
        print("\n🔁 Retrying failed downloads...\n")
        for sym in failed:
            try:
                df = fetch_symbol(sym)
                save_symbol(df, sym)
                print(f"✅ Retry success: {sym}")
            except Exception as e:
                print(f"❌ Retry failed: {sym}: {e}")

if __name__ == "__main__":
    refresh_all_symbols_parallel()
