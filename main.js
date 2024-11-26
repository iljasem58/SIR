let isListenerAttached = false;
let patterns = [];

function loadPatterns() {
    const url = chrome.runtime.getURL('patterns.json');
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load patterns.json');
            }
            return response.json();
        })
        .then(data => {
            patterns = data.patterns;
            console.log("Loaded patterns:", patterns);
        });
}

function showCustomModal(detectedPatterns, warningMessage = '') {
    let modal = document.getElementById('custom-modal');

    const modalMessage = document.getElementById('modal-message');

    if (detectedPatterns.length > 0) {
        modalMessage.innerHTML = `Your current input contains: <span class="sensitive-text" data-pattern="${detectedPatterns[0]}"><br>"${detectedPatterns.join(', ')}"</span><br><br>${warningMessage}`;
    }

    modal.style.display = 'block';
}

function attachInputListeners() {
    const inputFields = document.querySelectorAll("#prompt-textarea, rich-textarea .ql-editor");

    inputFields.forEach(inputField => {
        if (inputField && !isListenerAttached) {
            console.log("Contenteditable div found. Attaching listener.");
            isListenerAttached = true;

            inputField.addEventListener('input', function (event) {
                const inputValue = inputField.innerText;
                let detectedPatterns = [];
                let detectedWarningMessages = [];
                const ignoredPatterns = JSON.parse(localStorage.getItem('ignoredPatterns')) || [];

                patterns.forEach(pattern => {
                    const regex = new RegExp(pattern.regex, 'gi');
                    let match;

                    while ((match = regex.exec(inputValue)) !== null) {
                        if (!ignoredPatterns.includes(match[0])) {
                            if (!detectedPatterns.includes(match[0])) {
                                detectedPatterns.push(match[0]);
                                console.log(`Detected pattern: ${match[0]}`);
                            }
                            if (pattern.message) {
                                detectedWarningMessages.push(pattern.message);
                            }
                        }
                    }
                });

                if (detectedPatterns.length > 0) {
                    let warningMessage;
                    if (detectedWarningMessages.length > 1) {
                        warningMessage = `<span style="font-weight: bold;">Warning!</span> It is suggested to remove sensitive information from the input.`;
                    } else {
                        warningMessage = `<span style="font-weight: bold;">Warning!</span> ${detectedWarningMessages[0]}`;
                    }

                    showCustomModal(detectedPatterns, warningMessage);
                }
            });

            observer.disconnect();
        } else if (!contentEditableDiv) {
            console.log('Contenteditable div not yet present in the DOM');
        } else {
            console.log('Listener already attached, no need to attach again.');
        }
    });
}

const observer = new MutationObserver(() => {
    attachInputListeners();
});

observer.observe(document.body, { childList: true, subtree: true });

loadPatterns().then(() => {
    if (!localStorage.getItem('ignoredPatterns')) {
        localStorage.setItem('ignoredPatterns', JSON.stringify([]));
    }
    attachInputListeners();
});

window.addEventListener('load', loadModalHTML);