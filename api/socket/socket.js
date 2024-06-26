let connectedUsers = [];
export const sockets = (socket) => {
    console.log("connected to socket io");

    socket.on('register', ({user}) => {
            connectedUsers.push({[socket.id]: user._id});
            socket.emit('user-online', {connectedUsers});
            socket.broadcast.emit('user-online', {connectedUsers});
            // console.log("registerd user:", connectedUsers);
    })


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

    socket.on('message-delete', ({messageId, roomId}) => {
        let skt = socket.broadcast;
        skt = roomId ? skt.to(roomId) : skt;
        skt.emit('message-delete-server', {messageId});
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
        connectedUsers = connectedUsers.filter((obj) => !obj.hasOwnProperty(socket.id) )
        socket.broadcast.emit('user-online', {connectedUsers});
        console.log("user left");
        // console.log("array: ", connectedUsers);
    });
}