import tls from 'tls';

export interface CertNode {
    id: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    serialNumber: string;
    fingerprint: string;
    next?: CertNode; // Parent in the chain (Issuer)
}

export const analyzeCertificateChain = (domain: string): Promise<CertNode> => {
    return new Promise((resolve, reject) => {
        try {
            // Handle domain input (strip protocol if present)
            const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];

            const socket = tls.connect({
                host: cleanDomain,
                port: 443,
                servername: cleanDomain,
                rejectUnauthorized: false // We want to inspect even if invalid
            }, () => {
                const cert = socket.getPeerCertificate(true);
                socket.end();

                if (!cert || Object.keys(cert).length === 0) {
                    reject(new Error('No certificate found'));
                    return;
                }

                const chain = parseCertChain(cert);
                resolve(chain);
            });

            socket.on('error', (err) => {
                reject(err);
            });

            socket.setTimeout(5000, () => {
                socket.destroy();
                reject(new Error('Connection timed out'));
            });
        } catch (error) {
            reject(error);
        }
    });
};

const parseCertChain = (cert: tls.PeerCertificate): CertNode => {
    const validTo = new Date(cert.valid_to);
    const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const node: CertNode = {
        id: cert.fingerprint,
        subject: cert.subject.CN || (cert.subject as any).O || 'Unknown',
        issuer: cert.issuer.CN || (cert.issuer as any).O || 'Unknown',
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysRemaining,
        serialNumber: cert.serialNumber,
        fingerprint: cert.fingerprint,
    };

    // Check if we have an issuer and it's not a self-signed root (where issuer == subject)
    // Actually, for visualization, we want to show the root too.
    // The recursion stops when issuerCertificate is missing or empty.
    const detailedCert = cert as any;
    if (detailedCert.issuerCertificate && Object.keys(detailedCert.issuerCertificate).length > 0) {
        // Stop if self-signed (root) to prevent infinite recursion if the object reference cycles
        if (cert.fingerprint !== detailedCert.issuerCertificate.fingerprint) {
            node.next = parseCertChain(detailedCert.issuerCertificate);
        }
    }

    return node;
};
