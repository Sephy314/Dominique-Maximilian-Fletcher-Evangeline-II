require('dotenv').config();
const net = require('net');
const { spawn, exec } = require('child_process');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');


function checkServer(host, port = 25565) {
  return new Promise(resolve => {
    const socket = new net.Socket();

    socket.setTimeout(3000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true); // 서버 켜짐
    });

    socket.on('error', () => {
      resolve(false); // 꺼짐
    });

    socket.on('timeout', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});


let serverProcess = null;

function startServer() {
  if (serverProcess) return false;

  serverProcess = spawn('/home/sephy314/daechung/start', [], {
    shell: true
  });

  serverProcess.stdout.on('data', data => {
    console.log(`[OUT]: ${data}`);
  });

  serverProcess.stderr.on('data', data => {
    console.error(`[ERR]: ${data}`);
  });

  serverProcess.on('close', () => {
    console.log('프로세스 종료됨');
    serverProcess = null;
  });

  return true;
}


function mcrcon(cmd) {
  exec(`mcrcon -H 127.0.0.1 -P 10000 -p ${process.env.RCON_PASSWORD} "${cmd}"`,
    (err, stdout, stderr) => {
      if (err) {
        console.error('에러:', err);
        return;
      }
      console.log(stdout);
    }
  );
}

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  switch (message.content) {
    case '$ping':
      message.reply('pong 🏓');
      break;

    case '$마크켜':
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        message.reply("권한이 없어요!");
        break;
      }
      const sv = startServer();
      if (sv) message.reply("켜짐");
      break;

    case "$마크꺼":
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        message.reply("권한이 없어요!");
        break;
      }
      mcrcon('stop');
      message.reply("끔");
      break;

    case "$마크상태":
      const online = await checkServer();
      if (online) message.reply("서버 켜짐")
      else message.reply("꺼짐")

      break;
  }
});

client.login(process.env.TOKEN);