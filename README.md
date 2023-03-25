## Token Swap Dex using 1inch

![My Remote Image](https://user-images.githubusercontent.com/32630862/227738512-e5c8d58b-29d4-4681-a722-9b052bb655ba.png)


The project includes 2 sub-projects. The nodejs API and the Fronend.

### Api folder

Includes the rest API node.js project. Here we use Moralis to return the latest token prices to frontend.

### Frontend folder

Includes the react.js project. This is where the magic happens. We connect users to MetaMask wallet and use the 1inch public API to swap the real tokens.

### Run the project

Clone this repo and do the following:

**API server**

1.  Inside the API directory create a .env file just like .env.example 
2.  go to moralis.io and signup and get an API key and set the MORALIS\_KEY inside .env
3.  Run “npm install” and then “node index.js” to run the server

**Frontend part**

Inside the frontend directory run “npm install” and then “npm run start”
