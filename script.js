console.log("Let's Start Javascript");
let currentsong = new Audio();
let songs;
let currfolder;

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
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> <img class="invert" src="music.svg" alt="">
    <div class="info">
        <div> ${song.replaceAll("%20", " ")} </div>
        <div>Sushant VAjpayee</div>
    </div>
    <div class="playnow">
        <span>Play now</span>
    <img class="invert" src="play.svg" alt="" >
</div> </li>`;


    }
    //  Attatch  an event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        //console.log(e)
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })
}
const playMusic = (track, pause = false) => {
    // let audio=new Audio("/songs/" +track)
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg";
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00.00 / 00.00"
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors)
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            // console.log(e.href)
            let folder = e.href.split("/").slice(-1)[0]

            //get the metadata of each folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="ncs" class="card">
           <div class="play">
               <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                   <circle cx="25" cy="25" r="25" fill="#00FF00" />
                   <g transform="translate(14, 12)">
                       <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5"
                           stroke-linejoin="round" />
                   </g>
               </svg>
           </div>
           <img src="/songs/${folder}/cover.jpg" alt="img">
           <h2>${response.title}</h2>
           <p> ${response.description}</p>
       </div> `

        }
    }
    //Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })

}

async function main() {

    //get list of all the songs 
    await getSongs("songs/ncs");
    playMusic(songs[0], true)


    //Display all the albums in the page
    displayAlbum();

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })

    // Listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })



    //Add eventlistener to seek baar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;

    })


    //Add a event listner to humburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add a event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "120%";
    })


    //Add an event listner to previous
    previous.addEventListener("click", () => {
        console.log("previous click");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    //Add an event listner to next
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("next click");

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })


    //Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to ", e.target.value, "/100");
        currentsong.volume = parseInt(e.target.value) / 100;
    })



    //Load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

        })
    })


}

main();
