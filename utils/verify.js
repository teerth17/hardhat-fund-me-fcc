const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying Contract")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verfoed!!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }

// module.exports = async (contractAddress, args) => {
//     console.log("Verifying Contract")
//     try {
//         await run("verify:verify", {
//             address: contracrAddress,
//             constructorAddress: args,
//         })
//     } catch (e) {
//         if (e.message.toLowerCase().includes("already verified")) {
//             console.log("Already Verfoed!!")
//         } else {
//             console.log(e)
//         }
//     }
// }
