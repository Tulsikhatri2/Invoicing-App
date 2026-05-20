const IMAGE_TYPES = /^image\//i;

const base64ToBlob = (base64, contentType = 'image/jpeg') => {
    const cleaned = base64.replace(/^data:image\/\w+;base64,/, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: contentType });
};

const extractBase64FromJson = (json) => {
    const raw =
        json?.fileContents ??
        json?.FileContents ??
        json?.image ??
        json?.Image ??
        json?.picture ??
        json?.Picture ??
        json?.data ??
        json?.Data ??
        json?.content ??
        json?.Content;
    if (typeof raw !== 'string' || !raw.length) return null;
    const type =
        json?.contentType ??
        json?.ContentType ??
        json?.mimeType ??
        'image/jpeg';
    return base64ToBlob(raw, type);
};

export const parseImageBlobResponse = async (response) => {
    const blob = response?.data;
    if (!(blob instanceof Blob)) return null;

    const contentType = (response.headers?.['content-type'] || blob.type || '').toLowerCase();

    if (contentType.includes('application/json') || blob.type === 'application/json') {
        try {
            const text = await blob.text();
            const json = JSON.parse(text);
            return extractBase64FromJson(json);
        } catch {
            return null;
        }
    }

    if (!blob.size) return null;

    if (IMAGE_TYPES.test(contentType)) {
        const mime = contentType.split(';')[0].trim();
        if (!blob.type || blob.type === 'application/octet-stream') {
            return new Blob([blob], { type: mime });
        }
        return blob;
    }

    if (!blob.type || blob.type === 'application/octet-stream') {
        return new Blob([blob], { type: 'image/jpeg' });
    }

    return blob;
};
