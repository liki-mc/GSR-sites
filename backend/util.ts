import crypto from 'crypto';

function randomCspNonce() {
    let nonce = crypto.randomBytes(16);
    return nonce.toString('hex');
}

export default { randomCspNonce };