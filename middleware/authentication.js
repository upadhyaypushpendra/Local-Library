const { verifyAccessToken, verifyRefreshToken } = require("./../utils/jwt");

exports.authenticateAccessToken = (request, response, next) => {
    const token = request.headers["kutuki-access-token"];

    if (!token) {
        response.status(401).json(new Error("Token not provided"));
        return;
    }

    verifyAccessToken(token).then(userId => {
        request.headers.userId = userId;
        next();
    }).catch(err => {
        response.status(403).json(err);
    })
}

exports.authenticateRefreshToken = (request, response, next) => {
    const token = request.headers["kutuki-refresh-token"];

    if (!token) {
        response.status(401).json(new Error("Token not provided"));
        return;
    }

    verifyAccessToken(token).then(userId => {
        request.headers.userId = userId;
        next();
    }).catch(err => {
        response.status(403).json(err);
    })
}
