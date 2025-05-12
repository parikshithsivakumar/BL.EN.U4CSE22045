import requests

url = "http://20.244.56.144/evaluation-service/register"
data = {
    "email": "parikshith.sr19@gmail.com",
    "name": "Parikshith Sivakumar",
    "mobileNo": "8971182273",
    "githubUsername": "parikshithsivakumar",
    "rollNo": "BL.EN.U4CSE22045",
    "collegeName": "Amrita Vishwa Vidyapeetham",
    "accessCode": "SwuuKE"
}

response = requests.post(url, json=data)

if response.status_code == 200:
    print("✅ Registration Successful! Save this securely:")
    print(response.json())
else:
    print("❌ Registration Failed:", response.status_code, response.text)
