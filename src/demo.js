import FfmpegCommand from 'fluent-ffmpeg';
import fs from 'fs';
const stream  = fs.createWriteStream('22222.mp4');
const command = new FfmpegCommand();
command.input('./11111.mkv')
.format('.mp4')
.output('./22222.mp4')
.save('./22222.mp4')
