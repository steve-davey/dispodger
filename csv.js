// import throttledQueue from 'throttled-queue';
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
        var idFiltered = id.filter(function (v) { return v !== '' });
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

function throttledQueue(maxRequestsPerInterval, interval, evenlySpaced) {
  if (evenlySpaced === void 0) { evenlySpaced = false; } // If all requests should be evenly spaced, adjust to suit.
  if (evenlySpaced) { interval = interval / maxRequestsPerInterval; maxRequestsPerInterval = 1; }
  var queue = [];
  var lastIntervalStart = 0;
  var numRequestsPerInterval = 0;
  var timeout; // Gets called at a set interval to remove items from the queue. This is a self-adjusting timer, since the browser's setTimeout is highly inaccurate.
  var dequeue = function () {
    var intervalEnd = lastIntervalStart + interval;
    var now = Date.now(); // Adjust the timer if it was called too early.
    if (now < intervalEnd) { 
      // eslint - disable - next - line @typescript-eslint / no - unsafe - argument timeout !== undefined && clearTimeout(timeout);
      timeout = setTimeout(dequeue, intervalEnd - now);
      return;
    }
    lastIntervalStart = now;
    numRequestsPerInterval = 0;
    for (var _i = 0, _a = queue.splice(0, maxRequestsPerInterval); _i < _a.length; _i++) {
      var callback = _a[_i]; numRequestsPerInterval++; void callback();
    }
    if (queue.length) {
      timeout = setTimeout(dequeue, interval);
    }
    else { timeout = undefined; }
  };
  return function (fn) {
    return new Promise(function (resolve, reject) {
      var callback = function () {
        return Promise.resolve().then(fn).then(resolve).catch(reject);
      };
      var now = Date.now(); 
      if (timeout === undefined && (now - lastIntervalStart) > interval) { lastIntervalStart = now; numRequestsPerInterval = 0; }
      if (numRequestsPerInterval++ < maxRequestsPerInterval) { void callback(); }
      else {
        queue.push(callback);
        if (timeout === undefined) { timeout = setTimeout(dequeue, lastIntervalStart + interval - now); }
      }
    });
  };
}

export { throttledQueue }

<script type="module"> import {throttledQueue} from './throttledQueue.js'; console.log(throttledQueue); </script> 

// const throttledQueue = require('throttled-queue');
const throttle = throttledQueue(1, 1000);

throttle(() => getRelease(idFiltered));

async function getRelease(idFiltered) {
  return fetch(`https://api.discogs.com/releases/${idFiltered}`, {
    headers: {
      'User-Agent': 'Dispodger/0.1',
      'Authorization': 'Discogs key=${{ secrets.KEY }}, secret=${{ secrets.SECRET }}',
    },
  }).then(response => response.json())
    .then(data => {
      if (data.message === 'Release not found.') {
        return { error: `Release with ID ${idFiltered} does not exist` };
      } else {
        const { country = 'Unknown', genres = [], styles = [], year = 'Unknown' } = data;
        const artists = data.artists?.map?.(artist => artist.name);
        const barcode = data.identifiers.filter(id => id.type === 'Barcode').map(barcode => barcode.value);
        const catno = data.labels.map(catno => catno.catno);
        const descriptions = data.formats.map(descriptions => descriptions.descriptions);
        const format = data.formats.map(format => format.name);
        const labels = data.labels.map(label => label.name);
        const qty = data.formats.map(format => format.qty);
        const tracklist = data.tracklist.map(track => track.title);
        const formattedLabels = labels.map(label => label.name);
        const delimiter = document.getElementById("delimiter").value ?? "|";
        const formattedBarcode = barcode.join(delimiter);
        const formattedCatNo = catno.join(delimiter);
        const formattedGenres = genres.join(delimiter);
        const formattedStyles = styles.join(delimiter);
        const formattedTracklist = tracklist.join(delimiter);
        const preformattedDescriptions = descriptions.toString()
          .replace('"', '""').replace(/,/g, ', ');
        const formattedDescriptions = '"' + preformattedDescriptions + '"';
        console.log(data);

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
  const csvContent = "data:text/csv;charset=utf-8,"
    + ROW_NAMES + "\n" + allRows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link); // Required for Firefox
  link.click();
}
