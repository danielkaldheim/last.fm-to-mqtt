const startWebsocket = () => {
  const ws = new WebSocket('ws://localhost:8999');
  ws.onopen = () => {
      console.log('ws open');
  };

  ws.onmessage = (message) => {
    const content = JSON.parse(message.data);
    console.log(content);

    const trackName = document.getElementById('trackName');
    if (trackName) {
      trackName.innerHTML = content.track;
    }
    const trackArtist = document.getElementById('trackArtist');
    if (trackArtist) {
      trackArtist.innerHTML = content.artist;
    }
    const trackAlbum = document.getElementById('trackAlbum');
    if (trackAlbum) {
      trackAlbum.innerHTML = content.album;
    }

    const imageWrapper = document.getElementById('imageWrapper');
    if (imageWrapper) {
      imageWrapper.style.backgroundImage = `url(${content.image})`;
    }
    const trackImage = document.getElementById('trackImage');
    if (trackImage) {
      trackImage.style.backgroundImage = `url(${content.image})`;
    }
  };

  ws.onclose = () => {
    console.log('ws closed');
    setTimeout(startWebsocket, 5000);
  };
};

startWebsocket();
