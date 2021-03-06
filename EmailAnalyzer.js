COLOR_CODE = {
    "anger": "red",
    "joy": "yellow",
    "confident": "blue",
    "tentative": "grey",
    "sad": "brown",
    "analytical": "YellowGreen"
};

TONE_NOTES = {
    "anger": "You sound a bit angry here",
    "joy": "Someone's happy",
    "confident": "Yesssssss!, point, blank, periodt!",
    "tentative": "Speak up a bit",
    "sad": "Sounding a bit down there",
    "analytical": "Way to think it through!"
};

class EmailAnalyzer {
    constructor(analysisScheme) {
        this.analysisScheme = analysisScheme;
        EmailAnalyzer.analyzedText = "";
    }

    /**
     *   Returns color-coded version of text where the color is dependant on the
     *   tone of each sentence.
     *
     *   @param string[] setences
     *   @param object toneData An object containing the tone analysis of the text
     *                          of the email's body.
     *   @return string An html string representing the text of the body of the
     *                  email with highlighting applied on a per-sentence basis
     *                  based on the tone of each sentence.
     */
    getColoredText(sentences, toneData) {
        console.log(toneData);
        console.log("sentences: ");
        console.log(sentences);
        // Chrome Browser does not allow cursor to be placed outside of most
        // recently written to child node, so a 0-width character is used so
        // uncolored text can be written following the block of colored text
        // sent from the popup.

        if(!('sentences_tone' in toneData)) {
            let dominantToneIndex = this.getDominantTone(toneData['document_tone']['tones']);
            let dominantTone = toneData['document_tone']['tones'][dominantToneIndex]['tone_id'];
            let textColor = COLOR_CODE[dominantTone];
            let noteText = TONE_NOTES[dominantTone];
            let coloredSentence = `<span class="analyzedText" style="background-color:${textColor};">` +
                              sentences.join("") + '</span>' +
                              `<span class="toneNote">${noteText}</span>` + '\uFEFF';
            console.log("Single Case HTML string: " + coloredSentence);
            return coloredSentence;
        }

        let colorCodedText = "";
        let i = 0;
        for (; i < sentences.length && i < toneData['sentences_tone'].length; i++) {
            console.log("Sentence: " + sentences[i]);
            let sentenceToneData = toneData['sentences_tone'][i];
            let sentenceText = sentences[i];

            let coloredSentence = sentenceText + '\uFEFF';
            if (sentenceToneData['tones'].length > 0) {
                let dominantToneIndex = this.getDominantTone(sentenceToneData['tones']);
                let dominantTone = sentenceToneData['tones'][dominantToneIndex]['tone_id'];
                let textColor = COLOR_CODE[dominantTone];
                let noteText = TONE_NOTES[dominantTone];
                coloredSentence = `<span class="analyzedText" style="background-color:${textColor};">` +
                              sentenceText + '</span>' +
                              `<span class="toneNote">${noteText}</span>` + '\uFEFF';
            }

            colorCodedText = colorCodedText.concat(coloredSentence);
        }
        console.log(colorCodedText);

        return colorCodedText;
    }

    /**
     * Return index of tone with highest score from an array of tone scores.
     *
     * @param object[] toneScores An array of tone score objects containing
     *                            information about each tone including score,
     *                            id, and human-readable name.
     * @return integer An integer representing the index of the tone with the
     *                 highest score out of all tones contained in toneScores.
     */
     getDominantTone(toneScores) {
        if(toneScores.length == 0) {
            return "";
        }

        let dominantToneIndex = 0;
        let dominantToneScore = toneScores[0]['score'];
        for(let i = 1; i < toneScores.length; i++) {
            if(toneScores[i]['score'] > dominantToneScore) {
                dominantToneScore = toneScores[i]['score'];
                dominantToneIndex = i;
            }
        }

        return dominantToneIndex;
    }

    insertSpansToSplitSentences(htmlStr) {
    }

    /**
     * Returns version of an html string where all opening div tags have been
     * replaced with a span tag immediately followed by a line break tag and
     * closing div tags have been replaced with closing span tag.
     *
     * @param string htmlStr An html string.
     * @return string htmlStr, but with all occurrences of opening div tags
     *                replaced with opening span tags immediately followed by
     *                line break tags and all closing div tags are replaced by
     *                closing span tags.
     */
    replaceDivs(htmlStr) {
        // Handle first line which lacks surrounding div tags
        let pieceToTransform = htmlStr;
        let nonTransformedPiece = "";
        let secondLineStart = htmlStr.indexOf("<div>");
        if(secondLineStart > 0) {
            for(let i = 0; i < secondLineStart; i++) {
                nonTransformedPiece = nonTransformedPiece.concat(htmlStr.charAt(i));
            }
            pieceToTransform = htmlStr.substring(secondLineStart);
        }

        // Handle other lines which are enclosed in div tags
        return nonTransformedPiece +
           pieceToTransform.replace(/<div\><br\><\/div\>/g, '<span><br></span>')
                           .replace(/(<div\>)/g, '<span><br>')
                           .replace(/(<\/div\>)/g, '</span>')
                           .replace(/(!)/g, '!</span><span>')
                           .replace(/(\?)/g, '?</span><span>')
                           .replace(/(\.)/g, '.</span><span>')
                           .replace(/<span\><\/span\>/g, '');
    }

    /**
     * Split a string containing html markup into individual sentences where
     * sentences contain the html tags within which they are nested.  Self-closing
     * tags are tacked onto the sentences that immediately precede them.
     *
     * @param string aStr A html string.
     * @return array[String] An array of strings representing the sentences
     *                       contained in the input html string with containing
     *                       html tags, if any.  Self-closing html tags are
     *                       attached to the preceding sentence if there is one.
     */
    getStructuredSentences(aStr) {
        return aStr.match(/([<\>=\/, \"':;a-zA-Z0-9&\-]+)([.?!](((<\/)([a-zA-Z0-9]+)(\>))|(&nbsp;)|[ ]|(<br\>))*|($))/g);
    }

    async analyze(emailInfo) {
        // use analysis scheme to get mapping from sentences to tones
        await this.analysisScheme.getToneInfo(emailInfo.textWithoutMarkup);

        // superimpose color onto email text
        let textWithoutDivs = this.replaceDivs(emailInfo.textWithMarkup);
        console.log("Text without divs: " + textWithoutDivs);
        let structuredSentences = this.getStructuredSentences(textWithoutDivs);
        console.log("Structured sentences: " + structuredSentences);

        EmailAnalyzer.analyzedText = this.getColoredText(structuredSentences, APIBasedAnalysisScheme.toneInfo).replace(/<span\><\/span\>/g, '');
    }
}
