import requests

email = "parikshith.sr19@gmail.com"
name = "parikshith sivakumar"
roll_no = "bl.en.u4cse22045"
access_code = "SwuuKE"
client_id = "73c0e3e9-b4f8-492d-9f86-c1e6a7d6f1a2"
client_secret = "RNzhECDzFaHvbgAy"

url = "http://20.244.56.144/evaluation-service/auth"

payload = {
    "email": email,
    "name": name,
    "rollNo": roll_no,
    "accessCode": access_code,
    "clientID": client_id,
    "clientSecret": client_secret
}

response = requests.post(url, json=payload)

if response.status_code in (200, 201):
    token_data = response.json()
    access_token = token_data["access_token"]
    print("Access Token:", access_token)
else:
    print("Failed to get token. Status code:", response.status_code)
    print("Response:", response.text)
