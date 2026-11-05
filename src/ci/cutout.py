#!/usr/bin/env python3
"""cutout.py <in> <out.png>: remove the photo background (rembg, person model) and crop to the subject.
Exit 0 = good cut-out written. Non-zero = unusable (rembg missing, model download blocked, or the mask is implausible); the caller then uses the plain photo."""
import sys
try:
    from rembg import remove, new_session
    from PIL import Image
    im = Image.open(sys.argv[1]).convert('RGB')
    im.thumbnail((1400, 1400))
    out = remove(im, session=new_session('u2net_human_seg'))
    a = out.getchannel('A')
    cov = sum(1 for p in a.getdata() if p > 128) / (a.width * a.height)
    if not 0.08 < cov < 0.92:  # nothing found, or everything kept: the model failed on this image
        sys.exit(3)
    out.crop(out.getbbox()).save(sys.argv[2])
except SystemExit:
    raise
except Exception as e:
    print('cutout skipped:', str(e)[:200]); sys.exit(2)
