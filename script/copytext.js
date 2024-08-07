function copyText(elementId) {
    // Get the text from the element
    var copyText = document.getElementById(elementId).innerText;

    // Copy the text to the clipboard
    navigator.clipboard.writeText(copyText).catch(function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}
