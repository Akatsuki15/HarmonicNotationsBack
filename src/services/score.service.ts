import { supabase } from '../db/supabase';
import { Score } from '../models/score.model';
import pdfParse from 'pdf-parse';

export class ScoreService {
    private static async generateMusicXML(pdfContent: string, pdfBuffer: Buffer): Promise<string> {
        try {
            // Parse the PDF content
            const pdfData = await pdfParse(pdfBuffer);
            const text = pdfData.text;

            // Initialize MusicXML structure
            let musicXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
    <part-list>
        <score-part id="P1">
            <part-name>Music</part-name>
        </score-part>
    </part-list>
    <part id="P1">`;

            // Process the PDF text to extract musical information
            const lines = text.split('\n').filter(line => line.trim());
            let measureNumber = 1;
            let currentMeasure = '';
            let timeSignature = { beats: 4, beatType: 4 }; // Default time signature

            for (const line of lines) {
                // Skip empty lines or non-musical content
                if (!line.trim() || line.includes('Page')) continue;

                // Try to detect time signature
                const timeMatch = line.match(/(\d+)\/(\d+)/);
                if (timeMatch) {
                    timeSignature = {
                        beats: parseInt(timeMatch[1]),
                        beatType: parseInt(timeMatch[2])
                    };
                }

                // Start new measure on bar line or measure indicator
                if (line.includes('|') || line.includes('bar')) {
                    if (currentMeasure) {
                        musicXML += `
        <measure number="${measureNumber}">
            <attributes>
                <divisions>1</divisions>
                <time>
                    <beats>${timeSignature.beats}</beats>
                    <beat-type>${timeSignature.beatType}</beat-type>
                </time>
                <clef>
                    <sign>G</sign>
                    <line>2</line>
                </clef>
            </attributes>${currentMeasure}
        </measure>`;
                        measureNumber++;
                        currentMeasure = '';
                    }
                }

                // Parse musical notes and symbols
                const notes = line.match(/[A-G][#b]?\d?/g) || [];
                for (const note of notes) {
                    const step = note[0];
                    const octave = note.match(/\d/)?.[0] || '4';
                    const alter = note.includes('#') ? '1' : note.includes('b') ? '-1' : '0';
                    
                    // Determine note duration based on context
                    let duration = 1;
                    let type = 'quarter';
                    
                    if (line.includes('whole') || line.includes('semibreve')) {
                        duration = 4;
                        type = 'whole';
                    } else if (line.includes('half') || line.includes('minim')) {
                        duration = 2;
                        type = 'half';
                    } else if (line.includes('eighth') || line.includes('quaver')) {
                        duration = 0.5;
                        type = 'eighth';
                    }
                    
                    currentMeasure += `
            <note>
                <pitch>
                    <step>${step}</step>
                    ${alter !== '0' ? `<alter>${alter}</alter>` : ''}
                    <octave>${octave}</octave>
                </pitch>
                <duration>${duration}</duration>
                <type>${type}</type>
            </note>`;
                }

                // Handle rests
                if (line.includes('rest') || line.includes('R')) {
                    currentMeasure += `
            <note>
                <rest/>
                <duration>1</duration>
                <type>quarter</type>
            </note>`;
                }
            }

            // Add the last measure if there's any content
            if (currentMeasure) {
                musicXML += `
        <measure number="${measureNumber}">
            <attributes>
                <divisions>1</divisions>
                <time>
                    <beats>${timeSignature.beats}</beats>
                    <beat-type>${timeSignature.beatType}</beat-type>
                </time>
                <clef>
                    <sign>G</sign>
                    <line>2</line>
                </clef>
            </attributes>${currentMeasure}
        </measure>`;
            }

            // Close the MusicXML structure
            musicXML += `
    </part>
</score-partwise>`;

            return musicXML;
        } catch (error) {
            console.error('Error generating MusicXML:', error);
            throw new Error('Failed to generate MusicXML from PDF content');
        }
    }

    private static async generateBasicMusicXML(pdfBuffer: Buffer): Promise<string> {
        try {
            const pdfData = await pdfParse(pdfBuffer);
            const text = pdfData.text;
            
            // Initialize basic MusicXML structure
            let musicXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
    <part-list>
        <score-part id="P1">
            <part-name>Music</part-name>
        </score-part>
    </part-list>
    <part id="P1">`;

            // Add a basic measure with a whole note
            musicXML += `
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
        </measure>`;

            // Close the MusicXML structure
            musicXML += `
    </part>
</score-partwise>`;

            return musicXML;
        } catch (error) {
            console.error('Error in fallback MusicXML generation:', error);
            throw new Error('Failed to generate MusicXML from PDF content');
        }
    }

    static async getById(id: string) {
        try {
            const { data: score, error } = await supabase
                .from('Scores')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw new Error(`Error fetching score: ${error.message}`);
            if (!score) throw new Error('Score not found');

            return score;
        } catch (error) {
            console.error('Error in ScoreService.getById:', error);
            throw error;
        }
    }

    static async getAllMyScores(user_id: string) {
        try {
            const { data: scores, error } = await supabase
                .from('Scores')
                .select('*')
                .eq('user_id', user_id)
                .order('created_at', { ascending: false });

            if (error) throw new Error(`Error fetching scores: ${error.message}`);

            return scores;
        } catch (error) {
            console.error('Error al obtener las partituras:', error);
            throw error;
        }
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

            // 2. Generar MusicXML a partir del PDF usando el nuevo método
            const musicXmlContent = await this.generateMusicXML('', pdfFile.buffer);

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

    static async update(id: string, scoreData: Partial<Score>, pdfFile?: Express.Multer.File) {
        try {
            let updateData: Partial<Score> = { ...scoreData };

            // Si se proporciona un nuevo archivo PDF, actualizarlo
            if (pdfFile) {
                // 1. Subir nuevo PDF a Supabase Storage
                const pdfFileName = `scores/${Date.now()}_${pdfFile.originalname}`;
                const { data: pdfData, error: pdfError } = await supabase.storage
                    .from('scores')
                    .upload(pdfFileName, pdfFile.buffer, {
                        contentType: 'application/pdf',
                        cacheControl: '3600'
                    });

                if (pdfError) throw new Error(`Error uploading PDF: ${pdfError.message}`);

                // 2. Generar nuevo MusicXML
                const pdfContent = await pdfParse(pdfFile.buffer);
                const musicXmlContent = await this.generateMusicXML(pdfContent.text, pdfFile.buffer);

                // 3. Subir nuevo MusicXML
                const xmlFileName = `scores/${Date.now()}_${pdfFile.originalname.replace('.pdf', '.musicxml')}`;
                const { data: xmlData, error: xmlError } = await supabase.storage
                    .from('scores')
                    .upload(xmlFileName, Buffer.from(musicXmlContent), {
                        contentType: 'application/vnd.recordare.musicxml+xml',
                        cacheControl: '3600'
                    });

                if (xmlError) throw new Error(`Error uploading MusicXML: ${xmlError.message}`);

                // 4. Obtener nuevas URLs públicas
                const { data: { publicUrl: pdfUrl } } = supabase.storage
                    .from('scores')
                    .getPublicUrl(pdfFileName);

                const { data: { publicUrl: xmlUrl } } = supabase.storage
                    .from('scores')
                    .getPublicUrl(xmlFileName);

                updateData.pdf_url = pdfUrl;
                updateData.musicxml_url = xmlUrl;
            }

            // 5. Actualizar registro en la base de datos
            const { data: score, error: dbError } = await supabase
                .from('Scores')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (dbError) throw new Error(`Error updating score: ${dbError.message}`);
            if (!score) throw new Error('Score not found');

            return score;
        } catch (error) {
            console.error('Error in ScoreService.update:', error);
            throw error;
        }
    }
}