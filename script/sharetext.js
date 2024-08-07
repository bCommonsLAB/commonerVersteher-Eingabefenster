function shareText(elementId) {
    // Get the text from the element
    var shareText = document.getElementById(elementId).innerText;

    // Create a mailto link
    var mailtoLink = "mailto:?subject=" + encodeURIComponent("Shared Text") + "&body=" + encodeURIComponent(shareText);

    // Open the mailto link to open the default email client with a new email
    window.location.href = mailtoLink;
}
