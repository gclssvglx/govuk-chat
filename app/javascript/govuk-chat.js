(function initialiseGOVUKChatJS() {
    // Used for debugging purposes
    console.log("GOVUK Chat JS loaded");

    var hasReceivedNewMessage = initialiseMessageState();

    // Set up mutation observer
    var target = document.querySelector("html");
    var config = { childList: true }
    var observer = new MutationObserver(function() {
        if(document.querySelectorAll(".govuk-chat-message").length > 1) {
            var chatContainer = document.querySelector(".govuk-chat-container");
            var messageCount = document.querySelectorAll(".govuk-chat-message").length;
            var latestMessage = document.querySelectorAll(".govuk-chat-message")[(messageCount - 2)];
            var newMessageReceived = hasReceivedNewMessage(messageCount);

            scrollToLatestMessage({
                chatContainer: chatContainer,
                latestMessage:latestMessage,
                newMessageReceived: newMessageReceived
            })

            if(document.querySelector(".govuk-chat-form") && newMessageReceived) {
                detectPIIOnSubmit();
                addTurboSubmitListeners();
            }
        } else if(document.querySelectorAll(".govuk-chat-message").length === 1) {
            detectPIIOnSubmit();
            addTurboSubmitListeners();
        }
    });

    observer.observe(target, config);
})();

function scrollToLatestMessage(params) {
    var headerHeight = getOuterHeight(document.querySelector(".govuk-header"));
    if(params.latestMessage.getBoundingClientRect().y - headerHeight > 0 && params.newMessageReceived) {
        params.chatContainer.scrollTop = params.latestMessage.getBoundingClientRect().y - headerHeight;
    }
}

function scrollToBottom(params) {
    params.loadingIndicator.scrollIntoView({
        behavior: "smooth"
    });
}

function initialiseMessageState() {
    var messageCount = 0;

    return function (messages) {
        var newMessageReceived = false;

        if(!messages) {
            messageCount = 0;
        }
        else if(messages > messageCount) {
            newMessageReceived = true;
            messageCount = messages;
        }

        return newMessageReceived
    }
}

function getOuterHeight(element) {
    var height = element.offsetHeight;
    var style = getComputedStyle(element);
    
    height += parseInt(style.marginBottom) + parseInt(style.marginTop);
    return height;
}

function detectPIIOnSubmit() {
    var label = document.querySelector('.govuk-chat-form label');
    var labelFor = label.getAttribute('for');
    var input = document.querySelector('[id=' + labelFor + ']');
    var submitBtn = document.querySelector("input[type='submit']");

    submitBtn.addEventListener('click', function(e) {
        var chatInput = document.getElementById("govuk-chat-input");
        var errorMessage = document.querySelector(".govuk-error-message");

        if(checkInputForPII(input.value).indexOf("[redacted]") !== -1) {
            chatInput.style.border = "2px solid #d4351c"
            errorMessage.style.display = "block";
            e.preventDefault();
        }
        else {
            errorMessage.style.display = "none";
            chatInput.style.border = "2px solid #0b0c0c"
        }
    })
}

function checkInputForPII(string) {
    var EMAIL_PATTERN = /[^\s=/?&#]+(?:@|%40)[^\s=/?&]+/g
    var CREDIT_CARD_PATTERN = /\b\d{13,16}\b/g
    var PHONE_NUMBER_PATTERN = /\b[\+]?[(]?\d{3}[)]?[-\s\.]?\d{3}[-\s\.]?\d{4,6}\b/g
    var NI_PATTERN = /\b[A-Za-z]{2}\s?([0-9 ]+){6,8}\s?[A-Za-z]\b/g

    var stripped = string.replace(EMAIL_PATTERN, '[redacted]')
    stripped = stripped.replace(CREDIT_CARD_PATTERN, '[redacted]')
    stripped = stripped.replace(PHONE_NUMBER_PATTERN, '[redacted]')
    stripped = stripped.replace(NI_PATTERN, '[redacted]')

    return stripped
}

function addTurboSubmitListeners() {
    document.addEventListener("turbo:submit-start", function() {
        document.querySelector(".govuk-chat-loading-indicator").style.display = "flex";

        scrollToBottom({
            loadingIndicator: document.querySelector(".govuk-chat-loading-indicator")
        })
    })
    
    document.addEventListener("turbo:submit-end", function() {
        document.querySelector(".govuk-chat-loading-indicator").style.display = "none";
    })
}
