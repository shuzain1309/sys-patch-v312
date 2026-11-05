#!/usr/bin/env python3
"""thumb_set.py <thumb.jpg> <seo.json> : put the custom thumbnail on the video that was just uploaded. Never fails the run (exit 0 always).
Video id: out/video_id.txt if youtube_upload.py wrote it (best), else the newest upload on the channel with the same title.
YouTube only accepts custom thumbnails from a phone-verified channel; JPG/PNG up to 2 MB."""
import json, os, pathlib, sys


def main(jpg, seo_path, vid_path='out/video_id.txt'):
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    cred = Credentials(None, refresh_token=os.environ['YT_REFRESH_TOKEN'], token_uri='https://oauth2.googleapis.com/token',
                       client_id=os.environ['YT_CLIENT_ID'], client_secret=os.environ['YT_CLIENT_SECRET'])
    yt = build('youtube', 'v3', credentials=cred, cache_discovery=False)
    vp = pathlib.Path(vid_path)
    vid = vp.read_text().strip() if vp.exists() else ''
    if not vid:  # fallback lookup; needs a scope that can list the channel (an upload-only token cannot)
        title = json.loads(pathlib.Path(seo_path).read_text()).get('title', '')
        up = yt.channels().list(part='contentDetails', mine=True).execute()['items'][0]['contentDetails']['relatedPlaylists']['uploads']
        for it in yt.playlistItems().list(part='snippet', playlistId=up, maxResults=10).execute().get('items', []):
            if it['snippet']['title'] == title:
                vid = it['snippet']['resourceId']['videoId']; break
    if not vid:
        print('::warning::thumbnail not set: video id unknown. Make youtube_upload.py write the id to out/video_id.txt, or set thumb-A.jpg in Studio (it is in the Drive folder).')
        return
    yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(jpg, mimetype='image/jpeg')).execute()
    print('thumbnail set on', vid)


if __name__ == '__main__':
    try:
        main(*sys.argv[1:3])
    except Exception as e:  # unverified channel (403), missing scope, quota: tell, never stop the pipeline
        print('::warning::thumbnail not set: ' + str(e)[:300] + ' (the file is in the Drive folder; set it in Studio)')
