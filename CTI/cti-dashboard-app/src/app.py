from flask import Flask, jsonify, request, render_template
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask app with correct path to templates and static folders
app = Flask(__name__, template_folder='../templates', static_folder='../static')

# Route to serve the index.html page
@app.route('/')
def index():
    return render_template('index.html')

# Function to fetch data from AbuseIPDB
def workspace_abuseipdb_data(ip_address, api_key):
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {
        "Accept": "application/json",
        "Key": api_key
    }
    params = {
        "ipAddress": ip_address,
        "maxAgeInDays": 90,
        "verbose": True
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json().get('data', None)
    except requests.RequestException as e:
        print(f"Error fetching data for {ip_address}: {e}")
        return None

# Function to normalize the data
def normalize_abuseipdb_data(raw_data, ip_address):
    if not raw_data:
        return None
    
    try:
        return {
            "indicator_value": ip_address,
            "indicator_type": "ipv4",
            "source": "AbuseIPDB",
            "abuse_confidence_score": raw_data['abuseConfidenceScore'],
            "isp": raw_data['isp'],
            "domain": raw_data['domain'],
            "country_code": raw_data['countryCode'],
            "total_reports": raw_data['totalReports'],
            "last_reported_at": raw_data['lastReportedAt'],
            "description": f"IP reported {raw_data['totalReports']} times with confidence {raw_data['abuseConfidenceScore']}%.",
            "link_to_source": f"https://www.abuseipdb.com/check/{ip_address}"
        }
    except KeyError as e:
        print(f"Missing data for {ip_address}: {e}")
        return None

# Flask API endpoint
@app.route('/cti-data', methods=['GET'])
def get_cti_data():
    searched_ip = request.args.get('ip')

    if searched_ip:
        ip_addresses = [searched_ip]
    else:
        ip_addresses = ['8.8.8.8', '1.1.1.1', '192.168.1.100', '94.193.218.58']
                                                                                                                   
    api_key = os.getenv('ABUSEIPDB_API_KEY')
    
    if not api_key:
        return jsonify({"error": "API key not found"}), 500
    
    normalized_data_list = []
    
    for ip in ip_addresses:
        raw_data = workspace_abuseipdb_data(ip, api_key)
        if raw_data:
            normalized = normalize_abuseipdb_data(raw_data, ip)
            if normalized:
                normalized_data_list.append(normalized)
    
    return jsonify(normalized_data_list)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)