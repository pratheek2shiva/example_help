class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);
        this.updateChatText(chatbox)
        textField.value = ''

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: "Bot", message: r.answer };
            if (r.card) {
                msg2.card = r.card;
            }
            this.messages.push(msg2);
            this.updateChatText(chatbox)
        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
        });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Bot")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
                if (item.card) {
                    html += '<div class="messages__item messages__item--visitor" id="adaptiveCard_' + index + '"></div>'
                }
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;

        // Render adaptive cards
        this.messages.slice().reverse().forEach((item, index) => {
            if (item.card) {
                const adaptiveCard = new AdaptiveCards.AdaptiveCard();
                adaptiveCard.parse(item.card);
                adaptiveCard.onExecuteAction = (action) => {
                    if (action instanceof AdaptiveCards.SubmitAction) {
                        this.handleAdaptiveCardSubmit(action.data);
                    }
                };
                const renderedCard = adaptiveCard.render();
                const cardContainer = document.getElementById('adaptiveCard_' + index);
                if (cardContainer) {
                    cardContainer.innerHTML = '';
                    cardContainer.appendChild(renderedCard);
                }
            }
        });
    }

    handleAdaptiveCardSubmit(data) {
        fetch('http://127.0.0.1:5000/process_card', {
            method: 'POST',
            body: JSON.stringify(data),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            let msg = { name: "Bot", message: r.response };
            this.messages.push(msg);
            this.updateChatText(this.args.chatBox);
        }).catch((error) => {
            console.error('Error:', error);
        });
    }
}

const chatbox = new Chatbox();
chatbox.display();