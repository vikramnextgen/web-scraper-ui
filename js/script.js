document.addEventListener('DOMContentLoaded', () => {
    const scraperForm = document.getElementById('scraperForm');
    const resultsContainer = document.getElementById('results');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const copyButton = document.getElementById('copyResults');
    const downloadButton = document.getElementById('downloadResults');
    const formatSelect = document.getElementById('formatSelect');

    // Store the last scraped data
    let lastScrapedData = null;

    scraperForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const url = document.getElementById('url').value;
        const customSelector = document.getElementById('selector').value;
        const selectedElements = Array.from(document.querySelectorAll('input[name="elements"]:checked'))
            .map(checkbox => checkbox.value);

        if (!url) {
            showError('Please enter a valid URL');
            return;
        }

        // Show loading state
        showLoading(true);
        clearResults();

        try {
            // In a real implementation, this would call your backend API
            // For demo purposes, we'll simulate a response
            const data = await simulateWebScraping(url, selectedElements, customSelector);
            lastScrapedData = data;
            displayResults(data);
        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
        }
    });

    copyButton.addEventListener('click', () => {
        if (!lastScrapedData) return;
        
        const format = formatSelect.value;
        const formattedData = formatData(lastScrapedData, format);
        
        navigator.clipboard.writeText(formattedData)
            .then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            })
            .catch(err => showError('Failed to copy to clipboard'));
    });

    downloadButton.addEventListener('click', () => {
        if (!lastScrapedData) return;
        
        const format = formatSelect.value;
        const formattedData = formatData(lastScrapedData, format);
        const blob = new Blob([formattedData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraped-data.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
    });

    function showLoading(show) {
        loadingSpinner.classList.toggle('hidden', !show);
    }

    function clearResults() {
        resultsContainer.innerHTML = '';
    }

    function showError(message) {
        resultsContainer.innerHTML = `<div class="error" style="color: var(--error-color);">${message}</div>`;
    }

    function displayResults(data) {
        const format = formatSelect.value;
        const formattedData = formatData(data, format);
        resultsContainer.innerHTML = `<pre>${escapeHtml(formattedData)}</pre>`;
    }

    function formatData(data, format) {
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return convertToCSV(data);
            case 'text':
                return convertToPlainText(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    function convertToCSV(data) {
        if (!data || Object.keys(data).length === 0) return '';
        
        let csv = '';
        // Add headers
        csv += Object.keys(data).join(',') + '\\n';
        
        // Add values
        const maxLength = Math.max(...Object.values(data).map(arr => arr.length));
        for (let i = 0; i < maxLength; i++) {
            const row = Object.values(data).map(arr => arr[i] || '').join(',');
            csv += row + '\\n';
        }
        
        return csv;
    }

    function convertToPlainText(data) {
        if (!data) return '';
        
        let text = '';
        for (const [key, values] of Object.entries(data)) {
            text += `=== ${key.toUpperCase()} ===\\n`;
            text += values.join('\\n') + '\\n\\n';
        }
        
        return text;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Simulate web scraping (in real implementation, this would be an API call)
    async function simulateWebScraping(url, elements, selector) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate successful scraping
        return {
            headings: [
                "Welcome to Example Site",
                "Featured Content",
                "Latest Articles"
            ],
            links: [
                "https://example.com/article1",
                "https://example.com/article2",
                "https://example.com/about"
            ],
            images: [
                "header-image.jpg",
                "featured-1.jpg",
                "featured-2.jpg"
            ],
            text: [
                "Welcome to our website!",
                "Check out our latest articles and updates.",
                "Stay informed with our newsletter."
            ]
        };
    }
});