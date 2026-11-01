"""python src/ci/test_photos.py : offline test with canned API answers (no network)."""
import json, os, pathlib, subprocess, sys, tempfile
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import photos as P

assert P.license_ok('Public domain')[0] and P.license_ok('CC0')[0] and P.license_ok('PD-old-100')[0]
assert P.license_ok('CC BY 4.0') == (True, True) and P.license_ok('CC BY-SA 3.0')[0] is False and P.license_ok('CC BY-SA 3.0', True)[0]
assert not P.license_ok('CC BY-NC 2.0')[0] and not P.license_ok('CC BY-ND 4.0')[0] and not P.license_ok('Fair use')[0] and not P.license_ok('')[0]

tmp = pathlib.Path(tempfile.mkdtemp()); os.chdir(tmp)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc=s=2400x1600', '-frames:v', '1', 'big.png'], check=True)  # fixture picture, test only
RAW = (tmp / 'big.png').read_bytes()
def page(i, title, lic, w=2400, mime='image/jpeg', nonfree=''):
    return {'title': 'File:' + title, 'index': i, 'imageinfo': [{'url': 'http://x/' + title, 'thumburl': 'http://x/t/' + title, 'width': w, 'mime': mime, 'descriptionurl': 'http://c/' + title,
            'extmetadata': {'LicenseShortName': {'value': lic}, 'Artist': {'value': '<a href="x">Jane <b>Doe</b></a>'}, 'ObjectName': {'value': title}, 'NonFree': {'value': nonfree}}}]}
SEARCH = {'query': {'pages': {'1': page(1, 'A.jpg', 'CC BY-NC 2.0'), '2': page(2, 'B.jpg', 'CC BY-SA 3.0'), '3': page(3, 'C.jpg', 'CC BY 4.0', w=500), '4': page(4, 'D.svg', 'CC0', mime='image/svg+xml'), '5': page(5, 'E.jpg', 'CC BY 4.0'), '6': page(6, 'F.jpg', 'Public domain')}}}
DIRECT = {'query': {'pages': {'9': page(1, 'Caesar.jpg', 'Public domain')}}}
OV = {'results': [{'title': 'Map', 'creator': 'Ann', 'license': 'by', 'license_version': '4.0', 'foreign_landing_url': 'http://o/1', 'url': 'http://o/img', 'width': 3000}]}
def fake_json(url):
    if 'openverse' in url: return OV
    return DIRECT if 'titles=' in url else SEARCH
P.get_json = fake_json; P.get = lambda url, tries=3: RAW

pathlib.Path('out').mkdir()
json.dump({'title': 't', 'description': 'About Rome.\n\n{{CHAPTERS}}'}, open('out/seo.json', 'w')); open('out/description.txt', 'w').write('x')
json.dump([{'id': 'caesar', 'file': 'Caesar.jpg'}, {'id': 'forum', 'q': 'Roman Forum'}, {'id': 'map', 'q': 'gaul', 'provider': 'openverse'}], open('photos.json', 'w'))
assert P.run() == 0
cr = json.load(open('public/photos/credits.json'))
assert cr['forum']['title'] == 'E.jpg', 'skips NC, SA, too small, svg; takes first CC BY: ' + cr['forum']['title']
assert cr['forum']['artist'] == 'Jane Doe' and cr['caesar']['attribution'] is False and cr['map']['attribution'] is True
assert all((tmp / f'public/photos/{k}.jpg').stat().st_size > 5000 for k in cr)
w = int(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width', '-of', 'csv=p=0', 'public/photos/forum.jpg'], capture_output=True, text=True).stdout.split()[0])
assert w == 1920, w
d = json.load(open('out/seo.json'))['description']
assert 'Image credits:' in d and 'E.jpg by Jane Doe (CC BY 4.0)' in d, d       # attribution appended automatically
assert 'E.jpg' in open('out/photos-credits.txt').read() and open('out/description.txt').read() == d

# a photo with only bad licences must fail the run (before any render minutes are spent)
P.get_json = lambda u: {'query': {'pages': {'1': page(1, 'Z.jpg', 'CC BY-NC 2.0')}}}
json.dump([{'id': 'bad', 'q': 'x'}], open('photos.json', 'w'))
assert P.run() == 1
print('OK')
