let allRows = [];

async function fileToLines(file) {
  return new Promise((resolve, reject) => {
    reader = new FileReader();
    reader.onload = function (e) {
      parsedLines = e.target.result.split(/\r|\n|\r\n/);
      resolve(parsedLines);
    };
    reader.readAsText(file);
  });
}

document
  .getElementById('fileInput')
  .addEventListener('change', async function (e) {
    var file = e.target.files[0];

    if (file != undefined) {
      fileToLines(file).then(async id => {
        console.log(id)
        console.log(parsedLines)
        console.log(typeof id);

        var idInt = id.map(Number);
        var idFiltered = id.filter(function (v) { return v !== '' });

        console.log(idFiltered)

        if (file != undefined) {
          allRows = [];
        }

        for (let id of idFiltered) {
          const row = await getRelease(id);
          allRows.push(row);
        }
        download();
      });
    }
  });

  function debounce(inner, ms = 0) {
    let timer = null;
    let resolves = [];
  
    return function (...args) {
      // Run the function after a certain amount of time
      clearTimeout(timer);
      timer = setTimeout(() => {
        /* Get the result of the inner function, then apply it to the resolve function of
        each promise that has been created since the last time the inner function was run */
        let result = inner(...args);
        resolves.forEach(r => r(result));
        resolves = [];
      }, ms);
  
      return new Promise(r => resolves.push(r));
    };
  }
  
  const throttleFetch = debounce(fetch, 2500);

function getRelease(idFiltered) {
  return throttleFetch(`https://api.discogs.com/releases/${idFiltered}`, {
    headers: {
      'User-Agent': 'Dispodger/0.1',
      'Authorization': 'Discogs key=dANvHNaHmlAtGVZVZPhq, secret=KOuEKidlWuHjlsNKPBHJOrseESdNJqhW',
    },
  }).then(response => response.json())
    .then(data => {
      if (data.message === 'Release not found.') {
        return { error: `Release with ID ${idFiltered} does not exist` };
      } else {
        const id = data.id;
        const delimiter = document.getElementById("delimiter").value || "|";
        const artists = data.artists ? data.artists.map(artist => artist.name) : [];
        const barcode = data.identifiers.filter(id => id.type === 'Barcode')
          .map(barcode => barcode.value);
        var formattedBarcode = barcode.join(delimiter);
        const country = data.country || 'Unknown';
        const genres = data.genres || [];
        const formattedGenres = genres.join(delimiter);
        const labels = data.labels ? data.labels.map(label => label.name) : [];
        const formattedLabels = labels.join(delimiter);
        const catno = data.labels ? data.labels.map(catno => catno.catno) : [];
        const formattedCatNo = catno.join(delimiter);
        const styles = data.styles || [];
        const formattedStyles = styles.join(delimiter);
        const tracklist = data.tracklist ? data.tracklist
          .map(track => track.title) : [];
        const formattedTracklist = tracklist.join(delimiter);
        const year = data.year || 'Unknown';
        const format = data.formats ? data.formats.map(format => format.name) : [];
        const qty = data.formats ? data.formats.map(format => format.qty) : [];
        const descriptions = data.formats ? data.formats
          .map(descriptions => descriptions.descriptions) : [];
        const preformattedDescriptions = descriptions.toString()
          .replace('"', '""').replace(/,/g, ', ');
        const formattedDescriptions = '"' + preformattedDescriptions + '"';
        console.log(idFiltered,
          artists,
          format,
          qty,
          formattedDescriptions,
          formattedLabels,
          formattedCatNo,
          country,
          year,
          formattedGenres,
          formattedStyles,
          formattedBarcode,
          formattedTracklist
        )

        return [idFiltered,
          artists,
          format,
          qty,
          formattedDescriptions,
          formattedLabels,
          formattedCatNo,
          country,
          year,
          formattedGenres,
          formattedStyles,
          formattedBarcode,
          formattedTracklist
        ];
      }
    });
}

function download() {
  const ROW_NAMES = [
    "release_id",
    "artist",
    "format",
    "qty",
    "format descriptions",
    "label",
    "catno",
    "country",
    "year",
    "genres",
    "styles",
    "barcode",
    "tracklist"
  ];
  var csvContent = "data:text/csv;charset=utf-8,"
    + ROW_NAMES + "\n" + allRows.map(e => e.join(",")).join("\n");

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link); // Required for Firefox
  link.click();
}
