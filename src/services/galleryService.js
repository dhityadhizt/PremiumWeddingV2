import { data } from "../assets/data/data.js";

export const galleryService = {
    getPhotos: async function () {
        try {
            const url = `${data.api}?action=gallery&t=${Date.now()}`;
            const response = await fetch(url);
            const result = await response.json();
            if (result && result.status === 'success' && Array.isArray(result.photos)) {
                return result.photos;
            }
            return [];
        } catch (error) {
            console.warn('Gagal memuat foto:', error);
            return [];
        }
    },

    uploadPhoto: async function ({ guestName, imageBase64 }) {
        const payload = {
            action: 'uploadPhoto',
            guestName: guestName || 'Fansku',
            image: imageBase64
        };

        try {
            const response = await fetch(data.api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                return {
                    status: 'error',
                    message: `HTTP error ${response.status}`
                };
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            return {
                status: 'error',
                message: error && error.message ? error.message : 'Gagal menghubungi server upload.'
            };
        }
    }
};
