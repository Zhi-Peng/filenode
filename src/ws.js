import WebSocket, {WebSocketServer} from 'ws';

class Ws {
  static online = 1
  static init(server) {
    this.ws = new WebSocketServer({server})
    this.ws.on('connection', (ws, request) => {
      console.log('ws 连接成功');
      ws.on('message', (data) => {
        console.log('传过来的数据，可根据不同 id 区分业务来进行返回数据', data.toString());
      })
      ws.send(`node-${this.online}`);
    })
  }
}

export default Ws;