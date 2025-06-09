import { supabase } from '../db/supabase';
import { Score } from '../models/score.model';
import pdfParse from 'pdf-parse';

export class ScoreService{
    private static generateMusicXML(pdfContent: string): string {
        // Aquí implementaremos la lógica para generar el MusicXML
        // Por ahora, retornamos un MusicXML básico como ejemplo
        return `<?xml version="1.0" encoding="UTF-8"?>
            <!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
            <score-partwise version="4.0">
            <part-list>
                <score-part id="P1">
                <part-name>Music</part-name>
                </score-part>
            </part-list>
            <part id="P1">
                <measure number="1">
                <attributes>
                    <divisions>1</divisions>
                    <time>
                    <beats>4</beats>
                    <beat-type>4</beat-type>
                    </time>
                    <clef>
                    <sign>G</sign>
                    <line>2</line>
                    </clef>
                </attributes>
                <note>
                    <pitch>
                    <step>C</step>
                    <octave>4</octave>
                    </pitch>
                    <duration>4</duration>
                    <type>whole</type>
                </note>
                </measure>
            </part>
            </score-partwise>`;
    }

    static async getById(){
        
    }

    static async getAll(){
       
    }

    static async create(scoreData: Partial<Score> & { user_id: string }, pdfFile: Express.Multer.File) {
        try {
            if (!scoreData.user_id) {
                throw new Error('user_id is required to create a score');
            }

            // 1. Subir PDF a Supabase Storage
            const pdfFileName = `scores/${Date.now()}_${pdfFile.originalname}`;
            const { data: pdfData, error: pdfError } = await supabase.storage
                .from('scores')
                .upload(pdfFileName, pdfFile.buffer, {
                    contentType: 'application/pdf',
                    cacheControl: '3600'
                });

            if (pdfError) throw new Error(`Error uploading PDF: ${pdfError.message}`);

            // 2. Generar MusicXML a partir del PDF
            const pdfContent = await pdfParse(pdfFile.buffer);
            const musicXmlContent = this.generateMusicXML(pdfContent.text);

            // 3. Subir MusicXML generado a Supabase Storage
            const xmlFileName = `scores/${Date.now()}_${pdfFile.originalname.replace('.pdf', '.musicxml')}`;
            const { data: xmlData, error: xmlError } = await supabase.storage
                .from('scores')
                .upload(xmlFileName, Buffer.from(musicXmlContent), {
                    contentType: 'application/vnd.recordare.musicxml+xml',
                    cacheControl: '3600'
                });

            if (xmlError) throw new Error(`Error uploading MusicXML: ${xmlError.message}`);

            // 4. Obtener URLs públicas
            const { data: { publicUrl: pdfUrl } } = supabase.storage
                .from('scores')
                .getPublicUrl(pdfFileName);

            const { data: { publicUrl: xmlUrl } } = supabase.storage
                .from('scores')
                .getPublicUrl(xmlFileName);

            // 5. Crear registro en la base de datos
            const { data: score, error: dbError } = await supabase
                .from('Scores')
                .insert({
                    title: scoreData.title,
                    pdf_url: pdfUrl,
                    musicxml_url: xmlUrl,
                    user_id: scoreData.user_id
                })
                .select()
                .single();

            if (dbError) throw new Error(`Error creating score record: ${dbError.message}`);

            return score;
        } catch (error) {
            console.error('Error in ScoreService.create:', error);
            throw error;
        }
    }

    static async update(){
        
    }
}