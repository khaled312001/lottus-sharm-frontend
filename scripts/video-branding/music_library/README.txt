MUSIC LIBRARY — put royalty-free tracks here
=============================================

Drop audio files (.mp3 / .wav / .m4a / .flac / .ogg) into this folder and the
auto-editor uses them automatically instead of the built-in synthesiser.

Recommended source — Pixabay (free, commercial use, no attribution required
under the Pixabay Content License):
    https://pixabay.com/music/search/tourism/

How to add tracks:
  1. Open the link, play tracks, and DOWNLOAD the ones you like
     (free account; click the Download button on each track's page).
  2. Save the downloaded files into THIS folder.
  3. (Optional) rename them so the order is what you want, e.g.
        01-beach-vibes.mp3, 02-desert-sunset.mp3, 03-happy-summer.mp3 ...

How tracks are chosen:
  - Each theme/video gets a track by its index (theme 0 -> 1st file,
    theme 1 -> 2nd file, ... wraps around), so a batch stays varied and
    repeatable.
  - The track is trimmed/looped to the video length and faded.
  - Force a specific source from the CLI:
        --music library            use this folder (default when filled)
        --music "path/to/song.mp3" use one exact file for the render
        --music travel             use the synthesised 'travel' genre
        --music synth              use the theme's synthesised genre

Tips:
  - Prefer upbeat, summery, "travel vlog" tracks for beach/sea clips and
    calmer/oriental tracks for desert clips.
  - Keep files reasonably loud/clean; the mixer normalises but won't fix a
    very quiet source.

Note: this folder's audio files are git-ignored (kept off the repo).
