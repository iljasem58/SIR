function loadModalHTML() {
    return fetch(chrome.runtime.getURL("warning_modal.html"))
        .then(response => response.text())
        .then(html => {
            let modalContainer = document.getElementById('modal-container');
            if (!modalContainer) {
                modalContainer = document.createElement('div');
                modalContainer.id = 'modal-container';
                document.body.appendChild(modalContainer);
            }

            modalContainer.innerHTML = html;

            document.getElementById('close-modal').onclick = () => {
                document.getElementById('custom-modal').style.display = 'none';
            };

            document.getElementById('ignore-modal').onclick = () => {
                const ignoredPatterns = JSON.parse(localStorage.getItem('ignoredPatterns')) || [];
                const currentPattern = document.querySelector('#modal-message .sensitive-text').dataset.pattern;

                if (currentPattern && !ignoredPatterns.includes(currentPattern)) {
                    ignoredPatterns.push(currentPattern);
                    localStorage.setItem('ignoredPatterns', JSON.stringify(ignoredPatterns));
                    console.log(`Pattern "${currentPattern}" added to ignored list.`);
                }
                document.getElementById('custom-modal').style.display = 'none';
            };
        })
        .catch(error => console.error('Error loading modal:', error));
}