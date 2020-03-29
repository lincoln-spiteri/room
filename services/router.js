const mediasoup = require('mediasoup');


class Router {

    constructor() {

        this.transports = [];

        this.mediaCodecs = [
            {
                kind        : "audio",
                mimeType    : "audio/opus",
                clockRate   : 48000,
                channels    : 2
            },
            {
                kind       : "video",
                mimeType   : "video/H264",
                clockRate  : 90000,
                parameters :
                    {
                        "packetization-mode"      : 1,
                        "profile-level-id"        : "42e01f",
                        "level-asymmetry-allowed" : 1
                    }
            }
        ];
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async init() {
        await this.createRouter();
    }


    /**
     *
     * @returns {Promise<void>}
     */
    async createRouter() {

        console.log('Creating router ');

        const worker = await mediasoup.createWorker({
            logLevel: "warn"
        });

        worker.on('close', (error) => {
           console.log('Worker closed');
        });

        worker.on('newrouter', (error) => {
            console.log('Router created.');
        });

        console.log(`worker pid ${worker.pid}`);

        this.router = await worker.createRouter({ mediaCodecs: this.mediaCodecs });
        this.routerRtpCapabilities = this.router.rtpCapabilities;
    }


    /**
     *
     * @returns {Promise<{transportParameters: {iceParameters: *, iceCandidates: *, dtlsParameters: *, id: *}, routerRtpCapabilities: RtpCapabilities}>}
     */
    async createTransports() {

        const receiveTransport = await this.router.createWebRtcTransport(
            {
                listenIps : [ { ip: "192.168.1.102", announcedIp: "192.168.1.102" } ],
                enableUdp : true,
                enableTcp : true,
                preferUdp : true
            });

        this.transports.push(receiveTransport);

        console.log('Receive transport ID: '  + receiveTransport.id);

        const transmitTransport = await this.router.createWebRtcTransport(
            {
                listenIps : [ { ip: "192.168.1.102", announcedIp: "192.168.1.102" } ],
                enableUdp : true,
                enableTcp : true,
                preferUdp : true
            });

        this.transports.push(transmitTransport);

        console.log('Transmit transport ID: '  + receiveTransport.id);

        const rxTransportParams = this.getTransportParameters(receiveTransport.id);
        const txTransportParams = this.getTransportParameters(transmitTransport.id);

        return {
            txTransportParams,
            rxTransportParams
        }
    }


    /**
     *
     * @param parameters
     * @returns {Promise<void>}
     */
    async connect(parameters) {

        const transport = this.getTransport(parameters.transportId);
        await transport.connect( {dtlsParameters: parameters.dtlsParameters});
    }


    /**
     *
     * @param parameters
     * @returns {Promise<void>}
     */
    async produce(parameters) {

        const transport = this.getTransport(parameters.transportId);
        await transport.produce(parameters);

        // Create producer instance
    }


    /**
     *
     * @param transportId
     * @returns {{transportParameters: {iceParameters: *, iceCandidates: *, dtlsParameters: *, id: *}, routerRtpCapabilities: RtpCapabilities}}
     */
    getTransportParameters(transportId) {

        const transport = this.getTransport(transportId);

        return {
            transportParameters: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            },
            routerRtpCapabilities: this.routerRtpCapabilities
        };
    }


    /**
     *
     * @returns {Promise<void>}
     */
    async createConsumer() {

    }


    /**
     *
     * @param transportId
     * @returns {Promise<void>}
     */
    async hangUp(transportId) {

        const transport = this.getTransport(transportId);
        transport.close();
    }


    /**
     *
     * @param transportId
     * @returns {*}
     */
    getTransport(transportId) {

        let transport = null;

        this.transports.forEach((t) => {

            if (t.id === transportId) {
                transport = t;
            }
        });

        return transport;
    }
}

module.exports = Router;
