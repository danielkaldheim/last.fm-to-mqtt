require('dotenv').config();

const path = require('path');
import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { find, isEqual } from 'lodash';
import moment from 'moment';

import Track from './track.interface';

const LastFm = require('lastfm-node-client');

const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_SERVER, {
  clientId: 'lastfm-' + process.env.LASTFM_USER,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

const port = process.env.SERVER_PORT;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const lastFm = new LastFm(
  process.env.LASTFM_API_KEY,
  process.env.LASTFM_SECRET,
  process.env.LASTFM_SESSION_KEY
);

let trackmbid: string = '';
let track: Track | undefined = undefined;
setInterval(async () => {
  const data = await lastFm.userGetRecentTracks({
    user: process.env.LASTFM_USER,
    limit: 1,
  });
  const trackData = data.recenttracks.track[0];
  const nowPlaying =
    '@attr' in trackData ? trackData['@attr'].nowplaying === 'true' : false;
  const id =
    trackData.mbid +
    '-' +
    trackData.artist.mbid +
    '-' +
    trackData.name +
    '-' +
    (nowPlaying ? 'playing' : 'notplaying');

  if (trackmbid !== id) {
    const mbid = trackData.album.mbid;
    // console.log(trackData);

    const images = trackData.image;
    const image = find(images, { size: 'extralarge' });
    let imageUrl;
    if (image) {
      imageUrl = image['#text'];
    }

    track = {
      track: trackData.name,
      artist: trackData.artist['#text'],
      album: trackData.album['#text'],
      nowPlaying: nowPlaying,
      mbid: mbid,
      image: imageUrl,
    };

    console.log(track);
    client.publish('lastfm/' + process.env.LASTFM_USER, JSON.stringify(track));
    trackmbid = id;
  }
}, 1000);

wss.on('connection', (ws: WebSocket) => {
  let prevTrack: Track | undefined;
  setInterval(async () => {
    if (!isEqual(prevTrack, track)) {
      ws.send(JSON.stringify(track));
      prevTrack = track;
    }
  }, 1000);
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(process.env.PWD) + '/index.html');
});

app.get('/client.js', (req, res) => {
  res.sendFile(path.resolve(process.env.PWD) + '/client.js');
});

server.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
