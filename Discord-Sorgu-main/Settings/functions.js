const config = require("./config");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getData(url) {

    try {

        let response = await fetch(url, {
            method: 'GET',
        });
    
        return await response.json();

    } catch (error) {
        console.log(error);
        return { success: false, message: "API çekilemedi"}
    }

}

module.exports = {
    getData
}