const Device = MediasoupClient.Device;
const device = new Device();

class Room {

    constructor() {

        this.videoTrack = null;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async run() {

        const transportParams = await this.loadDevice();
        await this.checkCanProduce();
        const sendTransport = await this.connectSendTransport(transportParams.rxTransportParams); // Maybe the wrong way round
        const recvTransport = await this.connectRecvTransport(transportParams.txTransportParams);
        await this.produceTransportData(sendTransport);
        await this.startStream(sendTransport);
    }

    /**
     *
     * @returns {Promise<any>}
     */
    async loadDevice() {

        const fetchResponse = await fetch('http://192.168.1.102:3000/api/members', { method: 'POST' });
        const transportParams = await fetchResponse.json();

        await device.load({

            routerRtpCapabilities: transportParams.rxTransportParams.routerRtpCapabilities // video and audio produce permissions.
        });

        return transportParams;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async checkCanProduce() {

        if (device.canProduce('video')) {

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoTrack = stream.getVideoTracks()[0];
        }
        else {

            throw 'Device cannot produce video.';
        }
    }

    /**
     *
     * @param transportParams
     * @returns {Promise<"usb"|"nfc"|"ble">}
     */
    async connectSendTransport(transportParams) {

        const sendTransport = device.createSendTransport(transportParams.transportParameters);

        sendTransport.on('connect', async (parameters, callback, errback) => {

            // Signal local DTLS parameters to the server side transport.
            try {

                const transportConnectData = {

                    transportId: sendTransport.id,
                    dtlsParameters: parameters.dtlsParameters
                };

                await fetch('http://192.168.1.102:3000/api/members/connect',
                    {

                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(transportConnectData)
                    });

                callback();
            }
            catch (err) {

                errback();
            }
        });

        return sendTransport;
    }

    async connectRecvTransport(transportParams) {

        const recvTransport = device.createRecvTransport(transportParams.transportParameters);

        recvTransport.on('connect', async (parameters, callback, errback) => {

            // Signal local DTLS parameters to the server side transport.
            try {

                const transportConnectData = {

                    transportId: recvTransport.id,
                    dtlsParameters: parameters.dtlsParameters
                };

                await fetch('http://192.168.1.102:3000/api/members/connect',
                    {

                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(transportConnectData)
                    });

                callback();
            }
            catch (err) {

                errback();
            }
        });

        return recvTransport;
    }

    /**
     *
     * @param sendTransport
     * @returns {Promise<void>}
     */
    async produceTransportData(sendTransport) {

        sendTransport.on('produce', async (parameters, callback, errback) => {

            try {

                const produceData = {

                    transportId   : sendTransport.id,
                    kind          : parameters.kind,
                    rtpParameters : parameters.rtpParameters,
                    appData       : parameters.appData
                };

                const data = await fetch('http://192.168.1.102:3000/api/members/produce',
                    {

                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(produceData)
                    });
                callback({id: 1});
            }
            catch (err) {

                errback();
            }
        });
    }

    /**
     *
     * @param sendTransport
     * @returns {Promise<void>}
     */
    async startStream(sendTransport) {

        this.producer = await sendTransport.produce(
            {
                track: this.videoTrack,
                encodings:
                    [
                        {maxBitrate: 100000},
                        {maxBitrate: 300000},
                        {maxBitrate: 900000}
                    ],
                codecOptions:
                {
                    videoGoogleStartBitrate: 1000
                }
            }
        );
    }
}

const room = new Room();
room.run();