import { supabase } from "../db/supabase";

interface Notation{
    id: string;
    score_id: string;
    content: {
        annotations: [
        {
            id: string,
            x: number,
            y: number,
            width: number,
            height: number,
            text: string,
            pageNumber: number
        }
        ],
        drawPoints: [
        {
            pageNumber: number,
            color: string,
            points: [
            { x: number, y: number },
            { x: number, y: number }
            ]
        }
        ]
    }
    created_at: string;
    updated_at: string;
}

export class NotationService{
    static async create(score_id: string, content: Notation['content']){
        try {
            if(!score_id || !content) throw new Error('Score ID and content are required');
            console.log('Creating notation with content:', JSON.stringify(content, null, 2));
            
            const { data, error } = await supabase
                .from('Notations')
                .insert({score_id, content})
                .select()
                .single();

            if (error) throw error;
            
            console.log('Created notation:', data);
            return data;
        } catch (error) {
            console.error('Error in NotationService.create:', error);
            throw error;
        }
    }

    static async getByScore(score_id: string){
        try {
            console.log('Fetching notations for score_id:', score_id);
            const { data, error } = await supabase
                .from('Notations')
                .select('*')
                .eq('score_id', score_id);
                
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Fetched notations:', JSON.stringify(data, null, 2));
            return data || [];
        } catch (error) {
            console.error('Error in NotationService.getById:', error);
            throw error;
        }
    }

    static async update(id: string, notation: Notation){
        try {
            const { data, error } = await supabase
                .from('Notations')
                .update(notation)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error in NotationService.update:', error);
            throw error;
        }
    }
}