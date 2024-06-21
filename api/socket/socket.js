export const sockets = (socket) => {
    console.log("connected to socket io");

    socket.on('join-room', ({roomId}) => {
        socket.join(roomId);
        console.log("joining room: ", roomId);
    })

    socket.on('leave-room', ({roomId}) => {
        socket.leave(roomId);
        console.log("leave room: ", roomId);
    });

    socket.on('send-message', ({message, roomId}) => {
        let skt = socket.broadcast;
        skt = roomId ? skt.to(roomId) : skt;
        console.log(roomId);
        skt.emit('message-from-server', {message});
    })

    socket.on('typing-started', ({roomId}) => {
        let skt = socket.broadcast;
        skt = roomId ? skt.to(roomId) : skt;
        skt.emit('typing-started-from-server')
    })

    socket.on('typing-stoped', ({roomId}) => {
        let skt = socket.broadcast;
        skt = roomId ? skt.to(roomId) : skt;
        skt.emit('typing-stoped-from-server');
    })

    socket.on('disconnect', () => {
        console.log("user left ");
    });
}