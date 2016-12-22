#!/usr/bin/python

from gmusicapi import Mobileclient

# Edit these variables to match the username and password for your
# destination account.
ACCOUNT = 'somebody@somewhere.com'
PASSWORD = 'yourpassword'

# Edit this to hold the playlist IDs for each playlist to import.
# (Remove the first two entries, which are given as examples.)
playlists = [
  # Remove the following two lines!
  u'AMaBXykkNj1OubkXQ3mkbPKY8vX6VvDNbh87nQKVpOMuPP_Vp8pWBNy2DZA3C97tiMDqX_pbS_aIi388wMxvw-BOdJdJi5mG9w==',
  u'AMaBXyksFBhOy64R79PgmhsfYu3fYBW5w4Z3AlHgBkKdCzjV7EO_HwpkbkdVSDvFUvvh-WOzTjvhYgy0u4Wx18kpQBV9zt4s0Q==',
]

print 'Logging in...'
api = Mobileclient()
logged_in = api.login(ACCOUNT, PASSWORD, Mobileclient.FROM_MAC_ADDRESS)
if not logged_in:
  print 'Error: Could not login'
  exit()
print 'Login done'

total = len(playlists)

for idx, pl in enumerate(playlists):
  print 'Fetching songs for playlist %d/%d...' % (idx, total)
  try:
    songs = api.get_shared_playlist_contents(pl)
  except:
    print 'Exception fetching contents'
  trackids = []
  for song in songs:
    trackids.append(song['trackId'])
  try:
    print 'Adding %d tracks...' % len(trackids)
    api.add_store_tracks(trackids)
    print 'Done'
  except:
    print 'Exception adding songs'
