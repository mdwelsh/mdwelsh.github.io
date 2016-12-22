#!/usr/bin/python

import os
import re
import sys
from gmusicapi import Mobileclient
from gmusicapi import Musicmanager

# Edit the following lines to match the account name and password
# for the destination account.
ACCOUNT = 'somebody@somewhere.com'
PASSWORD = 'yourpassword'

# Edit the following line.
DOWNLOAD_DIR = '/tmp/somedir'  # Create this directory first!

# Force stdout to UTF-8 encoding
reload(sys)  
sys.setdefaultencoding('utf8')

class Song:
  def __init__(self, artist, album, title, track, orig):
    self.artist = artist
    self.album = album
    self.title = title
    self.track = track
    self.orig = orig
    self.pattern = re.compile(r'[^a-z]+')

  def key(self):
    return re.sub(self.pattern, '', self.artist.lower()) + u':' + re.sub(self.pattern, '', self.album.lower()) + u':%d' % self.track

  def match(self, other):
    if re.sub(self.pattern, '', self.artist.lower()) != re.sub(self.pattern, '', other.artist.lower()):
      return False
    if re.sub(self.pattern, '', self.album.lower()) != re.sub(self.pattern, '', other.album.lower()):
      return False
    if self.track != other.track:
      return False
    return True

  def __unicode__(self):
    artist = self.artist.encode('utf-8')
    album = self.album.encode('utf-8')
    title = self.title.encode('utf-8')
    t = u' (%d)' % self.track
    track = t.encode('utf-8')
    return artist + u' / ' + album + u' / ' + title + track

print >> sys.stderr, 'Logging in...'
api = Mobileclient()
logged_in = api.login(ACCOUNT, PASSWORD, Mobileclient.FROM_MAC_ADDRESS)
if not logged_in:
  print >> sys.stderr, 'Error: Could not login'
  exit()
print >> sys.stderr, 'Login done'

print >> sys.stderr, 'Logging in Musicmanager'
mm = Musicmanager()
mm.login()

all_account_songs = api.get_all_songs()
print >> sys.stderr, 'Account has %d songs total' % len(all_account_songs)

account_songs = {}
for song in all_account_songs:
  s = Song(song[u'artist'], song[u'album'], song[u'title'], song[u'trackNumber'], song)
  account_songs[s.key()] = s

all_uploaded_songs = mm.get_uploaded_songs()
print >> sys.stderr, 'Uploads has %d songs total' % len(all_uploaded_songs)
uploaded_songs = {}
for song in all_uploaded_songs:
  s = Song(song[u'artist'], song[u'album'], song[u'title'], song[u'track_number'], song)
  uploaded_songs[s.key()] = s

uploads_unmatched = set()
in_both = 0
not_in_account = 0

for uploaded_song in uploaded_songs.keys():
  found = False
  if uploaded_song in account_songs:
    in_both += 1
    found = True
  else:
    uploads_unmatched.add(uploaded_songs[uploaded_song])
    not_in_account += 1

print >> sys.stderr, '%d songs found in uploads and account' % in_both
print >> sys.stderr, '%d songs found in uploads but not account' % not_in_account

missing_albums = {}
for song in uploads_unmatched:
  album = unicode(song.artist + u' / ' + song.album)
  if album not in missing_albums:
    missing_albums[album] = set()
  missing_albums[album].add(song)

print >> sys.stderr, '%d albums missing from account' % len(missing_albums)

albums = missing_albums.keys()
albums.sort()

for album in albums:
  songs = missing_albums[album]
  print u'Unmatched album from uploads: ' + album + u' (%d songs)' % len(songs)
  for song in songs:
    print u'  ' + song.__unicode__().encode('utf-8')
  print '\n'

# Download missing songs

print >> sys.stderr, 'Downloading %d songs to %s...' % (len(uploads_unmatched), DOWNLOAD_DIR)

for idx, song in enumerate(uploads_unmatched):
  sys.stderr.write('Song %d/%d...\r' % (idx, len(uploads_unmatched)))
  if u'id' not in song.orig:
    print >> sys.stderr, 'Song does not have id field: %s' % song
  try:
    id = song.orig[u'id']
    filename = os.path.join(DOWNLOAD_DIR, id + '.mp3')
    if os.path.exists(filename):
      print >> sys.stderr, u'Downloading %s (for %s) but file already exists' % (id, song.__unicode__())
    else:
      _, audio = mm.download_song(id)
      with open(filename, 'wb') as f:
        f.write(audio)
  except Exception as e:
    print >> sys.stderr, 'Exception downloading song %s: %s' % (song, e)

print >> sys.stderr, 'Done.'
