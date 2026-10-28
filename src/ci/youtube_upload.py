"""Upload final video + captions to YouTube (Data API v3). Usage: youtube_upload.py video.mp4 seo.json captions.srt
Secrets (env): YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.  Optional: YT_PRIVACY (private|unlisted|public, default private),
YT_SYNTHETIC (true|false, default true: tells YouTube the voice is synthetic).
NOTE: videos uploaded through an unaudited API project are forced to private by YouTube; publish from Studio, or pass the API compliance audit."""
import json
import os
import sys

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

video, seo_path, srt = sys.argv[1:4]
seo = json.load(open(seo_path, encoding="utf-8"))
creds = Credentials(None, refresh_token=os.environ["YT_REFRESH_TOKEN"], token_uri="https://oauth2.googleapis.com/token",
                    client_id=os.environ["YT_CLIENT_ID"], client_secret=os.environ["YT_CLIENT_SECRET"],
                    scopes=["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"])
creds.refresh(Request())
yt = build("youtube", "v3", credentials=creds, cache_discovery=False)

tags, total = [], 0
for t in seo.get("tags", []):  # YouTube limit: about 500 characters across all tags
    if total + len(t) + 1 > 480:
        break
    tags.append(t); total += len(t) + 1
body = {
    "snippet": {"title": seo["title"][:100], "description": seo["description"][:4900], "tags": tags,
                "categoryId": str(seo.get("categoryId", "27")), "defaultLanguage": "en", "defaultAudioLanguage": "en"},
    "status": {"privacyStatus": os.environ.get("YT_PRIVACY", "private"), "selfDeclaredMadeForKids": False,
               "containsSyntheticMedia": os.environ.get("YT_SYNTHETIC", "true").lower() == "true"},
}


def insert(b):
    req = yt.videos().insert(part="snippet,status", body=b, media_body=MediaFileUpload(video, chunksize=64 * 1024 * 1024, resumable=True))
    resp = None
    while resp is None:
        st, resp = req.next_chunk()
        if st:
            print(f"upload {int(st.progress() * 100)}%", flush=True)
    return resp


try:
    resp = insert(body)
except HttpError as e:
    if "containsSyntheticMedia" in str(e):  # older API surface: retry without the flag
        body["status"].pop("containsSyntheticMedia")
        resp = insert(body)
    else:
        raise
vid = resp["id"]
print("video id", vid, "privacy", body["status"]["privacyStatus"])
yt.captions().insert(part="snippet", body={"snippet": {"videoId": vid, "language": "en", "name": "English", "isDraft": False}},
                     media_body=MediaFileUpload(srt, mimetype="application/octet-stream")).execute()
print("captions uploaded")
json.dump({"id": vid, "url": f"https://youtu.be/{vid}"}, open("out/youtube.json", "w"))
