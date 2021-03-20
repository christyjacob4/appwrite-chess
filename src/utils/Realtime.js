let realtime = {
    /** @type {WebSocket}  */
    socket: null,
    timeout: null,
    endpointRealtime: "ws://appwrite-realtime.monitor-api.com/v1",
    project : '6054c42b77f63',
    channels: {},
    lastMessage: {},
    createSocket: () => {
        const channels = new URLSearchParams();
        channels.set('project', realtime.project);
        for (const property in realtime.channels) {
            channels.append('channels[]', property);
        }
        if (realtime.socket && realtime.socket.readyState && realtime.socket.readyState === WebSocket.OPEN) {
            realtime.socket.close();
        }

        realtime.socket = new WebSocket(realtime.endpointRealtime + '/realtime?' + channels.toString());
        const onMessage = (channel, callback) =>
            (event) => {
                try {
                    const data = JSON.parse(event.data);
                    realtime.lastMessage = data;

                    if (data.channels && data.channels.includes(channel)) {
                        callback(data);
                    } else if (data.code) {
                        throw data;
                    }
                } catch (e) {
                    console.error(e);
                }
            };

        for (const channel in realtime.channels) {
            realtime.channels[channel].forEach(callback => {
                realtime.socket.addEventListener('message', onMessage(channel, callback));
            });
        }

        realtime.socket.addEventListener('close', event => {
            if (realtime.lastMessage.code && realtime.lastMessage.code === 1008) {
                return;
            }
            console.error('Realtime got disconnected. Reconnect will be attempted in 1 second.', event.reason);
            setTimeout(() => {
                realtime.createSocket();
            }, 1000);
        })
    },
    /**
     * Subscribes to Appwrite events and passes you the payload in realtime.
     * 
     * @param {string|string[]} channels 
     * Channel to subscribe - pass a single channel as a string or multiple with an array of strings.
     * 
     * Possible channels are:
     * - account
     * - collections
     * - collections.[ID]
     * - collections.[ID].documents
     * - documents
     * - documents.[ID]
     * - files
     * - files.[ID]
     * @param {(payload: object) => void} callback Is called on every realtime update.
     * @returns {() => void} Unsubscribes from events.
     */
    subscribe : (channels, callback) => {
        if (typeof channels === 'string' || channels instanceof String) {
            channels = [channels];
        } else if (!(channels instanceof Array)) {
            throw Error("Channels must be of type String or Array.");
        }
        channels.forEach(channel => {
            if (!(channel in realtime.channels)) {
                realtime.channels[channel] = [];
            }
            realtime.channels[channel].push(callback);
            clearTimeout(realtime.timeout);
            realtime.timeout = setTimeout(() => {
                realtime.createSocket();
            }, 1);
        });

        return () => {
            channels.forEach(channel => {
                realtime.socket.removeEventlistener('message', callback);
                realtime.channels[channel].splice(realtime.channels[channel].indexOf(callback), 1);
            })
        }
    }
};

export default realtime;