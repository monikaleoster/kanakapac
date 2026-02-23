import { getEvents, saveEvent, deleteEvent, getUpcomingEvents, getPastEvents, getEventById } from '@/lib/data';
import { supabase } from '@/lib/supabase';

// Mock supabase correctly
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
    },
}));

describe('data.ts lib unit tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Events', () => {
        it('getEvents returns mapped array', async () => {
            const mockData = [
                { id: '1', title: 'Event 1', date: '2026-01-01', time: '10:00', location: 'Loc 1', description: 'Desc 1', created_at: '2026-01-01T00:00:00Z' },
                { id: '2', title: 'Event 2', date: '2026-01-02', time: '11:00', location: 'Loc 2', description: 'Desc 2', created_at: '2026-01-02T00:00:00Z' },
            ];
            (supabase.from('events').select('*') as any).order.mockResolvedValue({ data: mockData, error: null });

            const events = await getEvents();
            expect(events).toHaveLength(2);
            expect(events[0].createdAt).toBe('2026-01-01T00:00:00Z');
            expect(events[0].id).toBe('1');
        });

        it('getEvents returns empty array on error', async () => {
            (supabase.from('events').select('*') as any).order.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
            const events = await getEvents();
            expect(events).toEqual([]);
        });

        it('getUpcomingEvents filters by today', async () => {
            (supabase.from('events').select('*') as any).gte.mockReturnThis();
            (supabase.from('events').select('*') as any).gte('date', '').order.mockResolvedValue({ data: [], error: null });

            await getUpcomingEvents();
            expect(supabase.from).toHaveBeenCalledWith('events');
            expect((supabase as any).gte).toHaveBeenCalledWith('date', expect.stringContaining('20'));
        });

        it('getEventById returns undefined on not found', async () => {
            (supabase.from('events').select('*') as any).eq.mockReturnThis();
            (supabase.from('events').select('*') as any).eq('id', '1').single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

            const event = await getEventById('1');
            expect(event).toBeUndefined();
        });

        it('saveEvent calls upsert with correct payload', async () => {
            const mockEvent = {
                id: '1',
                title: 'New Event',
                date: '2026-03-01',
                time: '12:00',
                location: 'New Loc',
                description: 'New Desc',
                createdAt: '2026-01-01T00:00:00Z'
            };
            (supabase.from('events') as any).upsert.mockResolvedValue({ error: null });

            await saveEvent(mockEvent);
            expect((supabase as any).upsert).toHaveBeenCalledWith({
                id: '1',
                title: 'New Event',
                date: '2026-03-01',
                time: '12:00',
                location: 'New Loc',
                description: 'New Desc',
                created_at: '2026-01-01T00:00:00Z'
            });
        });

        it('deleteEvent calls delete with id', async () => {
            (supabase.from('events') as any).delete.mockReturnThis();
            ((supabase as any).delete().eq as jest.Mock).mockResolvedValue({ error: null });

            await deleteEvent('123');
            expect((supabase as any).delete).toHaveBeenCalled();
            expect((supabase as any).eq).toHaveBeenCalledWith('id', '123');
        });
    });
});
