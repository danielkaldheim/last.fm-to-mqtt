export default interface Track {
  track: string;
  artist: string;
  album: string;
  image: string;
  nowPlaying: boolean;
  mbid: string;
  date?: string;
}
