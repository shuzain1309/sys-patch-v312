"""Run ONCE on your laptop to get the YouTube refresh token.
1) console.cloud.google.com: new project > enable "YouTube Data API v3" > OAuth consent screen (External, add yourself as test user)
   > Credentials > Create OAuth client ID > type "Desktop app" > download JSON as client_secret.json next to this file.
2) pip install google-auth-oauthlib   then   python get_youtube_token.py
3) Put client id, client secret and the printed refresh token into GitHub secrets YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN."""
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"])
c = flow.run_local_server(port=0, access_type="offline", prompt="consent")
print("\nYT_CLIENT_ID     =", c.client_id)
print("YT_CLIENT_SECRET =", c.client_secret)
print("YT_REFRESH_TOKEN =", c.refresh_token)
