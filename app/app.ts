require('dotenv').config();

import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { find } from 'lodash';

const https = require('follow-redirects').https;
const LastFm = require('lastfm-node-client');

const mqtt = require('mqtt');

const client = mqtt.connect(process.env.MQTT_SERVER, {
  clientId: 'lastfm-' + process.env.LASTFM_USER,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

const port = process.env.SERVER_PORT;
const app = express();

// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// https://archive.org/download/mbid-1ab61d19-af4f-46a7-9f34-88048a927b07/index.json

const getAlbumArt = (mbid: string) => {
  const options = {
    hostname: 'coverartarchive.org',
    path: '/release/' + mbid,
    followAllRedirects: true,
  };

  return new Promise((resolve, reject) => {
    const httpRequest = https.request(options, (httpResponse: any) => {
      let data = '';

      httpResponse.setEncoding('utf8');
      httpResponse.on('data', (chunk: any) => (data += chunk));
      httpResponse.on('end', () => resolve(data));
      httpResponse.on('error', (err: any) => reject(err));
    });

    httpRequest.on('error', (err: any) => reject(err));
    httpRequest.end();
  }).then((apiResponse: any) => {
    let data;

    try {
      data = JSON.parse(apiResponse);
    } catch (err) {
      throw new Error('Unable to parse API response to JSON');
    }

    if (data.error) {
      throw new Error(data.message);
    }

    return data;
  });
};

const lastFm = new LastFm(
  process.env.LASTFM_API_KEY,
  process.env.LASTFM_SECRET,
  process.env.LASTFM_SESSION_KEY
);

let trackmbid = '';
let track = {};
setInterval(async () => {
  const data = await lastFm.userGetRecentTracks({
    user: process.env.LASTFM_USER,
    limit: 1,
  });
  const trackData = data.recenttracks.track[0];
  const nowPlaying =
    '@attr' in trackData ? trackData['@attr'].nowplaying : false;
  const id =
    trackData.mbid +
    '-' +
    trackData.artist.mbid +
    '-' +
    trackData.name +
    '-' +
    nowPlaying;
  //   console.log(new Date(), id);

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
      nowplaying: nowPlaying,
      mbid: mbid,
      image: imageUrl,
    };

    // if (mbid && mbid !== '') {
    //   try {
    //     const albumArtData = await getAlbumArt(mbid);

    //     const images = albumArtData.images;
    //     const image = find(images, { approved: true, front: true });
    //     if (image) {
    //       track.image = image.image;
    //     }
    //     console.log(image);
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }

    console.log(track);
    client.publish('lastfm/' + process.env.LASTFM_USER, JSON.stringify(track));
    trackmbid = id;
  }
}, 1000);

wss.on('connection', (ws: WebSocket) => {
  let prevTrack: any;
  setInterval(async () => {
    if (prevTrack !== track) {
      ws.send(JSON.stringify(track));
      prevTrack = track;
    }
  }, 1000);
});

server.listen(8999, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:8999`);
});

const httpApp = express();

httpApp.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

httpApp.get('/client.js', (req, res) => {
  res.sendFile(__dirname + '/client.js');
});

httpApp.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
