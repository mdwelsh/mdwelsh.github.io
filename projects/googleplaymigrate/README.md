# HOWTO: Migrating Google Play Music to a new account
Matt Welsh (mdw@mdw.la), 21 December 2016

This page describes how to migrate your Google Play Music subscription to a new account, using the wonderful
[gmusicapi](https://github.com/simon-weber/gmusicapi) library.

Note that there is an existing tool to do this, called [gmusic-migrate](https://github.com/brettcoburn/gmusic-migrate).
This tool does not work for me, because the account I am migrating from -- a Google "Corp" account -- requires
two-factor authentication, and as such, cannot be directly accessed by that tool. If you don't have this problem,
you're in luck -- just use that tool instead, and you'll be done.

In my case, the 2FA requirement on my "source" account requires that I do a fair bit of work, manually, to migrate
the account data. Roughly, the steps are as follows:

1. Disable 2FA on the destination account. (It is not possible, in my case, to disable 2FA on the source account.)
1. Create a set of playlists in the source account (with no more than 1000 songs each) for all of the music you want to export.
1. Ensure all of those playlists are made public, and get the public URLs for them.
1. Use a Python script (based on the `gmusicapi` library) to add the tracks from those playlists to the destination account.
1. Use another Python script (also based on the `gmusicapi` library) to download all of the missing tracks from the source
account. (Unfortunately, the playlists created in the above step don't include tracks that were added outside of the All Access
subscription.)
1. Use the [Google Play Music Music Manager App](https://play.google.com/music/listen?u=0#/manager) to upload the missing
tracks into the destination account.

These steps are described in more detail below.

## Setup

In my setup, I have a **source** account (my Google "Corp" account, associated with my work email address),
and a **destination** account (which is a personal account). Both accounts have Google Play Music All Access subscriptions.

As described above, the source account **requires 2FA**, which is what makes this process so difficult. (If I could just
disable 2FA on my source account, I'd use the [gmusic-migrate](https://github.com/brettcoburn/gmusic-migrate) tool and be
done with it.)

The destination account, however, does not require 2FA -- so I disabled it temporarily while performing the migration.

For this process to work, you need to install the `gmusicapi` python library. On my machine, this required first installing
`pip`:
```
curl https://bootstrap.pypa.io/get-pip.py > get-pip.py
sudo python get-pip.py
```
and then running:
```
pip install --user gmusicapi
```

You then want to do a one-time OAuth authentication to your **source** account, so the `gmusicapi` has your login credentials
saved. Run `python` and type:
```
from gmusicapi import Musicmanager
mm = Musicmanager()
mm.perform_oauth()
```
This will display a URL. Open the URL in a web browser and login to your **source** account. Then, copy and paste the string
shown on the web page back into the Python session. Subsequent invocations of the `gmusicapi` calls will remember your
source account credentials so this extra step won't be necessary.

## Creating playlists

The idea here is to create a set of playlists in the source account covering all of the music that you wish to migrate.
However, Google Play Music limits each playlist to 1000 songs, so if you are migrating more than this, you will need to
create multiple playlists. The playlists are made public, and then used to import the tracks into the destination account.

The main caveat is that **public playlists only include songs available via your All Access subscription**.
That means that any music that you have added manually to your Google Play Music account -- e.g., by uploading MP3 files --
will not necessarily be included in the resulting playlists. In a later step we'll download those files and re-upload
them to the destination account.

I performed this step manually. However, it is possible to automate this: The `gmusicapi` library has functions to
list all songs in your account, and generate playlists -- so one could write a script to do this automatically.

In my case, I opened up my music library (using the web interface) in the source account, and listed all of the songs
in the account. I then, by hand, highlighted ~1000 songs at a time, and created a new playlist from those songs.
I named the playlists "Playlist 1", "Playlist 2", etc. In my case, my library had more than 19,000 songs, so I ended up
with 21 such playlists. I noted the number of songs in each playlist, just to make sure I could verify later that everything
added up correctly.

You then need to "share" each playlist. On the playlist screen in your music library, click on the three-dots menu and select
"Share" in the popup menu. A dialog box will appear. Toggle the "Make public" switch, and copy the URL provided.
Each playlist will have a public URL like this:
```
https://play.google.com/music/playlist/AMaBXykkNj1OubkXQ3mkbPKY8vX6VvDNbh87nQKVpOMuPP_Vp8pWBNy2DZA3C97tiMDqX_pbS_aIi388wMxvw-BOdJdJi5mG9w==
```
The string starting with `AM` after the `/playlist/` portion of the URL is the **playlist ID**. Write these down.

## Add tracks from the playlists to the destination account

For this step, I wrote a script based on the `gmusicapi` library that reads the tracks from each of the public playlists
and adds them to the destination account. Each playlist has around 1000 songs, and takes 10-20 seconds to add to the new
account, so this completes in a matter of minutes.

Here is the script: [add_playlists.py](add_playlists.py)

**You need to edit this script** and change the following:

1. Edit the ACCOUNT and PASSWORD variables at the top to match the email address and password for your **destination** account.
1. Edit the `playlists` variable at the top to list the playlist IDs you generated in the previous step. For example,
```
playlists = [
  u'AMaBXykkNj1OubkXQ3mkbPKY8vX6VvDNbh87nQKVpOMuPP_Vp8pWBNy2DZA3C97tiMDqX_pbS_aIi388wMxvw-BOdJdJi5mG9w==',
  u'AMaBXyksFBhOy64R79PgmhsfYu3fYBW5w4Z3AlHgBkKdCzjV7EO_HwpkbkdVSDvFUvvh-WOzTjvhYgy0u4Wx18kpQBV9zt4s0Q==',
```
(If you don't edit this variable, you will end up adding my playlists to your account -- hope you like my taste in music!)

Then run the script. This should add all of the public tracks from your playlists to the destination account.

**Note** -- It may take some time after this script completes for all of the music to be shown in the destination account.
I recommend waiting an hour or so after this completes just to let things settle down.

As described above, **not all of your music will be imported after this step**, if you have any music which was uploaded
directly. So don't be surprised if the track count in the destination account does not match that in the source account.

## Downloading missing tracks

This step is a little crude, and could probably use some improvement. But, it mostly worked for me.

The idea here is to find all of the MP3 files in the source account that are *not* in the destination account, 
download them from the source account, and then re-upload them to the destination account.

The problem is that the set of downloadable MP3 files from the source account overlaps substantially with the set of
tracks that can be imported "directly" via playlists, as we did above. To avoid downloading and re-uploading too many
MP3 files, we need to match the downloadable MP3 files against the tracks already in the destination account. Unfortunately,
the metadata exposed by Google Play Music for MP3 files does not always match the metadata associated with the track
in the Play Music account itself. As a result, we need to do some "fuzzy matching" of each track's artist, album, 
song title, etc. to avoid too many false negatives.

My approach is kind of crude, but worked well enough for me. I take the track artist and album title, convert them to
lowercase, and remove all characters not in the range `[a-z]`. I then append the track number (**not** the track title).
Comparing this way, I get reasonable accuracy -- there are some duplicates, but not too many. My assumption is that any
duplicates will be automatically pruned by Google Play Music when I re-upload the tracks, so it's not important that this
matching is perfect.

A lot of the mismatches come from things like subtle changes to punctuation in the album name, misspellings,
`Bjork` vs `Björk` and so forth.

Here is the script: [find_missing.py](find_missing.py)

Again, **you need to edit this script**, and change the following:
1. Edit the `ACCOUNT` and `PASSWORD` variables to match your destination account.
1. Edit the `DOWNLOAD_DIR` variable to that of a directory where the MP3 files will be downloaded. Make sure you create
this directory first.

Once you've done this, you can run the script. It will print a lot of stuff about what it finds (you might want to save the output
somewhere) and then download all of the missing MP3 files from the source account. This script does **not** upload anything
to the destination account.

## Uploading the missing tracks to the destination account

Finally, you can run the [Google Play Music Music Manager App](https://play.google.com/music/listen?u=0#/manager)
to upload the MP3 files downloaded in the previous step to the destination account. Just download and install
the Music Manager app, run it, login to the **destination** account, and follow the prompts. Tell it to upload
the MP3 files from the directory you chose for `DOWNLOAD_DIR` in the previous step.

With luck, your destination account should now have most, if not all, of the music from your source account. However,
it seems likely that some tracks may have fallen through the cracks. Unfortunately, there is no way to get a complete
list of tracks from the source account when 2FA is enabled. Your best bet may be to manually spot-check the missing
music by opening two windows side-by-side and looking at the list of songs/albums in each account and seeing what's missing.
Hopefully it's not too much, and you can add the missing music back by hand.

Hope this guide was useful. If you have suggestions for improvement, please feel free to email me at mdw@mdw.la or send
a pull request on this guide. Good luck!
