# Tic-Tac-Toe as a NEAR contract

## Install dependencies
```
yarn
```

## Build and Deploy the contract
```
npx asb
near dev-deploy ./out/main.wasm
# save the contract id in your clipboard
```

## Run the game
**Create a game**
```
near call <contract-id> createGame --account_id <account-id> --amount 5
# save the game id in your clipboard and send it to your friend
```

**Join a game (player 2)**
```
near call <contract-id> joinGame '{"gameId": <game-id>}' --account_id <account-id> --amount 5
```

**Play the game**
```
near call <contract-id> play '{"gameId": <game-id>, "lin": 2}' --account_id <account-id>
```

**View board**
```
near call <contract-id> viewBoard '{"gameId": <game-id>}' --account_id <account-id>
```
