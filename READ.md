git pull

open terminal CNTL + J

cd LearnSolidity

Install Hardhat -> USING -> npm i hardhat -global
https://www.npmjs.com/package/hardhat

Install All Modules in Package.json
npm install --force

Compile The Enviroment
npx hardhat compile 

Run a local Etheruem(Hardhat) Node
npx hardhat node

Deploy a Conract (Token.sol)
npx hardhat run --network localhost scripts/token/deploy.ts