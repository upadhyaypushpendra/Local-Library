const fs = require("fs");
const config = require("./../config/index");
const jwt = require("jsonwebtoken");
const path = require("path")

const privateKey = fs.readFileSync(path.join(__dirname + config.private_key_file))

const privateSecret = {
    key: privateKey,
    passphrase: config.private_key_passphrase
}

const accessSignOptions = {
    algorithm: 'RS256',
    expiresIn: config.access_token_expiry_after
}

const refreshSignOptions = {
    algorithm: 'RS256',
    expiresIn: config.refresh_token_expiry_after
}

const publicKey = fs.readFileSync(path.join(__dirname + config.public_key_file))

const verifyOptions = {
    algorithms: ['RS256']
}

function createAccessToken(userId) {
    return new Promise((resolve, reject) => {
        jwt.sign({ userId }, privateSecret, accessSignOptions, (err, encoded) => {
            if (err === null && encoded !== undefined) {
                const expireAfter = config.access_token_expiry_after /* two weeks */
                const expireAt = new Date()
                expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
                resolve({ accessToken: encoded, accessExpireAt: expireAt })
            } else {
                reject(err)
            }
        })
    })
}

function createTemporaryTokenWithVisitorId(visitorId) {
    return new Promise((resolve, reject) => {
        jwt.sign({ visitorId }, privateSecret, accessSignOptions, (err, encoded) => {
            if (err === null && encoded !== undefined) {
                const expireAfter = 600 /*10min*/;
                const expireAt = new Date();
                expireAt.setSeconds(expireAt.getSeconds() + expireAfter);
                resolve({ tempToken: encoded, tempExpireAt: expireAt })
            } else {
                reject(err)
            }
        })
    })
}

function createRefreshToken(userId) {
    return new Promise((resolve, reject) => {
        jwt.sign({ userId }, privateSecret, refreshSignOptions, (err, encoded) => {
            if (err === null && encoded !== undefined) {
                const expireAfter = config.refresh_token_expiry_after /* two weeks */
                const expireAt = new Date()
                expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
                resolve({ refreshToken: encoded, refreshExpireAt: expireAt })
            } else {
                reject(err)
            }
        })
    })
}

async function createTokens(userId) {
    try {
        const accessToken = await createAccessToken(userId)
        const refreshToken = await createRefreshToken(userId)
        return {
            accessToken: accessToken.accessToken,
            accessExpireAt: accessToken.accessExpireAt,
            refreshToken: refreshToken.refreshToken,
            refreshExpireAt: refreshToken.refreshExpireAt
        }
    } catch (error) {
        throw new Error("Can't generate token")
    }
}

async function createTemporaryTokens(userId) {
    return new Promise((resolve, reject) => {
        jwt.sign({ userId }, privateSecret, accessSignOptions, (err, encoded) => {
            if (err === null && encoded !== undefined) {
                const expireAfter = 600 /* 10 min */
                const expireAt = new Date()
                expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
                resolve({ accessToken: encoded, accessExpireAt: expireAt })
            } else {
                reject(err)
            }
        })
    })
}

async function createMasterToken() {
    try {
        const masterTokenData = await _createMasterAccessToken();
        return {
            masterToken: masterTokenData.accessToken,
            masterExpireAt: masterTokenData.accessExpireAt
        }

    } catch (error) {
        throw new Error("Can't generate master token")
    }
}

async function verifyAccessToken(accessToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, publicKey, verifyOptions, async (err, decoded) => {
            if (err === null && decoded !== undefined) {
                const userId = decoded.userId;

                resolve(userId)
            } else {
                reject(err)
            }
        })
    })
}

async function verifyTemporaryTokenWithVisitorId(tempToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(tempToken, publicKey, verifyOptions, async (err, decoded) => {
            if (err === null && decoded !== undefined) {
                resolve(decoded.visitorId)
            } else {
                reject(err)
            }
        })
    })
}

async function verifyRefreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, publicKey, verifyOptions, async (err, decoded) => {
            if (err === null && decoded !== undefined) {
                const userId = decoded.userId;

                resolve(userId);
            } else {
                reject(err);
            }
        })
    })
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    createTokens,
    verifyAccessToken,
    verifyRefreshToken,
    createMasterToken,
    verifyTemporaryTokenWithVisitorId,
    createTemporaryTokenWithVisitorId,
    createTemporaryTokens,
};
