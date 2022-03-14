## Udemy voice

A chrome extension allows you to hear quiz questions automatically, to use voice command choose the answers and to navigate to the next/previous question.

### Getting started

1. Clone the repo locally
2. The root folder contains the `manifest.json` of the chrome extension. Follow [this tutorial](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/) to install the extension on your browser.

#### Hear the question

Whenever you go to the next question, you will hear it automatically. In order to repeat it, you can click on the _Speak_ button (next to the question number).

#### Voice commands

The chrome extension will constantly hear your voice (there is no need to click any button).

The following are the voice commands that you can use:
| Command | Description |
|-|-|
| `1`, `2`, etc.| Choose the first, second,... answer |
| `next question` | Go the next question |
| `skip question` | Skip to the next question |
| `back` | Go to the previous question |

### Next steps

Feel free to open an feature issue related to one of the following features in order to contribute and make sure you assign it to yourself:

- [ ] Stop the voice (reading the question) whenever the user is starting a voice command
- [ ] Package the extension
- [ ] Stop/Pause the read of a question
- [ ] Improve voice commands (use `one` or `first` to choose the first answer)
- [ ] Allow the user to choose the answer by saying it
- [ ] Display the voice commands (or the words being heard) to allow the user to see what's interpreted (Maybe use the `interimResults` mode)
