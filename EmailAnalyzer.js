function getColoredText(sentences, toneData) {
    console.log(toneData);
    console.log("sentences: ");
    console.log(sentences);
    // Chrome Browser does not allow cursor to be placed outside of most
    // recently written to child node, so a 0-width character is used so
    // uncolored text can be written following the block of colored text
    // sent from the popup.

    if(!('sentences_tone' in toneData)) {
        let dominantToneIndex = getDominantTone(toneData['document_tone']['tones']);
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
            let dominantToneIndex = getDominantTone(sentenceToneData['tones']);
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

function getDominantTone(toneScores) {
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

function replaceDivs(htmlStr) {
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

function getStructuredSentences(aStr) {
    return aStr.match(/([<\>=\/, \"':;a-zA-Z0-9&\-]+)([.?!](((<\/)([a-zA-Z0-9]+)(\>))|(&nbsp;)|[ ]|(<br\>))*|($))/g);
}

async function analyze(emailInfo) {
    // use analysis scheme to get mapping from sentences to tones
    await this.analysisScheme.getToneInfo(emailInfo.textWithoutMarkup);

    // superimpose color onto email text
    let textWithoutDivs = this.replaceDivs(emailInfo.textWithMarkup);
    console.log("Text without divs: " + textWithoutDivs);
    let structuredSentences = this.getStructuredSentences(textWithoutDivs);
    console.log("Structured sentences: " + structuredSentences);

    EmailAnalyzer.analyzedText = this.getColoredText(structuredSentences, APIBasedAnalysisScheme.toneInfo).replace(/<span\><\/span\>/g, '');
}

