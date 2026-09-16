jest.mock('@/lib/supabase', () => ({
    supabase: {
        storage: {
            from: jest.fn(),
        },
    },
}));

import { supabase } from '@/lib/supabase';
import { uploadBuffer } from '@/lib/storage';

describe('uploadBuffer', () => {
    const upload = jest.fn();
    const getPublicUrl = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (supabase.storage.from as jest.Mock).mockReturnValue({ upload, getPublicUrl });
    });

    it('uploads the buffer to the given bucket/filename and returns the public URL', async () => {
        upload.mockResolvedValue({ data: { path: 'foo.png' }, error: null });
        getPublicUrl.mockReturnValue({
            data: { publicUrl: 'https://cdn.example.com/images/foo.png' },
        });

        const url = await uploadBuffer('images', 'foo.png', new ArrayBuffer(4), 'image/png');

        expect(supabase.storage.from).toHaveBeenCalledWith('images');
        expect(upload).toHaveBeenCalledWith('foo.png', expect.any(ArrayBuffer), {
            contentType: 'image/png',
            upsert: true,
        });
        expect(getPublicUrl).toHaveBeenCalledWith('foo.png');
        expect(url).toBe('https://cdn.example.com/images/foo.png');
    });

    it('throws when the storage upload fails', async () => {
        upload.mockResolvedValue({ data: null, error: new Error('bucket full') });

        await expect(
            uploadBuffer('images', 'foo.png', new ArrayBuffer(4), 'image/png')
        ).rejects.toThrow('bucket full');
        expect(getPublicUrl).not.toHaveBeenCalled();
    });
});
