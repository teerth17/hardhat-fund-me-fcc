const { assert, expect } = require("chai")

const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let mockV3Aggregator
          let deployer
          const sendValue = ethers.utils.parseEther("1") //ethers.utils.parseEther("2") // 1000000000000000000
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture("all")
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", function () {
              it("sets the aggretor address correctly", async function () {
                  const response = await fundMe.s_priceFeed()
                  console.log("Address" + mockV3Aggregator.address)
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", function () {
              it("Fails if u dont send enough eth: ", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Value should be greater than 1 ether"
                  )
              })
              it("Updated the amount funded data structure", async () => {
                  // console.log(sendValue)
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_amountFunded(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds s_funders to array of s_funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.s_funders(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployBalance)
                          .toString(),
                      endingDeployBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple s_funders", async function () {
                  // arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployBalance =
                      await fundMe.provider.getBalance(deployer)

                  // ACT
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployBalance)
                          .toString(),
                      endingDeployBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.s_funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_amountFunded(accounts[i].address),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  // await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
                  //     "FundMe__NotOwner"
                  // )
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted
              })
          })
      })
