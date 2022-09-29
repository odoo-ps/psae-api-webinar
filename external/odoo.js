import {createClient, createSecureClient} from "xmlrpc";
import url from "url";

export default class Odoo {
    constructor(config = {}) {
        this.config = config;
        const urlparts = url.parse(config.url);
        this.host = urlparts.hostname;
        this.port = config.port || urlparts.port;
        this.db = config.db;
        this.username = config.username;
        this.password = config.password;
        this.secure = urlparts.protocol === "https:";
        this.uid = 0;
    }

    _getClient(path) {
        const createClientFn = this.secure ? createSecureClient : createClient;
        return createClientFn({
            host: this.host,
            port: this.port,
            path,
        });
    }

    _methodCall(client, method, params = []) {
        return new Promise((resolve, reject) => {
            client.methodCall(method, params, (err, value) => {
                if (err) {
                    return reject(err);
                }
                return resolve(value);
            });
        });
    }

    async connect() {
        const client = this._getClient("/xmlrpc/2/common");
        const params = [
            this.db,
            this.username,
            this.password,
            {},
        ];

        const uid = await this._methodCall(client,"authenticate", params).catch(console.error);
        if (!uid) return Promise.reject("Authentication failed");
        return this.uid = uid;
    }

    async execute_kw(model, method, params) {
        const client = this._getClient("/xmlrpc/2/object");
        const finalParams = [
            this.db,
            this.uid,
            this.password,
            model,
            method,
            ...params
        ];
        try {
            const value = await this._methodCall(client, "execute_kw", finalParams);
            return Promise.resolve(value);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}