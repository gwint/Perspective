# Perspective
Chrome extension that utilizes IBM Watson's Tone Analyzer API to provide
feedback on the tone of the sentences comprising one's Google emails.

# How to Install
Head over [here](TBA) to install the extension.

# How to Use Perspective
1) Navigate to [Gmail](https://mail.google.com) and compose a new email
2) Write you your email.
3) Click the "Perspective" extension icon and two buttons will be visible: one
titled "Clear Highlighting" and another titled "Get Perspective".  Hit the
"Get Perspective" button and your email text will be highlighted according the
tone of its constituent parts.
4) Move your mouse over each sentence to read the associated tone description
5) Once you have looked at the feedback, hit the "Clear Highlighting" button
to remove all highligting, and feel free to either make changes to your email
or send it off.


#Known bugs
Sentences will sometimes disappear when the "Get Perspective" button gets hit.
This is because the IBM Watson Tone Analyzer API is delimiting the sentences
in an unexpected way.  For example, "I hate you!  I understand." will be
treated as a single sentence by the api, and will be analyzed as such while
the code currently expects that punctuation like periods or exclamation points
delimit the end of one sentence and the beginning of a new one.
