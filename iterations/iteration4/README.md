# Iteration 4 - Write files to the File System

Your task is to write selected MP3 files to the file system using HTML5 File System API

* Request file system access and persistent storage quota
* Change your initialization process to run only after FS access and quota are granted
* Add a function to write files when they're selected by the user
 * Create a file entry with a directory prefix
 * Ensure the file entry is marked for creation and as exclusive
 * Create a file writer for the file entry and use it to write the file