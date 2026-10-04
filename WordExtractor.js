/* Extract words from notes. 
   Responsible for:
   - Cleaning the notes
   - Removing common words
   - Removing duplicates
   - Selecting useful words*/

export function extractWords(notes){
    notes = notes.toUpperCase();

    notes = notes.replace(/[^A-Z\s]/g, "");

    const allWords = notes.split(/\s+/);

    const stopWords = new Set ([
        "THE",
        "AND",
        "FOR",
        "ARE",
        "NOT",
        "BUT",
        "ALL",
        "YOU",
        "ANY",
        "HER",
        "CAN",
        "WAS",
        "ONE",
        "OUR",
        "OUT",
        "THAT",
        "THIS",
        "FROM",
        "HAVE",
        "HAS",
        "WITH",
        "THEY",
        "THEIR",
        "THERE",
        "WERE",
        "THAN",
        "THEN",
        "USE",
        "USED",
        "USED",
        "IN",
        "ON",
        "OF",
        "OFF",
        "TO",
        "IS",
        "IT",
        "AS",
        "A",
        "AN",
        "BE",
        "BY",
        "OR",
        "IF",
        "AT",
        "WE",
        "HE",
        "SHE",
        "I"
    ]);

    const uniqueWords = [...new Set(allWords)];

    let usefulWords = uniqueWords.filter(word => {
        return(word.length >= 4 && word.length <= 18 && !stopWords.has(word));
    });

    usefulWords.sort((a, b) => b.length - a.length);

    return usefulWords;
}