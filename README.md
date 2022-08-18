Dispodger is intended the following:

- take as input a .csv file, the first column of which contains valid discogs release IDs
- return as output the same .csv file, with data for the following columns included:

- release_id
- artist
- format
- qty
- format descriptions
- label
- catno
- country
- year
- genres
- styles
- barcode
- tracklist

It is not fully functional as yet, as discogs server is returing '429 - too many requests' errors due to exceeding their rate limit of 60 requests per minute.

