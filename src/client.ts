import Track from './track.interface';
import { debounce } from 'ts-debounce';

const adjustImageSize = debounce(() => {
  const width = window.innerWidth;
  const padding = 40;
  const trackImage = document.getElementById('trackImage');
  if (trackImage) {
    trackImage.style.width = (width <= 500 ? width - padding : 500) + 'px';
    trackImage.style.height = (width <= 500 ? width - padding : 500) + 'px';
  }
  const infoBox = document.getElementById('infoBox');
  if (infoBox) {
    infoBox.style.width = (width <= 500 ? width - padding : 500) + 'px';
  }
}, 250);
adjustImageSize();

window.onresize = (event: any) => {
  adjustImageSize();
};

const setContent = (track: Track) => {
  const trackName = document.getElementById('trackName');
  const trackArtist = document.getElementById('trackArtist');
  const trackAlbum = document.getElementById('trackAlbum');
  const imageWrapper = document.getElementById('imageWrapper');
  const trackImage = document.getElementById('trackImage');

  if (track.nowPlaying) {
    if (trackName) {
      trackName.innerHTML = track.track;
    }

    if (trackArtist) {
      trackArtist.innerHTML = track.artist;
    }

    if (trackAlbum) {
      trackAlbum.innerHTML = track.album;
    }

    const imageUrl = `url(${track.image})`;
    if (imageWrapper) {
      imageWrapper.style.backgroundImage = imageUrl;
    }

    if (trackImage) {
      trackImage.style.backgroundImage = imageUrl;
    }
  } else {
    if (trackName) {
      trackName.innerHTML = '';
    }

    if (trackArtist) {
      trackArtist.innerHTML = 'Not playing <div class="blink_me">.</div>';
    }

    if (trackAlbum) {
      trackAlbum.innerHTML = '';
    }

    if (imageWrapper) {
      imageWrapper.style.backgroundImage = 'none';
    }

    if (trackImage) {
      trackImage.style.backgroundImage = 'none';
    }
  }
};

const startWebsocket = () => {
  const ws = new WebSocket(
    process.env.WS_URL ? process.env.WS_URL : 'ws://localhost:8080'
  );
  // ws.onopen = () => {
  //   console.log('ws open');
  // };

  ws.onmessage = (message) => {
    const track: Track = JSON.parse(message.data);
    setContent(track);
  };

  ws.onclose = () => {
    // console.log('ws closed');
    setTimeout(startWebsocket, 5000);
  };
};

startWebsocket();
