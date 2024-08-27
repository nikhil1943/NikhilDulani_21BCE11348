# NikhilDulani_21BCE11348
Hitwicket Software Developer Task 2024


The game is to be opened by 2 people with the localhost forwarded to another link that can be shared (use ngrok if needed).

The 2 users will be able to interact with the web app on the client side however the changes, unfortunately, will not be reflected on the other clients' system since there is a lack of proper integration.

Websocket communication has been implemented so the users can talk to each other via text.
Differentiation between players is red and blue and whichever player connects first is blue and the other is red (similar to white and black in chess).

When in the initial/deployment phase, click the button corresponding to the type of character/piece that is needed and any square on the row where the piece is desired to be placed.
For blue it will be the lowest row and for red it will be the highest row. In case pieces are attempted to be placed at squares that they are not supposed to be placed in then it will return an error.

A reset button is included to clear the orientation of the deployment and start anew.

Character movement, after starting, is wonky as it moves from left to right going through each character and direction is not relative but absolute on both boards (starting on the highest row the pieces will have to move backward instead of forward)

Turn based system has been implemented thus if user attempts to move out of turn they will be alerted.

Move history has not been implemented yet.

In case one of the users wins then an option to restart will be shown alongside a popup/alert that will inform the user that they won.

Includes a working and integrated chatbox for user communication.

Movement validation has been implemented thus illegal/invalid moves will not be allowed. However, it may bug and provide alerts such as "there is no unit" after a piece is moved.
