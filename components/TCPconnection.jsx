import TcpSocket from 'react-native-tcp-socket';


const options = {
    port: 5000,
    host: '127.0.0.1',
    localAddress: '127.0.0.1',
    reuseAddress: true,
};

// Create socket
const client = TcpSocket.createConnection(options, () => {
    // Write on the socket
    client.write('Hello server!');

    // Close socket
    client.destroy();
});


client.on('data', function(data) {
    console.log('message was received', data);
});

client.on('error', function(error) {
    console.log(error);
});

client.on('close', function(){
    console.log('Connection closed!');
});