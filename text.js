document.getElementById("searchBox")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("btnSearch").click();
    }
});

document.getElementById('btnSearch').onclick = function() {
const searchDetails =
document.getElementById('searchBox').value;
console.log(searchDetails);
const request = new XMLHttpRequest();
request.open('GET',
`https://api.discogs.com/releases/${searchDetails}`);
 request.send();

    request.addEventListener('readystatechange', (e) => {
    if (e.target.readyState === 4) {
        const data = JSON.parse(e.target.response);
        if (data.message === 'Release not found.') {
            alert('ID number does not exist');
        } else {
            console.log(data);
            const id = data.id;
            const artist = data.artists[0].name;
            const country = data.country;
            const released = data.released_formatted;
            const genres = data.genres[0];
            const styles = data.styles[0];
            let tracklist ='';
            if (data.tracklist.length > 1) {
                data.tracklist.forEach(
                    (track) => {
                        tracklist += `${track.title}, `
                    }
                )
            } else {
                tracklist = data.tracklist;
            }

            let htmlString =`<tr>
            <td>${id}</td>
            <td>${artist}</td>
            <td>${country}</td>
            <td>${released}</td>
            <td>${genres}</td>
            <td>${styles}</td>
            <td>${tracklist}</td>
            </tr>`

            document.getElementById('tableRow').innerHTML =
 htmlString;

        }
    }
})

}
