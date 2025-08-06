console.log("Let's write JS")
let currentSong = new Audio();
let songs;
let currFolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)  // waiting for fetching the songs 
    // let a = await fetch(`/${folder}/`)  // waiting for fetching the songs 
    let response = await a.text()  // Waiting for the fetched songs to be oparesed and converted to HTML text
    // console.log(response);
    let div = document.createElement("div")// Creating a new elememnt 
    div.innerHTML = response;  // Inserting the songs which are in HTML 
    let as = div.getElementsByTagName("a") //  Getting the tag <a> which contains the "href" of the songs
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // songs.push(element.href)
            songs.push(element.href.split("/128-")[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Zishan</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div>
         </li>`;
    }

    // Attach an event listerner to each song 
    // We have coverted it to an array since "document." will return a collection here on which for each loop is not applicable
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
}

// getSongs()

const playMusic = (track, pause = false) => {
    currentSong.pause();
    // let audio = new Audio("/songs//128-" + track)
    // console.log(currentSong.src)
    // currentSong.src = `/${currFolder}//128-` + track
    // currentSong.src = `/${currFolder}/` + track
    currentSong.src = `/${currFolder}/128-${track}`
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    // let a = await fetch(`/songs/`)
    let response = await a.text();    
    let div = document.createElement("div")
    div.innerHTML = response;    
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors.innerHTML);
    
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    // console.log(array);
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(e);     
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            // let a = await fetch(`${folder}/info.json`)            
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://
www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" fill="#000"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img width="50px" height="250px" src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // Load the playlist whenever a card is clicked 
    // IMP NOTE : "item.target" this will give the HTML on which we have click 
    //            "item.currentTarget" will give the element on which the click event is applied 
    //             for example since here the click event is applied on card so wherever we click on the card it will return the current target as card and not as any element of the card like image or para or <h1>
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}

async function main()   // Since a promise is returned so to access that we have to create an async function
{

    // Get the list of all the songs 
    // let songs = await getSongs("songs/abc1")
    // await getSongs("songs/abc1")
    await getSongs("songs/abc1")
    // console.log(songs)

    // playMusic(currFolder, true)
    playMusic(songs[0], true)

    // Display all the albums on the page
    await displayAlbums()

    // Attach a evenlisterner to each play, previous and next
    play.addEventListener("click", () => {    // Since play button is an id so we can directly make changes here
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })


    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Add and event listener to the seekbar

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        console.log(e.target.getBoundingClientRect().width, e.offsetX);
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listenner for the close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to prevoius 
    previous.addEventListener("click", () => {
        // console.log("Previous clicked");
        // console.log(songs);

        // console.log(currentSong.src.split("128-").splice(-1)[0]);
        let index = songs.indexOf(currentSong.src.split("128-").slice(-1)[0])
        if (index - 1 > 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next 
    next.addEventListener("click", () => {
        // console.log("Nextt clicked");
        // console.log(songs);

        // console.log(currentSong.src.split("128-").splice(-1)[0]);
        let index = songs.indexOf(currentSong.src.split("128-").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to ", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
    })

}

main()


/*

NOTES: 
What .src does:
.src is a property of media elements like:
<audio> and <video> for playback
<img> for images
<iframe> for embedded content

In your case:
let currentSong = new Audio();
currentSong.src = "/songs/128-trackname.mp3";
Here's what happens:
.src sets the source URL of the audio element.
This tells the browser: “Here’s the location of the media file to load.”
The browser begins loading the audio file from that location (if it's valid).
If it's a relative path like /songs/128-trackname.mp3, the browser resolves it to:
http://127.0.0.1:3000/songs/128-trackname.mp3
assuming your webpage was served from http://127.0.0.1:3000/.

After setting .src, you usually follow with:
currentSong.play();
which attempts to start playback of the loaded audio file.

Analogy:
Think of .src like setting the filename/path in a media player.
When you say audio.src = "/songs/128-track.mp3", it’s like inserting a CD or selecting a file to play — you're telling the browser where to find the media.

Why it's important:
If .src is wrong or doesn't resolve to a valid audio file, nothing will play.
You can change .src dynamically to switch songs or media.

Bonus Tip:
You can check what .src resolves to by logging it:
console.log(currentSong.src);
It will output the full resolved URL — for example:
http://127.0.0.1:3000/songs/128-trackname.mp3
That confirms what the browser is trying to fetch.

To set the volume of an <audio> element in JavaScript, use the .volume property.

Syntax:
audioElement.volume = value;
Where:
value is a number between 0.0 and 1.0:

0.0 = Muted

1.0 = Full volume

Example: 0.5 = 50% volume

*/