/* Extract words from notes. 
   Responsible for:
   - Cleaning the notes
   - Removing common words
   - Removing duplicates
   - Selecting useful words*/

export function extractWords(notes){
    const lines = notes.split(/\r?\n/);
    const uniqueWords = new Set();

    const definitionCues = [
        "means",
        "refers to",
        "is defined as",
        "are defined as",
        "is the process of",
        "is the property of",
        "describes",
        "ensures",
        "is when",
        "is the act of"
    ];

    const stopWords = new Set ([
        "THE", "AND", "FOR", "ARE", "NOT",
        "BUT", "ALL", "YOU", "ANY", "HER",
        "CAN", "WAS", "ONE", "OUR", "OUT",
        "THAT", "THIS", "FROM", "HAVE", "HAS",
        "WITH", "THEY", "THEIR", "THERE", "WERE",
        "THAN", "THEN", "USE", "USED", "IN",
        "ON", "OF", "OFF", "TO", "IS", "IT",
        "AS", "A", "AN", "BE", "BY", "OR",
        "IF", "AT", "WE", "HE", "SHE","I"
    ]);

    for(const line of lines){
        let text = line.replace(/^\s*\d+[\.\)]\s*/, "");

        const sentences = text.split(/(?<=[.!?])\s+/);

        for(const sentence of sentences){
            let term = "";

            if(sentence.includes(":")){
                term = sentence.split(":")[0];
            } else{
                const lowerSentence = sentence.toLowerCase();

                for(const cue of definitionCues){
                    const cueIndex = lowerSentence.indexOf(cue);

                    if(cueIndex !== -1){
                        term = sentence.substring(0, cueIndex);
                        break;
                    }
                }
            }

            if(!term){
                continue;
            }

            term = term.replace(/^(the term | the concept of | the word)\s+/i, "");

            const termWords = term.trim().split(/\s+/);
            term = termWords.slice(-3).join("");

            term = term.toUpperCase().replace(/[^A-Z]/g, "");

            if(term.length >= 4 && term.length <= 18 && !stopWords.has(term)){
                uniqueWords.add(term);
            }
        }
    }

    return [...uniqueWords].sort((a, b) => b.length - a.length);
}