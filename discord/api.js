const axios = require('axios');

class Api {

    constructor() {
        this.baseUrl = "http://yticket-api.test/api";
        this.platformId = 1;
        this.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
    }

    async createClient(identifier, name) {
        try {
            const response = await axios.post(`${this.baseUrl}/client`, {
                "platform_id": this.platformId,
                "identifier": identifier,
                "name": name
            }, { headers: this.headers });

            console.log(`Client created for ${name}`);

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 422) {
                console.log(`Error: ${error.response.data.message}`);
            } else {
                console.log(error);
            }

            return this.getClientByIdent(identifier);
        }
    }

    async getClientByIdent(identifier) {
        try {
            const response = await axios.get(`${this.baseUrl}/client/ident/${identifier}`, {
                headers: this.headers
            });

            console.log(`Client logged ${response.data.name}`);

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 422) {
                console.log(`Error: ${error.response.data.message}`);
            } else {
                console.log(error);
            }

            return null;
        }
    }

    async getOpenedTicket(identifier) {
        try {
            const response = await axios.get(`${this.baseUrl}/ticket/opened/ident/${identifier}`, {
                headers: this.headers
            });

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`Error: ${error.response.data.message}`);
            } else {
                console.log(error);
            }

            return null;
        }
    }

    async createTicket(name, identifier, channelId) {
        try {
            const response = await axios.post(`${this.baseUrl}/ticket`, {
                "name": `${name} Ticket`,
                "status_id": 1,
                "client_identifier": identifier,
                "channel_id": channelId
            }, { headers: this.headers });

            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 422) {
                console.log(`Error: ${error.response.data.message}`);
            } else {
                console.log(error);
            }

            return this.getClientByIdent(identifier);
        }
    }
}

module.exports = Api;