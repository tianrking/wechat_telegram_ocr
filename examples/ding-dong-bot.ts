#!/usr/bin/env -S node --no-warnings --loader ts-node/esm
/**
 * Wechaty - Conversational RPA SDK for Chatbot Makers.
 *  - https://github.com/wechaty/wechaty
 */
// https://stackoverflow.com/a/42817956/1123955
// https://github.com/motdotla/dotenv/issues/89#issuecomment-587753552
import {
  Contact,
  Message,
  ScanStatus,
  WechatyBuilder,
  log,

} from 'wechaty'
import { FileBox } from 'file-box' // import { FileBox }      from 'file-box'
import qrcodeTerminal from 'qrcode-terminal'
import request from 'request'
import fs from 'fs'
import fetch from 'node-fetch'


export enum MessageType {
  Unknown = 0,
  Attachment = 1,    // Attach(6),
  Audio = 2,    // Audio(1), Voice(34)
  Contact = 3,    // ShareCard(42)
  ChatHistory = 4,    // ChatHistory(19)
  Emoticon = 5,    // Sticker: Emoticon(15), Emoticon(47)
  Image = 6,    // Img(2), Image(3)
  Text = 7,    // Text(1)
  Location = 8,    // Location(48)
  MiniProgram = 9,    // MiniProgram(33)
  GroupNote = 10,   // GroupNote(53)
  Transfer = 11,   // Transfers(2000)
  RedEnvelope = 12,   // RedEnvelopes(2001)
  Recalled = 13,   // Recalled(10002)
  Url = 14,   // Url(5)
  Video = 15,   // Video(4), Video(43)
  Post = 16,   // Moment, Channel, Tweet, etc
}

function onLogout(user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

    qrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}
function onLogin(user: Contact) {
  log.info('StarterBot', '%s login', user)
}

let _flag = 0
async function onMessage(msg: Message) {
  const url = 'http://0.0.0.0:61112'
  log.info('StarterBot', msg.toString())
  if (msg.type() == MessageType.Text) {
    const str = msg.text()
    const buff = Buffer.from(str, 'utf-8') // create a buffer
    const base64 = buff.toString('base64')  // encode buffer as Base64
    const body = {
      lol: _flag,
      tts_data: base64  // eslint-disable-line
    };  // eslint-disable-line
    const response = await fetch(url + '/api/tts/', {
      body: JSON.stringify(body),
      method: 'post',
      headers: { 'Content-Type': 'application/json' } // eslint-disable-line
    }); // eslint-disable-line
    const base64_data = await response.json()
    const fileDataDecoded = Buffer.from(JSON.stringify(base64_data), 'base64');
    fs.writeFile("aa.wav", fileDataDecoded, function (err) {
      console.log(err)
    });
    const wav_fileBox = FileBox.fromFile('aa.wav')
    //await msg.say("saved !!") // eslint-disable-line
    await msg.say(wav_fileBox)
    _flag = 0
  }

  if (msg.type() === MessageType.Image) {
    const imageBox = await msg.toFileBox()
    const audio_dir = imageBox.name
    await imageBox.toFile(imageBox.name, true)
    const body = {
      lol: _flag,
      pic_name: imageBox.name,
      pic_data: "data:image/jpg;base64," + fs.readFileSync(audio_dir, 'base64')  // eslint-disable-line
    };  // eslint-disable-line
    const response = await fetch(url + '/api/style/', {
      body: JSON.stringify(body),
      method: 'post',
      headers: { 'Content-Type': 'application/json' } // eslint-disable-line
    }); // eslint-disable-line
    const data = await response.json()
    await msg.say(JSON.stringify(data)); // eslint-disable-line
    _flag = 0
  }

  if (msg.type() === MessageType.Audio) {
    const audioFileBox = await msg.toFileBox()
    const audio_dir = audioFileBox.name
    await audioFileBox.toFile(audioFileBox.name, true)
    const body = {
      lol: '1',
      audio_name: audioFileBox.name,
      audio_data: "data:audio/silk;base64," + fs.readFileSync(audio_dir, 'base64')  // eslint-disable-line
      // img: "data:image/gif;base64,"+fs.readFileSync("/storage/lol/test/nodejs/octocat.png", 'base64')
    };  // eslint-disable-line
    const response = await fetch(url + '/api/audio/', {
      body: JSON.stringify(body),
      method: 'post',
      headers: { 'Content-Type': 'application/json' } // eslint-disable-line
    }); // eslint-disable-line
    const data = await response.json()
    await msg.say(JSON.stringify(data)); // eslint-disable-line
    // // const audioData: Buffer = await audioFileBox.toBuffer();
    // const audio_dir = filePath + t + '.silk'  // eslint-disable-line
    // await audioFileBox.toFile(audio_dir, true)

    // const body = {
    //   lol: '1',
    //   audio: "data:audio/silk;base64," + fs.readFileSync(audio_dir, 'base64')  // eslint-disable-line
    //   // img: "data:image/gif;base64,"+fs.readFileSync("/storage/lol/test/nodejs/octocat.png", 'base64')
    // };  // eslint-disable-line
    // const response = await fetch(url + '/api/audio/', {
    //   body: JSON.stringify(body),
    //   method: 'post',
    //   headers: { 'Content-Type': 'application/json' } // eslint-disable-line
    // }); // eslint-disable-line
    // const data = await response.json()
    // await msg.say(JSON.stringify(data)); // eslint-disable-line
    // // await msg.say(data.toString())
    // // FileBox.toFile
    // // await fileBox.toFile('/storage/lol/wechaty/wechat_telegram_ocr/media/p.mp3', true)
  }
  if (msg.text() === 'ding') {
    await msg.say('dong')
    _flag = 11
  }


  // 通过request发起post请求上传文件到服务器
  // 获取图片的base64
  // var imageData = fs.readFileSync(filePath1);
  // var imageBase64 = imageData.toString("base64");
  // const url = 'http://127.0.0.1:61111/pic/'
  // const data_fs =  fs.createReadStream('/storage/lol/wechaty/getting-started/media/1.png') // eslint-disable-line
  // const formData = {
  //   file: data_fs,
  // }
  // request.post({ formData: formData, url:url }, (_error, _response, data) => {  // eslint-disable-line
  //     msg.say(data) // eslint-disable-line
  //   })             // eslint-disable-line
  // msg.say('Hi @Jade')// eslint-disable-line
}

const bot = WechatyBuilder.build({
  name: 'ding-dong-bot',
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)
bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))
