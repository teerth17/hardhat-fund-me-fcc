// there are certain ways to write functions

const { network } = require("hardhat")

//method 1
// function deployFunc(hre) {
//     console.log("hi..")
//     hre.getNamedAccounts
// }

// module.exports.default = deployFunc

// method 2
// can access getNamedAccounts and deployments from hre in 2 ways
// 1
// module.exports = async (hre) => {
//     const{getNamedAccounts,deployments} = hre;
// }
// 2

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
// const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("ethUsdPrice" + ethUsdPriceFeedAddress)
    // const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("FundMe deplyed at " + fundMe.address)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    log("--------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
