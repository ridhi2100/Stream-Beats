
let currentSong= new Audio(); //Creating an Audio Object for Playback
let songs;
let currFolder;

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
    currFolder = folder;
    let response = await fetch(`/${folder}/songs.json`);
    
    if (!response.ok) {
        console.error(`Failed to fetch songs.json from ${folder}:`, response.statusText);
        return [];
    }

    songs = await response.json();
    return songs;
}


const playMusic= (track, pause=false) => {
    currentSong.src = `${currFolder}/` + track
    currentSong.play()
    document.querySelector(".songinfo").innerHTML=decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00 / 00:00";
} 

async function main(){

//get the songs
songs = await getSongs("songs/first")
playMusic(songs[0],true)

//show all the songs in playlist
let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
songUL.innerHTML=""
for (const song of songs)
{
    songUL.innerHTML = songUL.innerHTML + `<li><img src="./music.svg">
                    <div class="info">
                        <div> ${song.replaceAll("%20", " ")} 
                        </div>
                        <div>Song Artist</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                    <img src="./play.svg">
                </div> </li>`;
}
 //attach an event listener to every song
 Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click",element=> {
        console.log(e.querySelector(".info").firstElementChild.innerHTML)
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        
    })
 })

 async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}

 //attach an event listener to play,next and previous
 play.addEventListener("click", ()=>{
    if(currentSong.paused){
        currentSong.play()
        play.src = "pause.svg"
    }
    else{
        currentSong.pause()
        play.src = "play.svg"
    }
 })
 //listen for timeupdate event
 currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
})

 //add event listener to seekbar
 document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
})
//add event listener for hamburger
document.querySelector(".hamburger").addEventListener("click", ()=>{
    document.querySelector(".left").style.left="0"
})
document.querySelector(".left").addEventListener("click", ()=>{
    document.querySelector(".left").style.left="-110%"
})
//event listener to next
next.addEventListener("click",()=>{
    currentSong.pause()
    console.log("next clicked");
   
    let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
    if((index+1) < songs.length-1){
        playMusic(songs[index + 1]);
    }
})

previous.addEventListener("click", () => {
    currentSong.pause()
    console.log("Previous clicked")
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
        playMusic(songs[index - 1])
    }
})
//event listener to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
(e)=>{  
console.log(e, e.target, e.target.value);
 currentSong.volume = parseInt(e.target.value)/100
 })

//Attaches an event listener that listens for a change event — which happens when the user moves the slider and releases it.      
//e – the whole event object  e.target – the element that triggered the event (the <input>)
//e.target.value – the new value of the input (probably between 0 and 100)
//parseInt(e.target.value) converts the slider value from string to number.
//Dividing by 100 makes it a number between 0 and 1 — which is how volume is typically set in JavaScript audio APIs (0 = mute, 1 = full volume).
 
//load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e => { 
    e.addEventListener("click", async item => {
        console.log("Fetching Songs")
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
        playMusic(songs[0])

    })
})
}

main()


