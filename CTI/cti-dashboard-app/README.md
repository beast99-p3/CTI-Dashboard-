# CTI Dashboard Application

## What is this?
This is a sleek, user-friendly dashboard for cyber threat intelligence (CTI) analysts and security professionals. Built as an MVP (Minimum Viable Product), it helps you quickly view, filter, and understand IP reputation data with a modern, cyber-themed interface.

## Data Sources
* **AbuseIPDB** - Your first line of defense against malicious IPs. This service tracks reported abuse across the internet, providing confidence scores and historical data.
  * [Check out AbuseIPDB](https://www.abuseipdb.com/)

## Getting Started

### Before You Begin
You'll need:
* Python 3.x installed on your machine
* pip (Python's package manager)
* A web browser
* An AbuseIPDB account for the API key

### Quick Setup

1. **Clone & Navigate**
   ```bash
   git clone <your-repository-url>
   cd cti-dashboard-app
   ```

2. **Set Up Your Environment**
   This keeps your project dependencies isolated and tidy.

   **Windows users:**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

   **Mac/Linux users:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install What You Need**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Your API Key**
   ```bash
   # Windows
   copy .env.example .env

   # Mac/Linux
   cp .env.example .env
   ```
   
   Then open `.env` and add your API key:
   ```
   ABUSEIPDB_API_KEY=your_actual_key_here
   ```
   
   Need a key? [Register here](https://www.abuseipdb.com/account/api).

5. **Launch the Dashboard**
   ```bash
   # From the main folder
   python src/app.py
   ```
   
   Then visit [http://127.0.0.1:5000/](http://127.0.0.1:5000/) in your browser.

## How It Works

### The Backend
Built with Python and Flask, the backend:
* Connects securely to AbuseIPDB's API
* Transforms complex data into a clean, usable format
* Serves both the frontend interface and API endpoints
* Handles search and filtering requests

### The Frontend
A clean, cyber-themed interface that:
* Shows reputation data in an easy-to-scan table
* Offers real-time filtering by IP address and risk level
* Visualizes abuse score distributions through interactive charts
* Provides direct links to detailed reports

### Under the Hood
The application normalizes different data formats into a consistent structure, making it easier to work with and display. This approach also makes it simple to add new data sources in the future.

---
Happy hunting! This dashboard helps security teams quickly analyze IP reputation data for better threat intelligence.